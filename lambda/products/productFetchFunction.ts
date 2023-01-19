import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';

export async function handler(
  event: APIGatewayProxyEvent,
  _context: Context,
): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod;

  if (event.resource === '/products') {
    if (method === 'GET') {
      console.log('GET /products');
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'hello from get products' }),
      };
    }
  }
  return {
    statusCode: 400,
    body: JSON.stringify({ message: 'bad request' }),
  };
}
