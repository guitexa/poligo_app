import { IPaymentMethod } from '../index';

// Interface do parcelamento do pedido
export default interface ISplitPaymentWay {
  id?: string;
  split_number?: string;
  payment_way?: string;
  split_value: number;
  split_due_date?: Date | null;
  formatted_split_due_date?: string | null;
  payment_method?: IPaymentMethod | null;
}
