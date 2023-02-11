import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Code, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export class ProductsAppLayersStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const productsLayers = new LayerVersion(this, 'ProductsLayer', {
      code: Code.fromAsset('lambda/products/layers/productsLayer'),
      compatibleRuntimes: [Runtime.NODEJS_14_X],
      layerVersionName: 'ProductsLayers',
      removalPolicy: RemovalPolicy.RETAIN,
    });
    new StringParameter(this, 'ProductsLayerVersionArn', {
      parameterName: 'ProductsLayerVersionArn',
      stringValue: productsLayers.layerVersionArn,
    });

    const productEventsLayer = new LayerVersion(this, 'ProductEventsLayer', {
      code: Code.fromAsset('lambda/products/layers/productEventsLayer'),
      compatibleRuntimes: [Runtime.NODEJS_14_X],
      layerVersionName: 'ProductEventsLayer',
      removalPolicy: RemovalPolicy.RETAIN,
    });
    new StringParameter(this, 'ProductEventsLayerVersionArn', {
      parameterName: 'ProductEventsLayerVersionArn',
      stringValue: productEventsLayer.layerVersionArn,
    });
  }
}
