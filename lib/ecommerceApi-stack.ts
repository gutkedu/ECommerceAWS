import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cwLogs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

interface ECommerceApiStackProps extends cdk.StackProps {
  productsFetchHandler: lambdaNodeJs.NodejsFunction;
  productsAdminHandler: lambdaNodeJs.NodejsFunction;
}

export class EcommerceApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ECommerceApiStackProps) {
    super(scope, id, props);

    const logGroup = new cwLogs.LogGroup(this, 'ECommerceApiLogs');

    const api = new apiGateway.RestApi(this, 'ECommerceApi', {
      restApiName: 'ECommerceApi',
      cloudWatchRole: true,
      deployOptions: {
        accessLogDestination: new apiGateway.LogGroupLogDestination(logGroup),
        accessLogFormat: apiGateway.AccessLogFormat.jsonWithStandardFields({
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          caller: true,
          user: true,
        }),
      },
    });

    // Integrations
    const productsFetchIntegration = new apiGateway.LambdaIntegration(
      props.productsFetchHandler,
    );
    const productsAdminIntegration = new apiGateway.LambdaIntegration(
      props.productsAdminHandler,
    );

    // Resources
    const productsFetchResource = api.root.addResource('products');
    const productsIdResource = productsFetchResource.addResource('{id}');

    // GET /products
    productsFetchResource.addMethod('GET', productsFetchIntegration);

    // GET /products/{id}
    productsIdResource.addMethod('GET', productsFetchIntegration);

    // POST /products
    productsFetchResource.addMethod('POST', productsAdminIntegration);

    // PUT /products/{id}
    productsIdResource.addMethod('PUT', productsAdminIntegration);

    // DELETE /products/{id}
    productsIdResource.addMethod('DELETE', productsAdminIntegration);
  }
}
