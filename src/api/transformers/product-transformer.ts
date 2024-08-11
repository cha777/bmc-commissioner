import { Product } from '@/types/product';
import { RecordModel } from 'pocketbase';

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
