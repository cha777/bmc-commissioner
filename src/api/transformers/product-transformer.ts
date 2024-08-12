import type { RecordModel } from 'pocketbase';
import type { Product } from '@/types/product';

export class ProductTransformer {
  static transform(apiProduct: RecordModel): Product {
    return {
      id: apiProduct.id,
      name: apiProduct.name,
      price: apiProduct.price,
      updated: new Date(apiProduct.updated),
    };
  }
}
