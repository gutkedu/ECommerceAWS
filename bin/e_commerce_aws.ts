#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductsAppStack } from '../lib/productsApp-stack';
import { ECommerceApiStack } from '../lib/ecommerceApi-stack';
import { ProductsAppLayersStack } from '../lib/productsAppLayers-stack';

const app = new cdk.App();

const env: cdk.Environment = {
  account: '683803546978',
  region: 'us-east-1',
};

const tags = {
  cost: 'ECommerce',
  team: 'gutkedu',
};

const productsAppLayersStack = new ProductsAppLayersStack(
  app,
  'ProductsAppLayers',
  {
    env,
    tags,
  },
);

const productsAppStack = new ProductsAppStack(app, 'ProductsApp', {
  env,
  tags,
});
productsAppStack.addDependency(productsAppLayersStack);

const eCommerceApiStack = new ECommerceApiStack(app, 'ECommerceApi', {
  env,
  tags,
  productsFetchHandler: productsAppStack.productsFetchHandler,
  productsAdminHandler: productsAppStack.productsAdminHandler,
});
eCommerceApiStack.addDependency(productsAppStack);
