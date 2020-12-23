import React, { useState, useCallback, useEffect } from 'react';
import { parseISO } from 'date-fns';
import { RiDraftFill } from 'react-icons/ri';
import {
  FaCalendarTimes,
  FaCheckCircle,
  FaRegCheckCircle,
  FaRegClock,
  FaTimes,
} from 'react-icons/fa';
import { IoMdThumbsDown } from 'react-icons/io';
import { HiOutlineRefresh } from 'react-icons/hi';
import { FiChevronDown } from 'react-icons/fi';
import { IconBaseProps } from 'react-icons';
import { formatToDate } from 'brazilian-values';
import convertDate from '../../utils/convertDate';

import formatValue from '../../utils/formatValue';
import { useSearch } from '../../hooks/search';
import { useOverlap } from '../../hooks/overlap';
import { useAuth, User } from '../../hooks/auth';
import { useToast } from '../../hooks/toast';

import Order from '../Order';
import api from '../../services/api';

import {
  OrderOverlap,
  Container,
  ContentWithErrors,
  Content,
  RowResult,
  DateField,
  ClientName,
  Product,
  Professional,
  Value,
  Status,
  LoadMore,
} from './styles';

// Interface do client
export interface ClientData {
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
  client: ClientData;
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
  client_id?: string;
  client_name?: string;
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
  // Armazena os resultados da pesquisa recebidos do banco de dados
  const [searchResults, setSearchResults] = useState<OrderData[]>([]);
  // Armazena os resultados da pesquisa recebidos do banco de dados
  const [searchErrorsResults, setSearchErrorsResults] = useState<OrderData[]>(
    []
  );
  // Define qual a quantidade de resultados que deverá aparecer em tela
  const [take, setTake] = useState(50);
  // Armazena se está realizando uma pesquisa com filtro ou não
  const [changeResults, setChangeResults] = useState('');
  // Atualiza os resultados
  const [updateResults, setUpdateResults] = useState(0);

  const {
    approved_at,
    created_at,
    delivery_date,
    client_name,
    seller,
    products,
    status_billing,
    status_delivery,
    status_order,
    technical,
    total_value,
    updateSearchResults,
    toUpdateSearchResults,
  } = useSearch();
  const { orderOpen, overlapOrderOpen, newOrderOpen } = useOverlap();
  const { user, checkToken } = useAuth();
  const { addToast } = useToast();

