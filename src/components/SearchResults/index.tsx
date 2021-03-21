import React, { useState, useCallback, useEffect } from 'react';
import { isToday, isValid, parseISO, isBefore, isAfter } from 'date-fns';
import { RiDraftFill } from 'react-icons/ri';
import {
  FaCheckCircle,
  FaRegCheckCircle,
  FaRegClock,
  FaTimes,
  FaCalendarAlt,
} from 'react-icons/fa';
import { BiCalendarX } from 'react-icons/bi';
import { GoAlert } from 'react-icons/go';
import { IoMdThumbsDown } from 'react-icons/io';
import { HiOutlineRefresh } from 'react-icons/hi';
import { FiChevronDown } from 'react-icons/fi';
import { IconBaseProps } from 'react-icons';
import { formatToDate } from 'brazilian-values';
import convertDate from '../../utils/convertDate';

import formatValue from '../../utils/formatValue';
import { useOrdersSearch } from '../../hooks/orders_search';
import { useFinancialsSearch } from '../../hooks/financials_search';
import { useOverlap } from '../../hooks/overlap';
import { useAuth, User } from '../../hooks/auth';
import { useToast } from '../../hooks/toast';

import Order from '../Order';
import api from '../../services/api';

import {
  OrderOverlap,
  Container,
  SeparatedContent,
  Content,
  RowResult,
  DateField,
  TextFlex,
  TextWidth,
  Value,
  Status,
  LoadMore,
} from './styles';

// Interface do company
export interface CompanyData {
  id: string;
  name: string;
  cnpj_cpf?: string;
  formatted_cnpj_cpf?: string;
  contact_name: string;
  email?: string;
  phone: string;
  formatted_phone: string;
  mobile?: string;
  formatted_mobile?: string;
}

// Interface do produto
interface ProductData {
  id: string;
  name: string;
}

// Interface do order_product
export interface OrderProductData {
  id: string;
  product: ProductData;
  product_description: string;
  product_value: string;
  created_at: string;
}

// Interface do pedido
export interface OrderData {
  id: string;
  order_number: number;
  status_order:
    | 'Rascunho'
    | 'Aguardando'
    | 'Reprovado'
    | 'Aprovado'
    | 'Cancelado'
    | unknown;
  approved_at?: string | null;
  formatted_approved_at?: string;
  delivery_conditions?: string;
  requested_delivery_date?: string | null;
  formatted_requested_delivery_date?: string;
  delivery_date?: string | null;
  formatted_delivery_date?: string;
  status_delivery?:
    | ''
    | 'Agendado'
    | 'Execução'
    | 'Concluído'
    | 'Entregue'
    | 'Pendência'
    | 'Cancelado'
    | unknown;
  payment_way?: string;
  due_date?: string;
  status_billing?: '' | 'Aguardando' | 'Faturado' | 'Cancelado' | unknown;
  status_payment?:
    | ''
    | 'Aguardando'
    | 'Pago'
    | 'Vencido'
    | 'Cancelado'
    | unknown;
  created_at: string;
  company: CompanyData;
  seller: User;
  technical?: User;
  total_value?: string;
  orders_products?: OrderProductData[];
}

// Interface do estado de atualização dos resultados
export interface UpdateSearchResultsData {
  order_id: string;
  status_order?: string | unknown;
  status_delivery?: string | unknown;
  status_billing?: string | unknown;
  status_payment?: string | unknown;
  delivery_date?: string | undefined;
  technical?: User | null;
  order_product_add?: OrderProductData;
  order_product_update?: OrderProductData;
  order_product_delete?: string;
  company_id?: string;
  company_name?: string;
}

export interface BankAccount {
  name: string;
}

// Interface do lançamento financeiro
export interface FinancialData {
  id: string;
  cost_type: string;
  order: OrderData;
  due_date: string;
  replan_date: string;
  gross_value: number;
  gross_value_string: string;
  net_value: number;
  net_value_string: string;
  paid_date: string;
  paid_value: number;
  paid_value_string: string;
  company: CompanyData;
  category: string;
  bank_account: BankAccount;
}

