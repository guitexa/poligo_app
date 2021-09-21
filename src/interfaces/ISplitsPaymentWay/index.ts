import { IPaymentMethod } from '../index';
import ISplitPaymentWay from '../ISplitPaymentWay';

// Interface do parcelamento do pedido
export default interface ISplitsPaymentWay {
  payment_way?: string;
  splits?: ISplitPaymentWay[];
  enter_due_date?: string | null;
  formatted_enter_due_date?: string;
  enter_value?: string;
  formatted_enter_value?: string;
  enter_payment_method?: IPaymentMethod | null;
  splits_quantity: number;
  split_due_date?: string | null;
  formatted_split_due_date?: string;
  split_value: number;
  formatted_split_value?: string;
  split_payment_method?: IPaymentMethod | null;
}
