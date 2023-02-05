import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { v4 as uuidV4 } from 'uuid';

export interface Product {
  id: string;
  productName: string;
  code: string;
  price: number;
  model: string;
}

export class ProductRepository {
  private ddbClient: DocumentClient;
  private productsDdb: string;

  constructor(ddbClient: DocumentClient, productsDdb: string) {
    this.ddbClient = ddbClient;
    this.productsDdb = productsDdb;
  }

  async getAllProducts(): Promise<Product[]> {
    const result = await this.ddbClient
      .scan({ TableName: this.productsDdb })
      .promise();
    return result.Items as Product[];
  }

  async getProductById(productId: string): Promise<Product> {
    const result = await this.ddbClient
      .get({
        TableName: this.productsDdb,
        Key: { id: productId },
      })
      .promise();

    if (result.Item) {
      return result.Item as Product;
    } else {
      throw new Error(`Product with id ${productId} not found`);
    }
  }

  async create(product: Product): Promise<Product> {
    product.id = uuidV4();
    const createdProduct = await this.ddbClient.put({
      TableName: this.productsDdb,
      Item: product,
    });
    return product;
  }

  async deleteById(productId: string): Promise<Product> {
    const data = await this.ddbClient
      .delete({
        TableName: this.productsDdb,
        Key: { id: productId },
        ReturnValues: 'ALL_OLD',
      })
      .promise();

    if (data.Attributes) {
      return data.Attributes as Product;
    } else {
      throw new Error(`Product with id ${productId} not found`);
    }
  }

  async updateProduct(
    productId: string,
    productInput: Product,
  ): Promise<Product> {
    const data = await this.ddbClient
      .update({
        TableName: this.productsDdb,
        Key: { id: productId },
        ReturnValues: 'UPDATED_NEW',
        ConditionExpression: 'attribute_exists(id)',
        UpdateExpression:
          'set productName = :n, code = :c, price = :p, model = :m',
        ExpressionAttributeValues: {
          ':n': productInput.productName,
          ':c': productInput.code,
          ':p': productInput.price,
          ':m': productInput.model,
        },
      })
      .promise();

    data.Attributes!.id = productId;
    return data.Attributes as Product;
  }
}
