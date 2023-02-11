export enum ProductEventType {
  CREATED = 'CREATED_PRODUCT',
  UPDATED = 'UPDATED_PRODUCT',
  DELETED = 'DELETED_PRODUCT',
}

export interface ProductEvent {
  requestId: string;
  eventType: ProductEventType;
  productId: string;
  productCode: string;
  productPrice: number;
  email: string;
}
