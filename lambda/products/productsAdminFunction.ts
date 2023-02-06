import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import DynamoDB = require('aws-sdk/clients/dynamodb');
import {
  Product,
  ProductRepository,
} from './layers/productsLayer/nodejs/productRepository';

const productsDdb = process.env.PRODUCTS_DDB!;
const ddbClient = new DynamoDB.DocumentClient();
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

      return {
        statusCode: 201,
        body: JSON.stringify(productCreated, null, 2),
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
        return {
          statusCode: 200,
          body: JSON.stringify(productUpdated, null, 2),
        };
      } catch (error) {
        console.error((error as Error).message);

        return {
          statusCode: 404,
          body: JSON.stringify(
            {
              message: 'Product not found',
            },
            null,
            2,
          ),
        };
      }
    }

    if (method === 'DELETE') {
      try {
        const product = await productRepository.deleteById(productId);
        return {
          statusCode: 200,
          body: JSON.stringify(product, null, 2),
        };
      } catch (error) {
        console.error((error as Error).message);

        return {
          statusCode: 404,
          body: JSON.stringify(
            {
              message: (error as Error).message,
            },
            null,
            2,
          ),
        };
      }
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify(
      {
        message: 'Bad Request',
      },
      null,
      2,
    ),
  };
}
