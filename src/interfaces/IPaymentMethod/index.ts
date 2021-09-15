// Interface do método de pagamento
export default interface IPaymentMethod {
  id: string;
  name?: string | unknown;
  split_max: number;
  split_interval?: number;
  first_payment?: number;
  interest_rate?: number;
}
