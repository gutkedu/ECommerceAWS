import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { Product, ProductRepository } from '/opt/nodejs/productsLayer';

const productsDdb = process.env.PRODUCTS_DDB!;
const ddbClient = new DynamoDB.DocumentClient();
const productRepository = new ProductRepository(ddbClient, productsDdb);

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod;
  const lambdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;

  console.log(
    `API GATEWAY REQUEST ID: ${apiRequestId} - LAMBDA REQUEST ID: ${lambdaRequestId}`,
  );

  if (event.resource === '/products') {
    console.log('POST /products');
    const product = JSON.parse(event.body!) as Product;
    const createdProduct = await productRepository.create(product);
    return {
      statusCode: 201,
      body: JSON.stringify(createdProduct),
    };
  } else if (event.resource === '/products/{id}') {
    const productId = event.pathParameters!.id as string;

    if (method === 'PUT') {
      console.log(`PUT /products/{${productId}}`);
      const product = JSON.parse(event.body!) as Product;
      try {
        const updatedProduct = await productRepository.updateProduct(
          productId,
          product,
        );
        return {
          statusCode: 200,
          body: JSON.stringify(updatedProduct),
        };
      } catch (ConditionalCheckFailedException) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: `Product with id ${productId} does not exist`,
          }),
        };
      }
    } else if (method === 'DELETE') {
      console.log(`DELETE /products/{${productId}}`);
      try {
        const deletedProduct = await productRepository.deleteById(productId);
        return {
          statusCode: 200,
          body: JSON.stringify(deletedProduct),
        };
      } catch (error) {
        console.error((<Error>error).message);
        return {
          statusCode: 404,
          body: JSON.stringify({ message: (<Error>error).message }),
        };
      }
    }
  }
  return {
    statusCode: 400,
    body: JSON.stringify({ message: 'bad request' }),
  };
}
