import { IBankAccount, ICompany, IOrder } from '../index';

// Interface do lançamento financeiro
export default interface IFinancial {
  id: string;
  cost_type: string;
  order: IOrder;
  due_date: string;
  replan_date: string;
  gross_value?: number;
  gross_value_string: string;
  formatted_gross_value: string;
  net_value?: number;
  net_value_string: string;
  formatted_net_value: string;
  paid_date?: string;
  paid_value?: number;
  paid_value_string?: string;
  formatted_paid_value?: string;
  company: ICompany;
  category: string;
  bank_account: IBankAccount;
}
