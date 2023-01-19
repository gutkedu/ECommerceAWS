#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductsAppStack } from '../lib/productsApp-stack';
import { EcommerceApiStack } from '../lib/ecommerceApi-stack';

const app = new cdk.App();

const env: cdk.Environment = {
  account: '683803546978',
  region: 'us-east-1',
};

const tags = {
  cost: 'ECommerce',
  team: 'gutkedu',
};

const productsAppStack = new ProductsAppStack(app, 'ProductsApp', {
  env,
  tags,
});

const ecommerceApiStack = new EcommerceApiStack(app, 'EcommerceApi', {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  env,
  tags,
});

ecommerceApiStack.addDependency(productsAppStack);
