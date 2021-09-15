// Interface do company
export default interface ICompany {
  id: string;
  name: string;
  cnpj_cpf?: string;
  formatted_cnpj_cpf?: string;
  contact_name: string;
  email?: string;
  phone: string;
  formatted_phone?: string;
  mobile?: string;
  formatted_mobile?: string;
}
