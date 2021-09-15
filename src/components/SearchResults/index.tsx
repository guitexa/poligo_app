import React, { useState, useCallback, useEffect } from 'react';
import { parseISO, isValid } from 'date-fns';
import { FiChevronDown } from 'react-icons/fi';
import { formatToDate } from 'brazilian-values';

import { formatValue } from '../../utils';
import { useOrdersSearch } from '../../hooks/orders_search';
import { useFinancialsSearch } from '../../hooks/financials_search';
import { useOverlap } from '../../hooks/overlap';
import { useAuth } from '../../hooks/auth';
import { useToast } from '../../hooks/toast';

import { IOrderProduct, IOrder, IUser, IFinancial } from '../../interfaces';

import Order from '../Order';
import RowResult from './RowResult';
import api from '../../services/api';

import {
  OrderOverlap,
  Container,
  SeparatedContent,
  Content,
  LoadMore,
} from './styles';

// Interface do estado de atualização dos resultados
export interface UpdateSearchResultsData {
  order_id: string;
  status_order?: string | unknown;
  status_delivery?: string | unknown;
  status_billing?: string | unknown;
  status_payment?: string | unknown;
  delivery_date?: string | undefined;
  due_date?: string | undefined;
  technical?: IUser | null;
  company_id?: string;
  company_name?: string;
  update_database?: boolean;
  total_value?: number;
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
  const [searchOrdersResults, setSearchOrdersResults] = useState<IOrder[]>([]);
  // Armazena os resultados da pesquisa dos pedidos com erros
  const [searchErrorsResults, setSearchErrorsResults] = useState<IOrder[]>([]);
  // Armazena os resultados da pesquisa dos lançamentos financeiros que vencem na data corrente
  const [searchTodayResults, setSearchTodayResults] = useState<IFinancial[]>(
    []
  );
  // // Armazena os resultados da pesquisa dos lançamentos financeiros
  const [searchFinancialsResults, setSearchFinancialsResults] = useState<
    IFinancial[]
  >([]);
  // Define qual a quantidade de resultados que deverá aparecer em tela
  const [take, setTake] = useState(50);
  // Armazena se está realizando uma pesquisa com filtro ou não
  const [changeResults, setChangeResults] = useState('');
  // Atualiza os resultados
  const [updateResults, setUpdateResults] = useState(0);

  const ordersSearch = useOrdersSearch();
  const financialsSearch = useFinancialsSearch();
  const { orderOpen, overlapOrderOpen } = useOverlap();
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

        if (ordersSearch.updateSearchResults.total_value) {
          searchOrdersResults[getOrderIndex].total_value = formatValue(
            ordersSearch.updateSearchResults.total_value
          );
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
          searchOrdersResults[getOrderIndex].delivery_date =
            ordersSearch.updateSearchResults.delivery_date;
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

    if (ordersSearch.updateSearchResults.update_database === true) {
      setUpdateResults(updateResults + 1);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordersSearch.updateSearchResults.order_id]);

  // Função que redefine o limite de resultados da pesquisa
  useEffect(() => {
    setTake(50);
  }, [changeResults]);

  // Função que atualiza os resultados a cada hora
  setInterval(() => setUpdateResults(updateResults + 1), 3600000);

