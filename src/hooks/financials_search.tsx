import React, { createContext, useCallback, useContext, useState } from 'react';

import { UpdateSearchResultsData } from '../components/SearchResults';

interface FinancialsSearchContextProps {
  due_date: Date | null;
  replan_date: Date | null;
  gross_value: string;
  net_value: string;
  paid_date: Date | null;
  paid_value: string;
  company_name: string;
  bank_account: string;
  status_financial: string;
  updateSearchResults: UpdateSearchResultsData;
  searchDueDate(date: Date | null): void;
  searchReplanDate(date: Date | null): void;
  searchGrossValue(value: string): void;
  searchNetValue(value: string): void;
  searchPaidDate(date: Date | null): void;
  searchPaidValue(value: string): void;
  searchCompanyName(name: string): void;
  searchBankAccount(name: string): void;
  searchStatusFinancial(type: string): void;
  clearAllResults(): void;
  toUpdateSearchResults(data: UpdateSearchResultsData): void;
}

const FinancialsSearchContext = createContext<FinancialsSearchContextProps>(
  {} as FinancialsSearchContextProps
);

export const FinancialsSearchProvider: React.FC = ({ children }) => {
  // Armazena o valor pesquisado: data de vencimento do lançamento financeiro
  const [due_date, setDueDate] = useState<Date | null>(null);
  // Armazena o valor pesquisado: data de replanejamento do lançamento financeiro
  const [replan_date, setReplanDate] = useState<Date | null>(null);
  // Armazena o valor pesquisado: valor bruto do lançamento financeiro
  const [gross_value, setGrossValue] = useState('');
  // Armazena o valor pesquisado: valor líquido do lançamento financeiro
  const [net_value, setNetValue] = useState('');
  // Armazena o valor pesquisado: data de pagamento do lançamento financeiro
  const [paid_date, setPaidDate] = useState<Date | null>(null);
  // Armazena o valor pesquisado: valor pago do lançamento financeiro
  const [paid_value, setPaidValue] = useState('');
  // Armazena o valor pesquisado: nome da empresa do lançamento financeiro
  const [company_name, setCompanyName] = useState('');
  // Armazena o valor pesquisado: nome da conta bancária do lançamento financeiro
  const [bank_account, setBankAccount] = useState('');
  // Armazena o valor pesquisado: status_financial do lançamento financeiro
  const [status_financial, setStatusFinancial] = useState('');

  // Armazena as alterações enviadas para atualizar os resultados na tela de pesquisa
  const [updateSearchResults, setUpdateSearchResults] =
    useState<UpdateSearchResultsData>({} as UpdateSearchResultsData);

  // Função para alterar a pesquisa da data de vencimento do lançamento financeiro
  const searchDueDate = useCallback((date: Date | null): void => {
    setDueDate(date);
  }, []);

  // Função para alterar a pesquisa da data de replanejamento do lançamento financeiro
  const searchReplanDate = useCallback((date: Date | null): void => {
    setReplanDate(date);
  }, []);

  // Função para alterar a pesquisa do valor bruto do lançamento financeiro
  const searchGrossValue = useCallback((value: string): void => {
    setGrossValue(value.replace(/[^0-9,]/g, ''));
  }, []);

  // Função para alterar a pesquisa do valor líquido do lançamento financeiro
  const searchNetValue = useCallback((value: string): void => {
    setNetValue(value.replace(/[^0-9,]/g, ''));
  }, []);

  // Função para alterar a pesquisa da data de pagamento do lançamento financeiro
  const searchPaidDate = useCallback((date: Date | null): void => {
    setPaidDate(date);
  }, []);

  // Função para alterar a pesquisa do valor pago do lançamento financeiro
  const searchPaidValue = useCallback((value: string): void => {
    setPaidValue(value.replace(/[^0-9,]/g, ''));
  }, []);

  // Função para alterar a pesquisa do nome da empresa do lançamento financeiro
  const searchCompanyName = useCallback((name: string): void => {
    setCompanyName(name);
  }, []);

  // Função para alterar a pesquisa do nome da conta do lançamento financeiro
  const searchBankAccount = useCallback((name: string): void => {
    setBankAccount(name);
  }, []);

  // Função para alterar a pesquisa do status_financial do lançamento financeiro
  const searchStatusFinancial = useCallback((type: string): void => {
    setStatusFinancial(type);
  }, []);

  // Função para limpar os resultados pesquisados
  const clearAllResults = useCallback(() => {
    if (due_date) {
      searchDueDate(null);
    }

    if (replan_date) {
      searchReplanDate(null);
    }

    if (gross_value) {
      searchGrossValue('');
    }

    if (net_value) {
      searchNetValue('');
    }

    if (paid_date) {
      searchPaidDate(null);
    }

    if (paid_value) {
      searchPaidValue('');
    }

    if (company_name) {
      searchCompanyName('');
    }

    if (bank_account) {
      searchBankAccount('');
    }

    if (status_financial) {
      searchStatusFinancial('');
    }
  }, [
    due_date,
    replan_date,
    gross_value,
    net_value,
    paid_date,
    paid_value,
    company_name,
    bank_account,
    status_financial,
    searchDueDate,
    searchReplanDate,
    searchGrossValue,
    searchNetValue,
    searchPaidDate,
    searchPaidValue,
    searchCompanyName,
    searchBankAccount,
    searchStatusFinancial,
  ]);

  const toUpdateSearchResults = useCallback((data: UpdateSearchResultsData) => {
    setUpdateSearchResults(data);
  }, []);

  return (
    <FinancialsSearchContext.Provider
      value={{
        due_date,
        replan_date,
        gross_value,
        net_value,
        paid_date,
        paid_value,
        company_name,
        bank_account,
        status_financial,
        updateSearchResults,
        searchDueDate,
        searchReplanDate,
        searchGrossValue,
        searchNetValue,
        searchPaidDate,
        searchPaidValue,
        searchCompanyName,
        searchBankAccount,
        searchStatusFinancial,
        clearAllResults,
        toUpdateSearchResults,
      }}
    >
      {children}
    </FinancialsSearchContext.Provider>
  );
};

export function useFinancialsSearch(): FinancialsSearchContextProps {
  const context = useContext(FinancialsSearchContext);

  return context;
}