  // Função que recebe atualizações de pedidos para atualizar os resultados
  useEffect(() => {
    if (updateSearchResults.order_id && searchResults) {
      // Busca no array de resultados qual o item do array que será atualizado
      const getOrderIndex = searchResults.findIndex(
        (result) => result.id === updateSearchResults.order_id
      );

      // Verifica se existe o item no array para ser atualizado
      if (searchResults[getOrderIndex]) {
        // Verifica se recebeu status_order para ser atualizado
        if (updateSearchResults.status_order) {
          searchResults[getOrderIndex].status_order =
            updateSearchResults.status_order;
        }

        // Verifica se recebeu status_delivery para ser atualizado
        if (
          updateSearchResults.status_delivery ||
          updateSearchResults.status_delivery === ''
        ) {
          searchResults[getOrderIndex].status_delivery =
            updateSearchResults.status_delivery;
        }

        // Verifica se recebeu status_billing para ser atualizado
        if (
          updateSearchResults.status_billing ||
          updateSearchResults.status_billing === ''
        ) {
          searchResults[getOrderIndex].status_billing =
            updateSearchResults.status_billing;
        }

        // Verifica se recebeu status_payment para ser atualizado
        if (
          updateSearchResults.status_payment ||
          updateSearchResults.status_payment === ''
        ) {
          searchResults[getOrderIndex].status_payment =
            updateSearchResults.status_payment;
        }

        // Verifica se recebeu delivery_date para ser atualizado
        if (updateSearchResults.delivery_date?.length === 0) {
          // Se não houver nenhum valor vai limpar o estado
          searchResults[getOrderIndex].delivery_date = undefined;
        } else if (
          updateSearchResults.delivery_date &&
          updateSearchResults.delivery_date.length > 0
        ) {
          // Se houver valor, formata a data e armazena no estado
          searchResults[getOrderIndex].delivery_date = convertDate(
            updateSearchResults.delivery_date
          );
        }

        // Verifica se recebeu technical para ser atualizado
        if (updateSearchResults.technical === null) {
          // Se não houver nenhum valor vai limpar o estado
          searchResults[getOrderIndex].technical = undefined;
        } else if (updateSearchResults.technical) {
          // Se houver valor armazena no estado
          searchResults[getOrderIndex].technical =
            updateSearchResults.technical;
        }

        // Verifica se recebeu order_product_add para adicionar um novo produto
        if (updateSearchResults.order_product_add) {
          searchResults[getOrderIndex].orders_products?.push(
            updateSearchResults.order_product_add
          );
        }

        // Verifica se recebeu order_product_delete para remover um produto
        if (updateSearchResults.order_product_delete) {
          // Busca no array de orders_products qual o item será removido
          const getOrderProductIndex = searchResults[
            getOrderIndex
          ].orders_products?.findIndex(
            (result) => result.id === updateSearchResults.order_product_delete
          );

          // Verifica se existe o item no array para ser removido
          if (getOrderProductIndex !== undefined) {
            searchResults[getOrderIndex].orders_products?.splice(
              getOrderProductIndex,
              1
            );
          }
        }

        // Verifica se recebeu order_product_update para atualizar um produto
        if (updateSearchResults.order_product_update) {
          // Busca no array de orders_products qual o item será atualizado
          const getOrderProductIndex = searchResults[
            getOrderIndex
          ].orders_products?.findIndex(
            (result) =>
              result.id === updateSearchResults.order_product_update?.id
          );

          // Verifica se existe o item no array
          if (getOrderProductIndex !== undefined) {
            // Remove o item com nome desatualizado
            searchResults[getOrderIndex].orders_products?.splice(
              getOrderProductIndex,
              1
            );

            // Inclui o item que possui o nome atualizado
            searchResults[getOrderIndex].orders_products?.push(
              updateSearchResults.order_product_update
            );
          }
        }

        // Verifica se recebeu client_id para atualizar o nome do cliente
        if (updateSearchResults.client_id) {
          // Faz um filtro no array de resultado para encontrar este cliente
          searchResults.filter((item) => {
            // Verifica se existe o client_id recebido
            if (item.client.id === updateSearchResults.client_id) {
              // Verifica se existe um client_name para ser atualizado
              if (updateSearchResults.client_name) {
                // eslint-disable-next-line no-param-reassign
                item.client.name = updateSearchResults.client_name;
              }
            }

            return item;
          });
        }
      }

      // Verifica se alguma das atualizações de status é Cancelado para atualizar os resultados com a API
      if (
        updateSearchResults.status_order === 'Cancelado' ||
        updateSearchResults.status_delivery === 'Cancelado' ||
        updateSearchResults.status_billing === 'Cancelado' ||
        updateSearchResults.status_payment === 'Cancelado'
      ) {
        setUpdateResults(updateResults + 1);
      }

      // Limpa o estado
      toUpdateSearchResults({} as UpdateSearchResultsData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateSearchResults.order_id]);

  // Função que redefine o limite de resultados da pesquisa
  useEffect(() => {
    setTake(50);
  }, [changeResults]);

  // Função que atualiza os resultados a cada hora
  setInterval(() => setUpdateResults(updateResults + 1), 3600000);

  // Função para realizar a pesquisa padrão ou então pesquisa com filtro
  useEffect(() => {
    // Realiza a pesquisa sem filtro
    if (
      user &&
      (!client_name || client_name.length <= 2) &&
      !approved_at &&
      !created_at &&
      !delivery_date &&
      !seller &&
      (!products || products.length <= 2) &&
      !status_billing &&
      !status_delivery &&
      !status_order &&
      !technical &&
      (!total_value || total_value.length <= 1)
    ) {
      try {
        checkToken();
        api
          .get<OrderData[]>('/orders/', {
            params: {
              take,
              from,
            },
          })
          .then((response) => {
            setSearchResults(response.data);
          });

        api
          .get<OrderData[]>('/orders/errors', {
            params: {
              take: 10,
              from,
            },
          })
          .then((response) => {
            setSearchErrorsResults(response.data);
          });

        setChangeResults('orders');
      } catch (err) {
        addToast({
          type: 'error',
          description: 'Ocorreu um erro na comunicação com o servidor',
        });
      }
    }
    // Realiza a pesquisa com filtro
    else if (
      user &&
      (client_name.length > 2 ||
        approved_at ||
        created_at ||
        delivery_date ||
        seller ||
        products.length > 2 ||
        status_billing ||
        status_delivery ||
        status_order ||
        technical ||
        total_value.length > 1)
    ) {
      try {
        checkToken();
        api
          .get<OrderData[]>('/search-orders/', {
            params: {
              approved_at,
              created_at,
              client_name,
              seller,
              products,
              technical,
              delivery_date,
              status_billing,
              status_delivery,
              status_order,
              total_value,
              take,
              from,
            },
          })
          .then((response) => {
            setSearchResults(response.data);
          });

        setChangeResults('search-orders');
      } catch (err) {
        addToast({
          type: 'error',
          description: 'Ocorreu um erro na comunicação com o servidor',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    approved_at,
    created_at,
    client_name,
    delivery_date,
    seller,
    products,
    status_billing,
    status_delivery,
    status_order,
    technical,
    total_value,
    newOrderOpen,
    take,
    from,
    updateResults,
  ]);

  // Função para formatar os nomes de produtos para serem exibidos
  const productsToShow = useCallback(
    (order_id: string): string[] => {
      // Busca no array de resultados um pedido específico
      const getOrderIndex = searchResults.findIndex(
        (result) => result.id === order_id
      );

      if (searchResults[getOrderIndex]) {
        // Ordena os itens do array por order de criação e formata com vírgula
        const productsToString = searchResults[getOrderIndex].orders_products
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

      // Se não encontrar no searchResults procura no searchErrorsResults
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
    [searchErrorsResults, searchResults]
  );

  // Função para formatar o valor total do pedido para ser exibido
  const totalValueToShow = useCallback(
    (order_id: string): string => {
      // Busca no array de resultados um pedido específico
      const getOrderIndex = searchResults.findIndex(
        (result) => result.id === order_id
      );

      if (searchResults[getOrderIndex]) {
        // Faz a soma de todos os valores dos orders_products deste pedido
        const productsValues = searchResults[getOrderIndex].orders_products
          ?.map((e) => Number(e.product_value))
          .reduce((accumulator, productValue) => {
            return accumulator + productValue;
          }, 0);

        // Se houver valores realiza a formatação
        return productsValues && productsValues > 0
          ? formatValue(productsValues)
          : formatValue(0);
      }

      // Se não encontrar no searchResults procura no searchErrorsResults
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
    [searchErrorsResults, searchResults]
  );

  // Função para exibir os ícones de status conforme valor recebido
  const statusReturn = useCallback((element: string | unknown):
    | IconBaseProps
    | undefined => {
    if (element === 'Rascunho') {
      return <RiDraftFill className="riDraftFill" />;
    }
    if (element === 'Aguardando' || element === 'Agendado') {
      return <FaRegClock className="faRegClock" />;
    }
    if (element === 'Execução') {
      return <HiOutlineRefresh className="hiRefresh" />;
    }
    if (element === 'Reprovado') {
      return <IoMdThumbsDown className="ioThumbsDown" />;
    }
    if (element === 'Concluído') {
      return <FaRegCheckCircle className="faGrayCheck" />;
    }
    if (
      element === 'Aprovado' ||
      element === 'Pago' ||
      element === 'Entregue' ||
      element === 'Faturado'
    ) {
      return <FaCheckCircle className="faGreenCheck" />;
    }
    if (element === 'Vencido') {
      return <FaCalendarTimes className="faCalendarTimes" />;
    }
    if (element === 'Cancelado') {
      return <FaTimes className="faTimes" />;
    }
    return undefined;
  }, []);

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
        {(!client_name || client_name.length <= 2) &&
          !approved_at &&
          !created_at &&
          !delivery_date &&
          !seller &&
          (!products || products.length <= 2) &&
          !status_billing &&
          !status_delivery &&
          !status_order &&
          !technical &&
          (!total_value || total_value.length <= 1) && (
            <ContentWithErrors>
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
                      <ClientName>
                        {search.client && search.client.name}
                      </ClientName>
                      <Product>{productsToShow(search.id)}</Product>
                      {(from === 'Comercial' || from === 'Billing') && (
                        <>
                          <Professional>
                            {search.seller && search.seller.name}
                          </Professional>
                          <Value>
                            {search.orders_products &&
                            search.orders_products.length
                              ? 'R$'
                              : ''}
                            {search.orders_products &&
                            search.orders_products.length ? (
                              <div>{totalValueToShow(search.id)}</div>
                            ) : (
                              ''
                            )}
                          </Value>
                        </>
                      )}
                      {from === 'TechnicalArea' && (
                        <>
                          <Professional>
                            {search.technical ? search.technical.name : ''}
                          </Professional>
                          <DateField>
                            {search.delivery_date
                              ? formatToDate(parseISO(search.delivery_date))
                              : ''}
                          </DateField>
                        </>
                      )}
                      <Status isCanceled>
                        {from === 'Comercial' && search.status_order
                          ? statusReturn(search.status_order)
                          : ''}
                        {from === 'Billing' && search.status_billing
                          ? statusReturn(search.status_billing)
                          : ''}
                        {from === 'TechnicalArea' && search.status_delivery
                          ? statusReturn(search.status_delivery)
                          : ''}
                      </Status>
                    </RowResult>
                  ))}
              </div>
            </ContentWithErrors>
          )}
        <Content>
          {searchResults &&
            searchResults.map((search: OrderData) => (
              <RowResult
                type="button"
                color={color}
                isCanceled={false}
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
                <ClientName>{search.client && search.client.name}</ClientName>
                <Product>{productsToShow(search.id)}</Product>
                {(from === 'Comercial' || from === 'Billing') && (
                  <>
                    <Professional>
                      {search.seller && search.seller.name}
                    </Professional>
                    <Value>
                      {search.orders_products && search.orders_products.length
                        ? 'R$'
                        : ''}
                      {search.orders_products &&
                      search.orders_products.length ? (
                        <div>{totalValueToShow(search.id)}</div>
                      ) : (
                        ''
                      )}
                    </Value>
                  </>
                )}
                {from === 'TechnicalArea' && (
                  <>
                    <Professional>
                      {search.technical ? search.technical.name : ''}
                    </Professional>
                    <DateField>
                      {search.delivery_date
                        ? formatToDate(parseISO(search.delivery_date))
                        : ''}
                    </DateField>
                  </>
                )}
                <Status isCanceled={false}>
                  {from === 'Comercial' && search.status_order
                    ? statusReturn(search.status_order)
                    : ''}
                  {from === 'Billing' && search.status_billing
                    ? statusReturn(search.status_billing)
                    : ''}
                  {from === 'TechnicalArea' && search.status_delivery
                    ? statusReturn(search.status_delivery)
                    : ''}
                </Status>
              </RowResult>
            ))}
          {searchResults.length > 0 && searchResults.length === take && (
            <LoadMore color={color} onClick={() => setTake(take + 10)}>
              <FiChevronDown size={20} />
              <p>Carregar mais</p>
              <FiChevronDown size={20} />
            </LoadMore>
          )}
        </Content>
      </Container>
    </>
  );
};

export default SearchResults;