  // Função para formatar os nomes de produtos para serem exibidos
  const formatOrdersProducts = useCallback(
    (orders_products: IOrderProduct[]): string[] => {
      // Ordena os itens do array por order de criação e formata com vírgula
      const productsToString = orders_products
        .sort((a, b) => {
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
    },
    []
  );

  // Função para realizar a pesquisa padrão ou pesquisa com filtro
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
          .get<IOrder[]>('/orders/', {
            params: {
              take,
              from,
            },
          })
          .then((response) => {
            const formattedResponse = response.data.map((result) => {
              const {
                created_at,
                approved_at,
                delivery_date,
                orders_products,
                total_value,
                ...rest
              } = result;

              return {
                ...rest,
                created_at: formatToDate(parseISO(created_at)),
                approved_at: approved_at && formatToDate(parseISO(approved_at)),
                delivery_date:
                  delivery_date && formatToDate(parseISO(delivery_date)),
                total_value:
                  total_value &&
                  formatValue(Number(total_value.replace(/[,]/gi, '.'))),
                formatted_orders_products:
                  orders_products && formatOrdersProducts(orders_products),
              };
            });

            setSearchOrdersResults(formattedResponse);
          })
          .catch(() => {
            addToast({
              type: 'error',
              description: '#0230 - Erro ao carregar informações',
            });
          });

        // Realiza uma pesquisa filtrando apenas pedidos com erro
        api
          .get<IOrder[]>('/orders/errors', {
            params: {
              take: 10,
              from,
            },
          })
          .then((response) => {
            const formattedResponse = response.data.map((result) => {
              const {
                created_at,
                approved_at,
                delivery_date,
                orders_products,
                total_value,
                ...rest
              } = result;

              return {
                ...rest,
                created_at: formatToDate(parseISO(created_at)),
                approved_at: approved_at && formatToDate(parseISO(approved_at)),
                delivery_date:
                  delivery_date && formatToDate(parseISO(delivery_date)),
                total_value:
                  total_value &&
                  formatValue(Number(total_value.replace(/[,]/gi, '.'))),
                formatted_orders_products:
                  orders_products && formatOrdersProducts(orders_products),
              };
            });
            setSearchErrorsResults(formattedResponse);

            setChangeResults('orders');
          })
          .catch(() => {
            addToast({
              type: 'error',
              description: '#0230 - Erro ao carregar informações',
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
          .get<IOrder[]>('/search-orders/', {
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
            const formattedResponse = response.data.map((result) => {
              const {
                created_at,
                approved_at,
                delivery_date,
                orders_products,
                total_value,
                ...rest
              } = result;

              return {
                ...rest,
                created_at: formatToDate(parseISO(created_at)),
                approved_at: approved_at && formatToDate(parseISO(approved_at)),
                delivery_date:
                  delivery_date && formatToDate(parseISO(delivery_date)),
                total_value:
                  total_value &&
                  formatValue(Number(total_value.replace(/[,]/gi, '.'))),
                formatted_orders_products:
                  orders_products && formatOrdersProducts(orders_products),
              };
            });
            setSearchOrdersResults(formattedResponse);

            setChangeResults('search-orders');
          })
          .catch(() => {
            addToast({
              type: 'error',
              description: '#0240 - Erro ao realizar a pesquisa',
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
          .get<IFinancial[]>('/financials/', {
            params: {
              take,
              from,
            },
          })
          .then((response) => {
            const formattedResponse = response.data.map((result) => {
              const {
                due_date,
                replan_date,
                gross_value,
                net_value,
                paid_date,
                paid_value,
                ...rest
              } = result;

              return {
                ...rest,
                due_date: formatToDate(parseISO(due_date)),
                replan_date: formatToDate(parseISO(replan_date)),
                formatted_gross_value: gross_value
                  ? formatValue(gross_value)
                  : '',
                formatted_net_value: net_value ? formatValue(net_value) : '',
                paid_date: paid_date && formatToDate(parseISO(paid_date)),
                formatted_paid_value: paid_value ? formatValue(paid_value) : '',
              };
            });

            setSearchFinancialsResults(formattedResponse);

            setChangeResults('financials');
          })
          .catch(() => {
            addToast({
              type: 'error',
              description: '#0230 - Erro ao carregar informações',
            });
          });

        // Realiza uma pesquisa filtrando apenas lançamentos financeiros com vencimento para o dia corrente
        api
          .get<IFinancial[]>('/financials/today', {
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
              description: '#0230 - Erro ao carregar informações',
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
          .get<IFinancial[]>('/search-financials/', {
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
              description: '#0240 - Erro ao realizar a pesquisa',
            });
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordersSearch, financialsSearch, take, from, updateResults]);

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
                {/* Verifica se a origem é o Comercial */}
                {searchErrorsResults &&
                  from === 'Comercial' &&
                  searchErrorsResults.map((search: IOrder) => (
                    <RowResult
                      from={from}
                      color={color}
                      isCanceled
                      handleClick={() => handleOpenOrder(search.id)}
                      key={search.id}
                      date={search.created_at}
                      companyName={search.company && search.company.name}
                      products={search.formatted_orders_products}
                      seller={search.seller && search.seller.name}
                      value={search.total_value}
                      status={search.status_order}
                    />
                  ))}
                {/* Verifica se a origem é o TechnicalArea */}
                {searchErrorsResults &&
                  from === 'TechnicalArea' &&
                  searchErrorsResults.map((search: IOrder) => (
                    <RowResult
                      from={from}
                      color={color}
                      isCanceled
                      handleClick={() => handleOpenOrder(search.id)}
                      key={search.id}
                      date={search.created_at}
                      companyName={search.company && search.company.name}
                      products={search.formatted_orders_products}
                      technical={search.technical && search.technical.name}
                      deliveryDate={search.delivery_date}
                      status={search.status_delivery}
                    />
                  ))}
                {/* Verifica se a origem é o Billing */}
                {searchErrorsResults &&
                  from === 'Billing' &&
                  searchErrorsResults.map((search: IOrder) => (
                    <RowResult
                      from={from}
                      color={color}
                      isCanceled
                      handleClick={() => handleOpenOrder(search.id)}
                      key={search.id}
                      date={search.created_at}
                      companyName={search.company && search.company.name}
                      products={search.formatted_orders_products}
                      seller={search.seller && search.seller.name}
                      value={search.total_value}
                      status={search.status_billing}
                    />
                  ))}
              </div>
            </SeparatedContent>
          )}
        {/* Verifica se a origem é o Comercial */}
        {from === 'Comercial' && (
          <Content>
            {searchOrdersResults &&
              searchOrdersResults.map((search: IOrder) => (
                <RowResult
                  from={from}
                  color={color}
                  handleClick={() => handleOpenOrder(search.id)}
                  key={search.id}
                  date={search.created_at}
                  companyName={search.company && search.company.name}
                  products={search.formatted_orders_products}
                  seller={search.seller && search.seller.name}
                  value={search.total_value}
                  status={search.status_order}
                />
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
              searchOrdersResults.map((search: IOrder) => (
                <RowResult
                  from={from}
                  color={color}
                  handleClick={() => handleOpenOrder(search.id)}
                  key={search.id}
                  date={search.created_at}
                  companyName={search.company && search.company.name}
                  products={search.formatted_orders_products}
                  technical={search.technical && search.technical.name}
                  deliveryDate={search.delivery_date}
                  status={search.status_delivery}
                />
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
              searchOrdersResults.map((search: IOrder) => (
                <RowResult
                  from={from}
                  color={color}
                  handleClick={() => handleOpenOrder(search.id)}
                  key={search.id}
                  date={search.created_at}
                  companyName={search.company && search.company.name}
                  products={search.formatted_orders_products}
                  seller={search.seller && search.seller.name}
                  value={search.total_value}
                  status={search.status_billing}
                />
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
                  searchTodayResults.map((search: IFinancial) => (
                    <RowResult
                      from={from}
                      color={color}
                      handleClick={() => {}}
                      key={search.id}
                      dueDate={search.due_date}
                      replanDate={search.replan_date}
                      grossValue={search.formatted_gross_value}
                      netValue={search.formatted_net_value}
                      paidDate={search.paid_date}
                      paidValue={search.formatted_paid_value}
                      companyName={search.company.name}
                      bankAccount={search.bank_account.name}
                      category={search.category}
                    />
                  ))}
              </div>
            </SeparatedContent>
          )}
        {/* Verifica se a origem é o Financial */}
        {from === 'Financial' && (
          <Content>
            {searchFinancialsResults &&
              searchFinancialsResults.map((search: IFinancial) => (
                <RowResult
                  from={from}
                  color={color}
                  handleClick={() => {}}
                  key={search.id}
                  dueDate={search.due_date}
                  replanDate={search.replan_date}
                  grossValue={search.formatted_gross_value}
                  netValue={search.formatted_net_value}
                  paidDate={search.paid_date}
                  paidValue={search.formatted_paid_value}
                  companyName={search.company.name}
                  bankAccount={search.bank_account.name}
                  category={search.category}
                />
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
