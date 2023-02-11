#!/usr/bin/env node
import 'source-map-support/register';
import { App, Environment } from 'aws-cdk-lib';
import { ProductsAppStack } from '../lib/productsApp-stack';
import { ECommerceApiStack } from '../lib/ecommerceApi-stack';
import { ProductsAppLayersStack } from '../lib/productsAppLayers-stack';
import { EventsDdbStack } from 'lib/eventsDdb-stack';

const app = new App();

const env: Environment = {
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

const eventsDdbStack = new EventsDdbStack(app, 'EventsDdb', {
  env,
  tags,
});

const productsAppStack = new ProductsAppStack(app, 'ProductsApp', {
  eventsDdb: eventsDdbStack.table,
  env,
  tags,
});
productsAppStack.addDependency(productsAppLayersStack);
productsAppStack.addDependency(eventsDdbStack);

const eCommerceApiStack = new ECommerceApiStack(app, 'ECommerceApi', {
  env,
  tags,
  productsFetchHandler: productsAppStack.productsFetchHandler,
  productsAdminHandler: productsAppStack.productsAdminHandler,
});
eCommerceApiStack.addDependency(productsAppStack);