interface SearchResultsProps {
  // Recebe a cor do módulo a partir de qual módulo este component está sendo executado
  color: string;
  // A partir de qual módulo este component está sendo executado
  from: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ color, from }) => {
  // Armazena o order_id quando uma order é aberta
  const [orderIdOpen, setOrderIdOpen] = useState('');
  // Armazena os resultados da pesquisa dos pedidos
  const [searchOrdersResults, setSearchOrdersResults] = useState<OrderData[]>(
    []
  );
  // Armazena os resultados da pesquisa dos pedidos com erros
  const [searchErrorsResults, setSearchErrorsResults] = useState<OrderData[]>(
    []
  );
  // Armazena os resultados da pesquisa dos lançamentos financeiros que vencem na data corrente
  const [searchTodayResults, setSearchTodayResults] = useState<FinancialData[]>(
    []
  );
  // // Armazena os resultados da pesquisa dos lançamentos financeiros
  const [searchFinancialsResults, setSearchFinancialsResults] = useState<
    FinancialData[]
  >([]);
  // Define qual a quantidade de resultados que deverá aparecer em tela
  const [take, setTake] = useState(50);
  // Armazena se está realizando uma pesquisa com filtro ou não
  const [changeResults, setChangeResults] = useState('');
  // Atualiza os resultados
  const [updateResults, setUpdateResults] = useState(0);

  const ordersSearch = useOrdersSearch();
  const financialsSearch = useFinancialsSearch();
  const { orderOpen, overlapOrderOpen, newOrderOpen } = useOverlap();
  const { user, checkToken } = useAuth();
  const { addToast } = useToast();

  // Função que recebe atualizações de pedidos para atualizar os resultados
  useEffect(() => {
    if (ordersSearch.updateSearchResults.order_id && searchOrdersResults) {
      // Busca no array de resultados qual o item do array que será atualizado
      const getOrderIndex = searchOrdersResults.findIndex(
        (result) => result.id === ordersSearch.updateSearchResults.order_id
      );

      // Verifica se existe o item no array para ser atualizado
      if (searchOrdersResults[getOrderIndex]) {
        // Verifica se recebeu ordersSearch.status_order para ser atualizado
        if (ordersSearch.updateSearchResults.status_order) {
          searchOrdersResults[getOrderIndex].status_order =
            ordersSearch.updateSearchResults.status_order;
        }

        // Verifica se recebeu ordersSearch.status_delivery para ser atualizado
        if (
          ordersSearch.updateSearchResults.status_delivery ||
          ordersSearch.updateSearchResults.status_delivery === ''
        ) {
          searchOrdersResults[getOrderIndex].status_delivery =
            ordersSearch.updateSearchResults.status_delivery;
        }

        // Verifica se recebeu ordersSearch.status_billing para ser atualizado
        if (
          ordersSearch.updateSearchResults.status_billing ||
          ordersSearch.updateSearchResults.status_billing === ''
        ) {
          searchOrdersResults[getOrderIndex].status_billing =
            ordersSearch.updateSearchResults.status_billing;
        }

        // Verifica se recebeu status_payment para ser atualizado
        if (
          ordersSearch.updateSearchResults.status_payment ||
          ordersSearch.updateSearchResults.status_payment === ''
        ) {
          searchOrdersResults[getOrderIndex].status_payment =
            ordersSearch.updateSearchResults.status_payment;
        }

        // Verifica se recebeu ordersSearch.delivery_date para ser atualizado
        if (ordersSearch.updateSearchResults.delivery_date?.length === 0) {
          // Se não houver nenhum valor vai limpar o estado
          searchOrdersResults[getOrderIndex].delivery_date = undefined;
        } else if (
          ordersSearch.updateSearchResults.delivery_date &&
          ordersSearch.updateSearchResults.delivery_date.length > 0
        ) {
          // Se houver valor, formata a data e armazena no estado
          searchOrdersResults[getOrderIndex].delivery_date = convertDate(
            ordersSearch.updateSearchResults.delivery_date
          );
        }

        // Verifica se recebeu ordersSearch.technical para ser atualizado
        if (ordersSearch.updateSearchResults.technical === null) {
          // Se não houver nenhum valor vai limpar o estado
          searchOrdersResults[getOrderIndex].technical = undefined;
        } else if (ordersSearch.updateSearchResults.technical) {
          // Se houver valor armazena no estado
          searchOrdersResults[getOrderIndex].technical =
            ordersSearch.updateSearchResults.technical;
        }

        // Verifica se recebeu order_product_add para adicionar um novo produto
        if (ordersSearch.updateSearchResults.order_product_add) {
          searchOrdersResults[getOrderIndex].orders_products?.push(
            ordersSearch.updateSearchResults.order_product_add
          );
        }

        // Verifica se recebeu order_product_delete para remover um produto
        if (ordersSearch.updateSearchResults.order_product_delete) {
          // Busca no array de orders_products qual o item será removido
          const getOrderProductIndex = searchOrdersResults[
            getOrderIndex
          ].orders_products?.findIndex(
            (result) =>
              result.id ===
              ordersSearch.updateSearchResults.order_product_delete
          );

          // Verifica se existe o item no array para ser removido
          if (getOrderProductIndex !== undefined) {
            searchOrdersResults[getOrderIndex].orders_products?.splice(
              getOrderProductIndex,
              1
            );
          }
        }

        // Verifica se recebeu order_product_update para atualizar um produto
        if (ordersSearch.updateSearchResults.order_product_update) {
          // Busca no array de orders_products qual o item será atualizado
          const getOrderProductIndex = searchOrdersResults[
            getOrderIndex
          ].orders_products?.findIndex(
            (result) =>
              result.id ===
              ordersSearch.updateSearchResults.order_product_update?.id
          );

          // Verifica se existe o item no array
          if (getOrderProductIndex !== undefined) {
            // Remove o item com nome desatualizado
            searchOrdersResults[getOrderIndex].orders_products?.splice(
              getOrderProductIndex,
              1
            );

            // Inclui o item que possui o nome atualizado
            searchOrdersResults[getOrderIndex].orders_products?.push(
              ordersSearch.updateSearchResults.order_product_update
            );
          }
        }

        // Verifica se recebeu company_id para atualizar o nome do cliente
        if (ordersSearch.updateSearchResults.company_id) {
          // Faz um filtro no array de resultado para encontrar este cliente
          searchOrdersResults.filter((item) => {
            // Verifica se existe o company_id recebido
            if (
              item.company.id === ordersSearch.updateSearchResults.company_id
            ) {
              // Verifica se existe um ordersSearch.company_name para ser atualizado
              if (ordersSearch.updateSearchResults.company_name) {
                // eslint-disable-next-line no-param-reassign
                item.company.name =
                  ordersSearch.updateSearchResults.company_name;
              }
            }

            return item;
          });
        }
      }

      // Verifica se alguma das atualizações de status é Cancelado para atualizar os resultados com a API
      if (
        ordersSearch.updateSearchResults.status_order === 'Cancelado' ||
        ordersSearch.updateSearchResults.status_delivery === 'Cancelado' ||
        ordersSearch.updateSearchResults.status_billing === 'Cancelado' ||
        ordersSearch.updateSearchResults.status_payment === 'Cancelado'
      ) {
        setUpdateResults(updateResults + 1);
      }

      // Limpa o estado
      ordersSearch.toUpdateSearchResults({} as UpdateSearchResultsData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordersSearch.updateSearchResults.order_id]);

  // Função que redefine o limite de resultados da pesquisa
  useEffect(() => {
    setTake(50);
  }, [changeResults]);

  // Função que atualiza os resultados a cada hora
  setInterval(() => setUpdateResults(updateResults + 1), 3600000);

  // Função para realizar a pesquisa padrão ou então pesquisa com filtro
  useEffect(() => {
    if (
      from === 'Comercial' ||
      from === 'Billing' ||
      from === 'TechnicalArea'
    ) {
      // Realiza a pesquisa sem filtro
      if (
        user &&
        (!ordersSearch.company_name || ordersSearch.company_name.length <= 2) &&
        !ordersSearch.approved_at &&
        !ordersSearch.created_at &&
        !ordersSearch.delivery_date &&
        !ordersSearch.seller &&
        (!ordersSearch.products || ordersSearch.products.length <= 2) &&
        !ordersSearch.status_billing &&
        !ordersSearch.status_delivery &&
        !ordersSearch.status_order &&
        !ordersSearch.technical &&
        (!ordersSearch.total_value || ordersSearch.total_value.length <= 1)
      ) {
        checkToken();
        api
          .get<OrderData[]>('/orders/', {
            params: {
              take,
              from,
            },
          })
          .then((response) => {
            setSearchOrdersResults(response.data);
          })
          .catch(() => {
            addToast({
              type: 'error',
              description: '#0240 - Erro ao carregar os pedidos cadastrados',
            });
          });

        // Realiza uma pesquisa filtrando apenas pedidos com erro
        api
          .get<OrderData[]>('/orders/errors', {
            params: {
              take: 10,
              from,
            },
          })
          .then((response) => {
            setSearchErrorsResults(response.data);

            setChangeResults('orders');
          })
          .catch(() => {
            addToast({
              type: 'error',
              description: '#0240 - Erro ao carregar os pedidos cadastrados',
            });
          });
      }
      // Realiza a pesquisa com filtro
      else if (
        user &&
        (ordersSearch.company_name.length > 2 ||
          (ordersSearch.approved_at &&
            (isValid(ordersSearch.approved_at) ||
              ordersSearch.approved_at === null)) ||
          (ordersSearch.created_at &&
            (isValid(ordersSearch.created_at) ||
              ordersSearch.created_at === null)) ||
          (ordersSearch.delivery_date &&
            (isValid(ordersSearch.delivery_date) ||
              ordersSearch.delivery_date === null)) ||
          ordersSearch.seller ||
          ordersSearch.products.length > 2 ||
          ordersSearch.status_billing ||
          ordersSearch.status_delivery ||
          ordersSearch.status_order ||
          ordersSearch.technical ||
          ordersSearch.total_value.length > 1)
      ) {
        checkToken();
        api
          .get<OrderData[]>('/search-orders/', {
            params: {
              approved_at: ordersSearch.approved_at,
              created_at: ordersSearch.created_at,
              company_name: ordersSearch.company_name,
              seller: ordersSearch.seller,
              products: ordersSearch.products,
              technical: ordersSearch.technical,
              delivery_date: ordersSearch.delivery_date,
              status_billing: ordersSearch.status_billing,
              status_delivery: ordersSearch.status_delivery,
              status_order: ordersSearch.status_order,
              total_value: ordersSearch.total_value,
              take,
              from,
            },
          })
          .then((response) => {
            setSearchOrdersResults(response.data);

            setChangeResults('search-orders');
          })
          .catch(() => {
            addToast({
              type: 'error',
              description: '#0250 - Erro ao realizar a pesquisa',
            });
          });
      }
    }
    if (from === 'Financial') {
      // Realiza a pesquisa sem filtro
      if (
        user &&
        !financialsSearch.due_date &&
        !financialsSearch.replan_date &&
        (!financialsSearch.gross_value ||
          financialsSearch.gross_value.length <= 1) &&
        (!financialsSearch.net_value ||
          financialsSearch.net_value.length <= 1) &&
        !financialsSearch.paid_date &&
        (!financialsSearch.paid_value ||
          financialsSearch.paid_value.length <= 1) &&
        !financialsSearch.company_name &&
        !financialsSearch.bank_account &&
        !financialsSearch.status_financial
      ) {
        checkToken();
        api
          .get<FinancialData[]>('/financials/', {
            params: {
              take,
              from,
            },
          })
          .then((response) => {
            setSearchFinancialsResults(response.data);

            setChangeResults('financials');
          })
          .catch(() => {
            addToast({
              type: 'error',
              description:
                '#0240 - Erro ao carregar os lançamentos financeiros cadastrados',
            });
          });

        // Realiza uma pesquisa filtrando apenas lançamentos financeiros com vencimento para o dia corrente
        api
          .get<FinancialData[]>('/financials/today', {
            params: {
              take: 10,
              from,
            },
          })
          .then((response) => {
            setSearchTodayResults(response.data);

            setChangeResults('financials');
          })
          .catch(() => {
            addToast({
              type: 'error',
              description:
                '#0240 - Erro ao carregar os lançamentos financeiros cadastrados',
            });
          });
      }
      // Realiza a pesquisa com filtro
      else if (
        user &&
        ((financialsSearch.due_date &&
          (isValid(financialsSearch.due_date) ||
            financialsSearch.due_date === null)) ||
          (financialsSearch.replan_date &&
            (isValid(financialsSearch.replan_date) ||
              financialsSearch.replan_date === null)) ||
          financialsSearch.gross_value.length > 1 ||
          financialsSearch.net_value.length > 1 ||
          (financialsSearch.paid_date &&
            (isValid(financialsSearch.paid_date) ||
              financialsSearch.paid_date === null)) ||
          financialsSearch.paid_value.length > 1 ||
          financialsSearch.company_name.length > 2 ||
          financialsSearch.bank_account ||
          financialsSearch.status_financial)
      ) {
        checkToken();
        api
          .get<FinancialData[]>('/search-financials/', {
            params: {
              due_date: financialsSearch.due_date,
              replan_date: financialsSearch.replan_date,
              gross_value: financialsSearch.gross_value,
              net_value: financialsSearch.net_value,
              paid_date: financialsSearch.paid_date,
              paid_value: financialsSearch.paid_value,
              company_name: financialsSearch.company_name,
              bank_account: financialsSearch.bank_account,
              status_financial: financialsSearch.status_financial,
              take,
              from,
            },
          })
          .then((response) => {
            setSearchFinancialsResults(response.data);

            setChangeResults('search-financials');
          })
          .catch(() => {
            addToast({
              type: 'error',
              description: '#0250 - Erro ao realizar a pesquisa',
            });
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ordersSearch.approved_at,
    ordersSearch.created_at,
    ordersSearch.company_name,
    ordersSearch.delivery_date,
    ordersSearch.seller,
    ordersSearch.products,
    ordersSearch.status_billing,
    ordersSearch.status_delivery,
    ordersSearch.status_order,
    ordersSearch.technical,
    ordersSearch.total_value,
    financialsSearch.due_date,
    financialsSearch.replan_date,
    financialsSearch.gross_value,
    financialsSearch.net_value,
    financialsSearch.paid_date,
    financialsSearch.paid_value,
    financialsSearch.company_name,
    financialsSearch.bank_account,
    financialsSearch.status_financial,
    newOrderOpen,
    take,
    from,
    updateResults,
  ]);

  // Função para formatar os nomes de produtos para serem exibidos
  const productsToShow = useCallback(
    (order_id: string): string[] => {
      // Busca no array de resultados um pedido específico
      const getOrderIndex = searchOrdersResults.findIndex(
        (result) => result.id === order_id
      );

      if (searchOrdersResults[getOrderIndex]) {
        // Ordena os itens do array por order de criação e formata com vírgula
        const productsToString = searchOrdersResults[
          getOrderIndex
        ].orders_products
          ?.sort((a, b) => {
            if (a.created_at < b.created_at) return -1;
            if (a.created_at > b.created_at) return 1;
            return 0;
          })
          .map((item) => `${item.product && item.product.name}, `);

        // Formata o último item do array removendo a vírgula no final
        const lastItemFormatted = productsToString?.pop()?.slice(0, -2);
        lastItemFormatted &&
          productsToString &&
          productsToString.push(lastItemFormatted);

        return productsToString || [];
      }

      // Se não encontrar no searchOrdersResults procura no searchErrorsResults
      const getOrderErrorIndex = searchErrorsResults.findIndex(
        (result) => result.id === order_id
      );

      if (searchErrorsResults[getOrderErrorIndex]) {
        // Ordena os itens do array por order de criação e formata com vírgula
        const productsToString = searchErrorsResults[
          getOrderErrorIndex
        ].orders_products
          ?.sort((a, b) => {
            if (a.created_at < b.created_at) return -1;
            if (a.created_at > b.created_at) return 1;
            return 0;
          })
          .map((item) => `${item.product && item.product.name}, `);

        // Formata o último item do array removendo a vírgula no final
        const lastItemFormatted = productsToString?.pop()?.slice(0, -2);
        lastItemFormatted &&
          productsToString &&
          productsToString.push(lastItemFormatted);

        return productsToString || [];
      }

      return [];
    },
    [searchErrorsResults, searchOrdersResults]
  );

  // Função para formatar o valor total do pedido para ser exibido
  const totalOrderValueToShow = useCallback(
    (order_id: string): string => {
      // Busca no array de resultados um pedido específico
      const getOrderIndex = searchOrdersResults.findIndex(
        (result) => result.id === order_id
      );

      if (searchOrdersResults[getOrderIndex]) {
        // Faz a soma de todos os valores dos orders_products deste pedido
        const productsValues = searchOrdersResults[
          getOrderIndex
        ].orders_products
          ?.map((e) => Number(e.product_value))
          .reduce((accumulator, productValue) => {
            return accumulator + productValue;
          }, 0);

        // Se houver valores realiza a formatação
        return productsValues && productsValues > 0
          ? formatValue(productsValues)
          : formatValue(0);
      }

      // Se não encontrar no searchOrdersResults procura no searchErrorsResults
      const getOrderErrorIndex = searchErrorsResults.findIndex(
        (result) => result.id === order_id
      );

      if (searchErrorsResults[getOrderErrorIndex]) {
        // Faz a soma de todos os valores dos orders_products deste pedido
        const productsValues = searchErrorsResults[
          getOrderErrorIndex
        ].orders_products
          ?.map((e) => Number(e.product_value))
          .reduce((accumulator, productValue) => {
            return accumulator + productValue;
          }, 0);

        // Se houver valores realiza a formatação
        return productsValues && productsValues > 0
          ? formatValue(productsValues)
          : formatValue(0);
      }

      return '';
    },
    [searchErrorsResults, searchOrdersResults]
  );

  // Função para exibir os ícones de status conforme valor recebido
  const orderStatusReturn = useCallback((val: string | unknown):
    | IconBaseProps
    | undefined => {
    if (val === 'Rascunho') {
      return <RiDraftFill className="riDraftFill" />;
    }
    if (val === 'Aguardando' || val === 'Agendado') {
      return <FaRegClock className="faRegClock" />;
    }
    if (val === 'Execução') {
      return <HiOutlineRefresh className="hiRefresh" />;
    }
    if (val === 'Reprovado') {
      return <IoMdThumbsDown className="ioThumbsDown" />;
    }
    if (val === 'Concluído') {
      return <FaRegCheckCircle className="faGrayCheck" />;
    }
    if (
      val === 'Aprovado' ||
      val === 'Pago' ||
      val === 'Entregue' ||
      val === 'Faturado'
    ) {
      return <FaCheckCircle className="faGreenCheck" />;
    }
    if (val === 'Pendência') {
      return <GoAlert className="goAlert" />;
    }
    if (val === 'Cancelado') {
      return <FaTimes className="faTimes" />;
    }
    return undefined;
  }, []);

  const financialStatusReturn = useCallback(
    (
      due_date: string,
      paid_date: string | unknown,
      category: string
    ): IconBaseProps | undefined => {
      if (isToday(parseISO(due_date)) && !paid_date) {
        // Hoje
        return <GoAlert className="goAlert" />;
      }
      if (paid_date) {
        // Pago
        return <FaCheckCircle className="faGreenCheck" />;
      }
      if (
        isBefore(parseISO(due_date), new Date()) &&
        !paid_date &&
        category !== 'Protesto'
      ) {
        // Vencido
        return <BiCalendarX className="biCalendarX" />;
      }
      if (isAfter(parseISO(due_date), new Date()) && !paid_date) {
        // Agendado
        return <FaCalendarAlt className="faCalendarAlt" />;
      }
      if (
        isBefore(parseISO(due_date), new Date()) &&
        !paid_date &&
        category === 'Protesto'
      ) {
        // Cancelado
        return <FaTimes className="faTimes" />;
      }
      return undefined;
    },
    []
  );

  // Função para abrir um pedido baseado no order_id recebido
  const handleOpenOrder = useCallback(
    (order_id: string | undefined) => {
      if (order_id) {
        setOrderIdOpen(order_id);
        overlapOrderOpen(!orderOpen);
      }
    },
    [orderOpen, overlapOrderOpen]
  );

  return (
    <>
      {orderOpen && (
        <OrderOverlap>
          <Order color={color} order_id={orderIdOpen} from={from} />
        </OrderOverlap>
      )}
      <Container>
        {(!ordersSearch.company_name ||
          ordersSearch.company_name.length <= 2) &&
          !ordersSearch.approved_at &&
          !ordersSearch.created_at &&
          !ordersSearch.delivery_date &&
          !ordersSearch.seller &&
          (!ordersSearch.products || ordersSearch.products.length <= 2) &&
          !ordersSearch.status_billing &&
          !ordersSearch.status_delivery &&
          !ordersSearch.status_order &&
          !ordersSearch.technical &&
          (!ordersSearch.total_value ||
            ordersSearch.total_value.length <= 1) && (
            /* Mostra container separado apenas se não tiver filtro */
            <SeparatedContent>
              <div>
                {searchErrorsResults &&
                  searchErrorsResults.map((search: OrderData) => (
                    <RowResult
                      type="button"
                      color={color}
                      isCanceled
                      onClick={() => handleOpenOrder(search.id)}
                      key={search.id}
                    >
                      {from === 'TechnicalArea' ? (
                        <DateField>
                          {search?.approved_at
                            ? formatToDate(parseISO(search.approved_at))
                            : ''}
                        </DateField>
                      ) : (
                        <DateField>
                          {formatToDate(parseISO(search.created_at))}
                        </DateField>
                      )}
                      <TextFlex flex="0.8">
                        {search.company && search.company.name}
                      </TextFlex>
                      <TextFlex flex="1">{productsToShow(search.id)}</TextFlex>
                      {(from === 'Comercial' || from === 'Billing') && (
                        <>
                          <TextWidth>
                            {search.seller && search.seller.name}
                          </TextWidth>
                          <Value>
                            {search.orders_products &&
                            search.orders_products.length
                              ? 'R$'
                              : ''}
                            {search.orders_products &&
                            search.orders_products.length ? (
                              <div>{totalOrderValueToShow(search.id)}</div>
                            ) : (
                              ''
                            )}
                          </Value>
                        </>
                      )}
                      {from === 'TechnicalArea' && (
                        <>
                          <TextWidth>
                            {search.technical ? search.technical.name : ''}
                          </TextWidth>
                          <DateField>
                            {search.delivery_date
                              ? formatToDate(parseISO(search.delivery_date))
                              : ''}
                          </DateField>
                        </>
                      )}
                      <Status isCanceled>
                        {from === 'Comercial' && search.status_order
                          ? orderStatusReturn(search.status_order)
                          : ''}
                        {from === 'Billing' && search.status_billing
                          ? orderStatusReturn(search.status_billing)
                          : ''}
                        {from === 'TechnicalArea' && search.status_delivery
                          ? orderStatusReturn(search.status_delivery)
                          : ''}
                      </Status>
                    </RowResult>
                  ))}
              </div>
            </SeparatedContent>
          )}
        {/* Verifica se a origem é o Comercial */}
        {from === 'Comercial' && (
          <Content>
            {searchOrdersResults &&
              searchOrdersResults.map((search: OrderData) => (
                <RowResult
                  type="button"
                  color={color}
                  isCanceled={false}
                  onClick={() => handleOpenOrder(search.id)}
                  key={search.id}
                >
                  <DateField>
                    {formatToDate(parseISO(search.created_at))}
                  </DateField>
                  <TextFlex flex="0.8">
                    {search.company && search.company.name}
                  </TextFlex>
                  <TextFlex flex="1">{productsToShow(search.id)}</TextFlex>
                  <TextWidth>{search.seller && search.seller.name}</TextWidth>
                  <Value>
                    {search.orders_products && search.orders_products.length
                      ? 'R$'
                      : ''}
                    {search.orders_products && search.orders_products.length ? (
                      <div>{totalOrderValueToShow(search.id)}</div>
                    ) : (
                      ''
                    )}
                  </Value>
                  <Status isCanceled={false}>
                    {search.status_order
                      ? orderStatusReturn(search.status_order)
                      : ''}
                  </Status>
                </RowResult>
              ))}
            {searchOrdersResults.length > 0 &&
              searchOrdersResults.length === take && (
                <LoadMore color={color} onClick={() => setTake(take + 10)}>
                  <FiChevronDown size={20} />
                  <p>Carregar mais</p>
                  <FiChevronDown size={20} />
                </LoadMore>
              )}
          </Content>
        )}
        {/* Verifica se a origem é o TechnicalArea */}
        {from === 'TechnicalArea' && (
          <Content>
            {searchOrdersResults &&
              searchOrdersResults.map((search: OrderData) => (
                <RowResult
                  type="button"
                  color={color}
                  isCanceled={false}
                  onClick={() => handleOpenOrder(search.id)}
                  key={search.id}
                >
                  <DateField>
                    {search?.approved_at
                      ? formatToDate(parseISO(search.approved_at))
                      : ''}
                  </DateField>
                  <TextFlex flex="0.8">
                    {search.company && search.company.name}
                  </TextFlex>
                  <TextFlex flex="1">{productsToShow(search.id)}</TextFlex>
                  <TextWidth>
                    {search.technical ? search.technical.name : ''}
                  </TextWidth>
                  <DateField>
                    {search.delivery_date
                      ? formatToDate(parseISO(search.delivery_date))
                      : ''}
                  </DateField>
                  <Status isCanceled={false}>
                    {from === 'TechnicalArea' && search.status_delivery
                      ? orderStatusReturn(search.status_delivery)
                      : ''}
                  </Status>
                </RowResult>
              ))}
            {searchOrdersResults.length > 0 &&
              searchOrdersResults.length === take && (
                <LoadMore color={color} onClick={() => setTake(take + 10)}>
                  <FiChevronDown size={20} />
                  <p>Carregar mais</p>
                  <FiChevronDown size={20} />
                </LoadMore>
              )}
          </Content>
        )}
        {/* Verifica se a origem é o Billing */}
        {from === 'Billing' && (
          <Content>
            {searchOrdersResults &&
              searchOrdersResults.map((search: OrderData) => (
                <RowResult
                  type="button"
                  color={color}
                  isCanceled={false}
                  onClick={() => handleOpenOrder(search.id)}
                  key={search.id}
                >
                  <DateField>
                    {formatToDate(parseISO(search.created_at))}
                  </DateField>
                  <TextFlex flex="0.8">
                    {search.company && search.company.name}
                  </TextFlex>
                  <TextFlex flex="1">{productsToShow(search.id)}</TextFlex>
                  <TextWidth>{search.seller && search.seller.name}</TextWidth>
                  <Value>
                    {search.orders_products && search.orders_products.length
                      ? 'R$'
                      : ''}
                    {search.orders_products && search.orders_products.length ? (
                      <div>{totalOrderValueToShow(search.id)}</div>
                    ) : (
                      ''
                    )}
                  </Value>
                  <Status isCanceled={false}>
                    {from === 'Billing' && search.status_billing
                      ? orderStatusReturn(search.status_billing)
                      : ''}
                  </Status>
                </RowResult>
              ))}
            {searchOrdersResults.length > 0 &&
              searchOrdersResults.length === take && (
                <LoadMore color={color} onClick={() => setTake(take + 10)}>
                  <FiChevronDown size={20} />
                  <p>Carregar mais</p>
                  <FiChevronDown size={20} />
                </LoadMore>
              )}
          </Content>
        )}
        {!financialsSearch.due_date &&
          !financialsSearch.replan_date &&
          (!financialsSearch.gross_value ||
            financialsSearch.gross_value.length <= 1) &&
          (!financialsSearch.net_value ||
            financialsSearch.net_value.length <= 1) &&
          !financialsSearch.paid_date &&
          (!financialsSearch.paid_value ||
            financialsSearch.paid_value.length <= 1) &&
          !financialsSearch.company_name &&
          !financialsSearch.bank_account &&
          !financialsSearch.status_financial && (
            /* Mostra container separado apenas se não tiver filtro */
            <SeparatedContent>
              <div>
                {searchTodayResults &&
                  searchTodayResults.map((search: FinancialData) => (
                    <RowResult
                      type="button"
                      color={color}
                      isCanceled={false}
                      onClick={() => {}}
                      key={search.id}
                      dueDate={
                        isToday(parseISO(search.due_date)) &&
                        !search.paid_date &&
                        '#FFA60210'
                      }
                    >
                      <DateField>
                        {formatToDate(parseISO(search.due_date))}
                      </DateField>
                      <DateField>
                        {formatToDate(parseISO(search.replan_date))}
                      </DateField>
                      <Value width="9.9%" negative={search.gross_value < 0}>
                        {search.gross_value ? 'R$' : ''}
                        {search.gross_value ? (
                          <div>
                            {search.gross_value
                              ? formatValue(search.gross_value)
                              : ''}
                          </div>
                        ) : (
                          ''
                        )}
                      </Value>
                      <Value width="9.9%" negative={search.net_value < 0}>
                        {search.net_value ? 'R$' : ''}
                        {search.net_value ? (
                          <div>
                            {search.net_value
                              ? formatValue(search.net_value)
                              : ''}
                          </div>
                        ) : (
                          ''
                        )}
                      </Value>
                      <DateField>
                        {search.paid_date
                          ? formatToDate(parseISO(search.paid_date))
                          : ''}
                      </DateField>
                      <Value width="9.9%" negative={search.paid_value < 0}>
                        {search.paid_value ? 'R$' : ''}
                        {search.paid_value ? (
                          <div>
                            {search.paid_value
                              ? formatValue(search.paid_value)
                              : ''}
                          </div>
                        ) : (
                          ''
                        )}
                      </Value>
                      <TextFlex flex="1">
                        {search.company && search.company.name}
                      </TextFlex>
                      <TextWidth width="9%">
                        {search.bank_account && search.bank_account.name}
                      </TextWidth>
                      <Status isCanceled={false}>
                        {financialStatusReturn(
                          search.due_date,
                          search.paid_date,
                          search.category
                        )}
                      </Status>
                    </RowResult>
                  ))}
              </div>
            </SeparatedContent>
          )}
        {/* Verifica se a origem é o Financial */}
        {from === 'Financial' && (
          <Content>
            {searchFinancialsResults &&
              searchFinancialsResults.map((search: FinancialData) => (
                <RowResult
                  type="button"
                  color={color}
                  isCanceled={false}
                  onClick={() => {}}
                  key={search.id}
                  dueDate={
                    isToday(parseISO(search.due_date)) &&
                    !search.paid_date &&
                    '#FFA60210'
                  }
                >
                  <DateField>
                    {formatToDate(parseISO(search.due_date))}
                  </DateField>
                  <DateField>
                    {formatToDate(parseISO(search.replan_date))}
                  </DateField>
                  <Value width="9.9%" negative={search.gross_value < 0}>
                    {search.gross_value ? 'R$' : ''}
                    {search.gross_value ? (
                      <div>
                        {search.gross_value
                          ? formatValue(search.gross_value)
                          : ''}
                      </div>
                    ) : (
                      ''
                    )}
                  </Value>
                  <Value width="9.9%" negative={search.net_value < 0}>
                    {search.net_value ? 'R$' : ''}
                    {search.net_value ? (
                      <div>
                        {search.net_value ? formatValue(search.net_value) : ''}
                      </div>
                    ) : (
                      ''
                    )}
                  </Value>
                  <DateField>
                    {search.paid_date
                      ? formatToDate(parseISO(search.paid_date))
                      : ''}
                  </DateField>
                  <Value width="9.9%" negative={search.paid_value < 0}>
                    {search.paid_value ? 'R$' : ''}
                    {search.paid_value ? (
                      <div>
                        {search.paid_value
                          ? formatValue(search.paid_value)
                          : ''}
                      </div>
                    ) : (
                      ''
                    )}
                  </Value>
                  <TextFlex flex="1">
                    {search.company && search.company.name}
                  </TextFlex>
                  <TextWidth width="9%">
                    {search.bank_account && search.bank_account.name}
                  </TextWidth>
                  <Status isCanceled={false}>
                    {financialStatusReturn(
                      search.due_date,
                      search.paid_date,
                      search.category
                    )}
                  </Status>
                </RowResult>
              ))}
            {searchFinancialsResults.length > 0 &&
              searchFinancialsResults.length === take && (
                <LoadMore color={color} onClick={() => setTake(take + 10)}>
                  <FiChevronDown size={20} />
                  <p>Carregar mais</p>
                  <FiChevronDown size={20} />
                </LoadMore>
              )}
          </Content>
        )}
      </Container>
    </>
  );
};

export default SearchResults;
