import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { DynamoDB, Lambda } from 'aws-sdk';
import { ProductEvent, ProductEventType } from '/opt/nodejs/productEventsLayer';
import {
  Product,
  ProductRepository,
} from './layers/productsLayer/nodejs/productRepository';
import { captureAWS } from 'aws-xray-sdk';

captureAWS(require('aws-sdk'));

const productsDdb = process.env.PRODUCTS_DDB!;
const productEventsFunctionName = process.env.PRODUCT_EVENTS_FUNCTION_NAME!;

const ddbClient = new DynamoDB.DocumentClient();
const lambdaClient = new Lambda();

const productRepository = new ProductRepository(ddbClient, productsDdb);

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> {
  const lambdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;

  const method = event.httpMethod;

  console.log(
    `API GATEWAY REQUEST ID: ${apiRequestId} - LAMBDA REQUEST ID: ${lambdaRequestId}`,
  );

  if (event.resource === '/products') {
    if (method === 'POST') {
      const product = (await JSON.parse(event.body!)) as Product;
      const productCreated = await productRepository.create(product);

      const response = await sendProductEvent(
        productCreated,
        ProductEventType.CREATED,
        'emailqualquer.created@email.com', // TODO: use real email
        lambdaRequestId,
      );
      console.log(response);

      return {
        statusCode: 201,
        body: JSON.stringify(productCreated),
      };
    }
  }

  if (event.resource === '/products/{id}') {
    const productId = event.pathParameters!.id as string;

    if (method === 'PUT') {
      const product = (await JSON.parse(event.body!)) as Product;

      try {
        const productUpdated = await productRepository.updateProduct(
          productId,
          product,
        );

        const response = await sendProductEvent(
          productUpdated,
          ProductEventType.UPDATED,
          'emailqualquer.updated@email.com', // TODO: use real email
          lambdaRequestId,
        );
        console.log(response);

        return {
          statusCode: 200,
          body: JSON.stringify(productUpdated),
        };
      } catch (error) {
        console.error((error as Error).message);

        return {
          statusCode: 404,
          body: JSON.stringify({
            message: 'Product not found',
          }),
        };
      }
    }

    if (method === 'DELETE') {
      try {
        const product = await productRepository.deleteById(productId);

        const response = await sendProductEvent(
          product,
          ProductEventType.DELETED,
          'emailqualquer.deleted@email.com', // TODO: use real email
          lambdaRequestId,
        );
        console.log(response);

        return {
          statusCode: 200,
          body: JSON.stringify(product),
        };
      } catch (error) {
        console.error((error as Error).message);

        return {
          statusCode: 404,
          body: JSON.stringify({
            message: (error as Error).message,
          }),
        };
      }
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      message: 'Bad Request',
    }),
  };
}

async function sendProductEvent(
  product: Product,
  eventType: ProductEventType,
  email: string,
  lambdaRequestId: string,
): Promise<Lambda.InvocationResponse> {
  const event: ProductEvent = {
    email,
    eventType,
    productCode: product.code,
    productId: product.id,
    productPrice: product.price,
    requestId: lambdaRequestId,
  };

  return lambdaClient
    .invoke({
      FunctionName: productEventsFunctionName,
      Payload: JSON.stringify(event),
      InvocationType: 'RequestResponse',
    })
    .promise();
}
