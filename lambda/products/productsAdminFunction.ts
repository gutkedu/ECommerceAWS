import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';

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
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'hello from post products' }),
    };
  } else if (event.resource === '/products/{id}') {
    const productId = event.pathParameters!.id as string;

    if (method === 'PUT') {
      console.log(`PUT /products/{${productId}}`);
      return {
        statusCode: 200,
        body: `hello from PUT /products/{${productId}}`,
      };
    } else if (method === 'DELETE') {
      console.log(`DELETE /products/{${productId}}`);
      return {
        statusCode: 200,
        body: `hello from DELETE /products/{${productId}}`,
      };
    }
  }
  return {
    statusCode: 400,
    body: JSON.stringify({ message: 'bad request' }),
  };
}
