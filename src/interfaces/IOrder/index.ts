import { IPaymentMethod, ICompany, IOrderProduct, IUser } from '../index';
import ISplitPaymentWay from '../ISplitPaymentWay';

// Interface do pedido
export default interface IOrder {
  id: string;
  order_number: number;
  status_order:
    | 'Rascunho'
    | 'Aguardando'
    | 'Reprovado'
    | 'Aprovado'
    | 'Cancelado'
    | string
    | unknown;
  approved_at?: string | null;
  formatted_approved_at?: string;
  delivery_conditions?: string;
  technical_obs?: string;
  requested_delivery_date?: string | null;
  formatted_requested_delivery_date?: string;
  delivery_date?: string | null;
  formatted_delivery_date?: string;
  status_delivery?:
    | 'Aguardando'
    | 'Agendado'
    | 'Execução'
    | 'Concluído'
    | 'Entregue'
    | 'Pendência'
    | 'Cancelado'
    | unknown;
  payment_way?: '' | 'À vista' | 'Faturado' | 'Parcelado' | unknown;
  payment_method?: IPaymentMethod | null;
  due_date?: string | null;
  formatted_due_date?: string;
  status_billing?: '' | 'Aguardando' | 'Faturado' | 'Cancelado' | unknown;
  status_payment?: 'Aguardando' | 'Pago' | 'Vencido' | 'Cancelado' | unknown;
  created_at: string;
  company: ICompany;
  seller: IUser;
  technical?: IUser;
  total_value?: string;
  formatted_total_value?: string;
  number_total_value: number;
  orders_products?: IOrderProduct[];
  formatted_orders_products?: string[];
  splits_payment_way?: ISplitPaymentWay[];
}
