import { IProduct } from '../index';

// Interface do order_product
export default interface IOrderProduct {
  id: string;
  product: IProduct;
  product_description: string;
  product_value: string;
  product_payment_type?: 'Parcelado' | 'Recorrente' | '';
  created_at: string;
}
