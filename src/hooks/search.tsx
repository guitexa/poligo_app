import React, { createContext, useCallback, useContext, useState } from 'react';

import { UpdateSearchResultsData } from '../components/SearchResults';

interface SearchContextData {
  approved_at: Date | null;
  created_at: Date | null;
  delivery_date: Date | null;
  client_name: string;
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
  searchClientName(name: string): void;
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

const SearchContext = createContext<SearchContextData>({} as SearchContextData);

export const SearchProvider: React.FC = ({ children }) => {
  // Armazena o valor pesquisado: data de aprovação do pedido
  const [approved_at, setSelectedApprovedAt] = useState<Date | null>(null);
  // Armazena o valor pesquisado: data de criação do pedido
  const [created_at, setSelectedCreatedAt] = useState<Date | null>(null);
  // Armazena o valor pesquisado: data de entrega do pedido
  const [delivery_date, setSelectedDeliveryDate] = useState<Date | null>(null);
  // Armazena o valor pesquisado: nome do cliente
  const [client_name, setClientName] = useState('');
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
  const [
    updateSearchResults,
    setUpdateSearchResults,
  ] = useState<UpdateSearchResultsData>({} as UpdateSearchResultsData);

  // Função para alterar a pesquisa da data de aprovação do pedido
  const searchApprovedAt = useCallback((date: Date | null): void => {
    setSelectedApprovedAt(date);
  }, []);

  // Função para alterar a pesquisa da data de criação do pedido
  const searchCreatedAt = useCallback((date: Date | null): void => {
    setSelectedCreatedAt(date);
  }, []);

  // Função para alterar a pesquisa da data de entrega do pedido
  const searchDeliveryDate = useCallback((date: Date | null): void => {
    setSelectedDeliveryDate(date);
  }, []);

  // Função para alterar a pesquisa do nome do cliente
  const searchClientName = useCallback((name: string): void => {
    setClientName(name);
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
  const searchTotalValue = useCallback((val: string): void => {
    setTotalValue(val.replace(/[^0-9,]/g, ''));
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

    if (client_name) {
      searchClientName('');
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
    client_name,
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
    searchClientName,
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
    <SearchContext.Provider
      value={{
        approved_at,
        created_at,
        delivery_date,
        client_name,
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
        searchClientName,
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
    </SearchContext.Provider>
  );
};

export function useSearch(): SearchContextData {
  const context = useContext(SearchContext);

  return context;
}
