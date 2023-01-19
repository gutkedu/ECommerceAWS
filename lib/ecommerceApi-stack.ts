import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cwLogs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

interface ECommerceApiStackProps extends cdk.StackProps {
  productsFetchHandler: lambdaNodeJs.NodejsFunction;
}

export class EcommerceApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ECommerceApiStackProps) {
    super(scope, id, props);

    const api = new apiGateway.RestApi(this, 'ECommerceApi', {
      restApiName: 'ECommerceApi',
    });

    const productsFetchIntegration = new apiGateway.LambdaIntegration(
      props.productsFetchHandler,
    );
    // "/products resource"
    const productsFetchResource = api.root.addResource('products');
    productsFetchResource.addMethod('GET', productsFetchIntegration);
  }
}
