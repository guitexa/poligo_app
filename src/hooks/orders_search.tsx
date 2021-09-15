import React, { createContext, useCallback, useContext, useState } from 'react';

import { UpdateSearchResultsData } from '../components/SearchResults';

interface OrdersSearchContextProps {
  approved_at: Date | null;
  created_at: Date | null;
  delivery_date: Date | null;
  company_name: string;
  products: string;
  seller: string;
  technical: string;
  total_value: string;
  status_order: string;
  status_delivery: string;
  status_billing: string;
  updateSearchResults: UpdateSearchResultsData;
  searchApprovedAt(date: Date | null): void;
  searchCreatedAt(date: Date | null): void;
  searchDeliveryDate(date: Date | null): void;
  searchCompanyName(name: string): void;
  searchProducts(name: string): void;
  searchSeller(name: string): void;
  searchTechnical(name: string): void;
  searchTotalValue(value: string): void;
  searchStatusOrder(type: string): void;
  searchStatusDelivery(type: string): void;
  searchStatusBilling(type: string): void;
  clearAllResults(): void;
  toUpdateSearchResults(data: UpdateSearchResultsData): void;
}

const OrdersSearchContext = createContext<OrdersSearchContextProps>(
  {} as OrdersSearchContextProps
);

export const OrdersSearchProvider: React.FC = ({ children }) => {
  // Armazena o valor pesquisado: data de aprovação do pedido
  const [approved_at, setApprovedAt] = useState<Date | null>(null);
  // Armazena o valor pesquisado: data de criação do pedido
  const [created_at, setCreatedAt] = useState<Date | null>(null);
  // Armazena o valor pesquisado: data de entrega do pedido
  const [delivery_date, setDeliveryDate] = useState<Date | null>(null);
  // Armazena o valor pesquisado: nome do cliente
  const [company_name, setCompanyName] = useState('');
  // Armazena o valor pesquisado: nome do produto
  const [products, setProducts] = useState('');
  // Armazena o valor pesquisado: nome do vendedor
  const [seller, setSeller] = useState('');
  // Armazena o valor pesquisado: nome do técnico
  const [technical, setTechnical] = useState('');
  // Armazena o valor pesquisado: valor total do pedido
  const [total_value, setTotalValue] = useState('');
  // Armazena o valor pesquisado: status do pedido
  const [status_order, setStatusOrder] = useState('');
  // Armazena o valor pesquisado: status da entrega
  const [status_delivery, setStatusDelivery] = useState('');
  // Armazena o valor pesquisado: status do faturamento
  const [status_billing, setStatusBilling] = useState('');

  // Armazena as alterações enviadas para atualizar os resultados na tela de pesquisa
  const [updateSearchResults, setUpdateSearchResults] =
    useState<UpdateSearchResultsData>({} as UpdateSearchResultsData);

  // Função para alterar a pesquisa da data de aprovação do pedido
  const searchApprovedAt = useCallback((date: Date | null): void => {
    setApprovedAt(date);
  }, []);

  // Função para alterar a pesquisa da data de criação do pedido
  const searchCreatedAt = useCallback((date: Date | null): void => {
    setCreatedAt(date);
  }, []);

  // Função para alterar a pesquisa da data de entrega do pedido
  const searchDeliveryDate = useCallback((date: Date | null): void => {
    setDeliveryDate(date);
  }, []);

  // Função para alterar a pesquisa do nome do cliente
  const searchCompanyName = useCallback((name: string): void => {
    setCompanyName(name);
  }, []);

  // Função para alterar a pesquisa do nome do produto
  const searchProducts = useCallback((name: string): void => {
    setProducts(name);
  }, []);

  // Função para alterar a pesquisa do nome do vendedor
  const searchSeller = useCallback((name: string): void => {
    setSeller(name);
  }, []);

  // Função para alterar a pesquisa do nome do técnico
  const searchTechnical = useCallback((name: string): void => {
    setTechnical(name);
  }, []);

  // Função para alterar a pesquisa do valor total do pedido
  const searchTotalValue = useCallback((value: string): void => {
    setTotalValue(value.replace(/[^0-9,]/g, ''));
  }, []);

  // Função para alterar a pesquisa do status do pedido
  const searchStatusOrder = useCallback((type: string): void => {
    setStatusOrder(type);
  }, []);

  // Função para alterar a pesquisa do status da entrega
  const searchStatusDelivery = useCallback((type: string): void => {
    setStatusDelivery(type);
  }, []);

  // Função para alterar a pesquisa do status do faturamento
  const searchStatusBilling = useCallback((type: string): void => {
    setStatusBilling(type);
  }, []);

  // Função para limpar os resultados pesquisados
  const clearAllResults = useCallback(() => {
    if (approved_at) {
      searchApprovedAt(null);
    }

    if (created_at) {
      searchCreatedAt(null);
    }

    if (delivery_date) {
      searchDeliveryDate(null);
    }

    if (company_name) {
      searchCompanyName('');
    }

    if (products) {
      searchProducts('');
    }

    if (seller) {
      searchSeller('');
    }

    if (technical) {
      searchTechnical('');
    }

    if (total_value) {
      searchTotalValue('');
    }

    if (status_order) {
      searchStatusOrder('');
    }

    if (status_delivery) {
      searchStatusDelivery('');
    }

    if (status_billing) {
      searchStatusBilling('');
    }
  }, [
    approved_at,
    created_at,
    delivery_date,
    company_name,
    products,
    seller,
    technical,
    total_value,
    status_order,
    status_delivery,
    status_billing,
    searchApprovedAt,
    searchCreatedAt,
    searchDeliveryDate,
    searchCompanyName,
    searchProducts,
    searchSeller,
    searchTechnical,
    searchTotalValue,
    searchStatusOrder,
    searchStatusDelivery,
    searchStatusBilling,
  ]);

  const toUpdateSearchResults = useCallback((data: UpdateSearchResultsData) => {
    setUpdateSearchResults(data);
  }, []);

  return (
    <OrdersSearchContext.Provider
      value={{
        approved_at,
        created_at,
        delivery_date,
        company_name,
        products,
        seller,
        technical,
        status_order,
        status_delivery,
        status_billing,
        total_value,
        updateSearchResults,
        searchApprovedAt,
        searchCreatedAt,
        searchDeliveryDate,
        searchCompanyName,
        searchProducts,
        searchSeller,
        searchTechnical,
        searchTotalValue,
        searchStatusOrder,
        searchStatusDelivery,
        searchStatusBilling,
        clearAllResults,
        toUpdateSearchResults,
      }}
    >
      {children}
    </OrdersSearchContext.Provider>
  );
};

export function useOrdersSearch(): OrdersSearchContextProps {
  const context = useContext(OrdersSearchContext);

  return context;
}
