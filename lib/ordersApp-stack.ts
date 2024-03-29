import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

interface OrdersAppStackProps extends cdk.StackProps {
  productsDdb: dynamodb.Table;
}

export class OrdersAppStack extends cdk.Stack {
  readonly ordersHandler: lambdaNodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: OrdersAppStackProps) {
    super(scope, id, props);

    const ordersDdb = new dynamodb.Table(this, 'OrdersDdb', {
      tableName: 'orders',
      partitionKey: {
        name: 'pk',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'sk',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
    });

    //Orders Layer
    const ordersLayerArn = ssm.StringParameter.valueForStringParameter(
      this,
      'OrdersLayerVersionArn',
    );
    const ordersLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      'OrdersLayerVersionArn',
      ordersLayerArn,
    );

    //Products Layer
    const productsLayerArn = ssm.StringParameter.valueForStringParameter(
      this,
      'ProductsLayerVersionArn',
    );
    const productsLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      'ProductsLayerVersionArn',
      productsLayerArn,
    );

    this.ordersHandler = new lambdaNodejs.NodejsFunction(
      this,
      'OrdersHandler',
      {
        functionName: 'OrdersFunction',
        entry: 'lambda/orders/ordersFunction.ts',
        handler: 'handler',
        memorySize: 128,
        timeout: cdk.Duration.seconds(2),
        bundling: {
          minify: true,
          sourceMap: false,
        },
        environment: {
          EVENTS_DDB: props.productsDdb.tableName,
          ORDERS_DDB: ordersDdb.tableName,
        },
        layers: [ordersLayer, productsLayer],
        tracing: lambda.Tracing.ACTIVE,
        insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0,
      },
    );

    ordersDdb.grantReadWriteData(this.ordersHandler);
    //only read for products table
    props.productsDdb.grantReadData(this.ordersHandler);
  }
}
