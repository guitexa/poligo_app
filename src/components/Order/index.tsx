/* eslint-disable react/jsx-indent */
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  createStyles,
  makeStyles,
  Theme,
  createMuiTheme,
  ThemeProvider,
} from '@material-ui/core';
import {
  FaPlus,
  FaRegCheckCircle,
  FaCheckCircle,
  FaRegClock,
  FaTimes,
  FaEdit,
  FaTrashAlt,
  FaCalendarAlt,
} from 'react-icons/fa';
import { BiCalendarX } from 'react-icons/bi';
import { GoAlert } from 'react-icons/go';
import { RiDraftFill } from 'react-icons/ri';
import { IoMdThumbsDown } from 'react-icons/io';
import { HiOutlineRefresh } from 'react-icons/hi';
import { Form } from '@unform/web';
import { FormHandles } from '@unform/core';
import { formatISO, isValid, parseISO } from 'date-fns';
import {
  formatToCNPJ,
  formatToCPF,
  formatToPhone,
  formatToDate,
  isCNPJ,
  isCPF,
  isPhone,
  formatToCapitalized,
} from 'brazilian-values';
import isEmail from 'validator/es/lib/isEmail';

import formatValue from '../../utils/formatValue';
import formatValueCurrency from '../../utils/formatValueCurrency';
import convertDate from '../../utils/convertDate';
import isCEI from '../../utils/isCEI';
import convertToCEI from '../../utils/convertToCEI';

import { useToast } from '../../hooks/toast';
import { useOverlap } from '../../hooks/overlap';
import { useAuth } from '../../hooks/auth';
import { useOrdersSearch } from '../../hooks/orders_search';
import api from '../../services/api';

import MaterialTooltip from '../MaterialTooltip';
import NewProduct from '../NewProduct';
import ProductView from '../ProductView';
import InputAsText from '../InputAsText';
import InputAsTextWithMask from '../InputAsTextWithMask';
import HeaderButton from '../HeaderButton';

import { OrderData, OrderProductData, CompanyData } from '../SearchResults';

import {
  OrderOverlap,
  ModalOverlap,
  Container,
  PrimaryContent,
  CompanyContainer,
  OrdersProductsContainer,
  Status,
  SecondaryContent,
  AddProductButton,
  TitlesForm,
  DataForm,
  DeliveryData,
  BillingData,
  ProductsOrderContent,
  TitleRow,
  ProductRow,
  TitleProductName,
  TitleProductDescription,
  TitleProductValue,
  ProductName,
  ProductDescription,
  ProductValue,
} from './styles';

interface InputData {
  deliveryConditionsData: string;
  requestedDeliveryDateData: string;
  deliveryDateData: string;
  paymentWayData: string;
  dueDateData: string;
  companyNameData: string;
  companyCnpjCpfData: string;
  companyNameContactData: string;
  companyEmailData: string;
  companyPhoneData: string;
  companyMobilePhoneData: string;
}

interface OrderProps {
  // Recebe a cor do módulo a partir de qual módulo este component está sendo executado
  color: string;
  // Recebe o order_id para buscar na API e exibir o pedido
  order_id: string;
  // A partir de qual módulo este component está sendo executado
  from: string;
}

const Order: React.FC<OrderProps> = ({ color, order_id, from }) => {
  // Armazena o pedido recebido ao fazer a busca na API
  const [orderData, setOrderData] = useState<OrderData>({} as OrderData);

  // Armazena o order_product selecionado para ser alterado ou visualizado
  const [
    selectedOrderProduct,
    setSelectedOrderProduct,
  ] = useState<OrderProductData>({} as OrderProductData);

  // Armazena o order_product atualizado para atualizar o pedido e também o searchResults
  const [
    updateOrderProduct,
    setUpdateOrderProduct,
  ] = useState<OrderProductData>({} as OrderProductData);

  // Armazena o order_product criado para atualizar o pedido e o searchResults
  const [
    addNewOrderProduct,
    setAddNewOrderProduct,
  ] = useState<OrderProductData>({} as OrderProductData);

  // Armazena se houve alguma atualização no pedido
  const [orderUpdated, setOrderUpdated] = useState(false);

  // Armazena se houve alguma atualização no cliente
  const [companyUpdated, setCompanyUpdated] = useState(false);

  // Armazena se existe algum erro em algum campo
  const [counterErrors, setCounterErrors] = useState<string[]>([]);

  const deliveryConditionsRef = useRef<FormHandles>(null);
  const requestedDeliveryDateRef = useRef<FormHandles>(null);
  const deliveryDateRef = useRef<FormHandles>(null);
  const paymentWayRef = useRef<FormHandles>(null);
  const dueDateRef = useRef<FormHandles>(null);
  const companyNameRef = useRef<FormHandles>(null);
  const companyCnpjCpfRef = useRef<FormHandles>(null);
  const companyNameContactRef = useRef<FormHandles>(null);
  const companyEmailRef = useRef<FormHandles>(null);
  const companyPhoneRef = useRef<FormHandles>(null);
  const companyMobilePhoneRef = useRef<FormHandles>(null);

  const {
    orderOpen,
    newProductOpen,
    productViewOpen,
    newOrderOpen,
    overlapOrderOpen,
    overlapNewProductOpen,
    overlapProductViewOpen,
    overlapNewOrderOpen,
  } = useOverlap();
  const { addToast } = useToast();
  const { user, checkToken } = useAuth();
  const { toUpdateSearchResults } = useOrdersSearch();

  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      formControl: {
        margin: theme.spacing(1),
      },
      faGrayCheck: {
        color: '#555',
        margin: '0 4px 0 0',
      },
      faGreenCheck: {
        color: '#1b914f',
        margin: '0 4px 0 0',
      },
      faRegClock: {
        color: '#555',
        margin: '0 4px 0 0',
      },
      riDraftFill: {
        color: '#999',
        margin: '0 4px 0 0',
      },
      faTimes: {
        color: '#f00',
        fontSize: '15px',
        margin: '0 4px 0 -2px',
      },
      faCalendarAlt: {
        color: '#19518A',
        margin: '0 4px 0 0',
      },
      biCalendarX: {
        color: '#c00000',
        fontSize: '16px',
        margin: '0 4px 0 -1px',
      },
      ioThumbsDown: {
        color: '#c00000',
        fontSize: '15px',
        margin: '0 4px 0 -2px',
      },
      goAlert: {
        color: '#FFA602',
        margin: '0 4px 0 0',
      },
      hiRefresh: {
        color: '#000',
        margin: '0 4px 0 0',
      },
    })
  );

  const {
    formControl,
    faGrayCheck,
    faGreenCheck,
    faRegClock,
    riDraftFill,
    faTimes,
    faCalendarAlt,
    goAlert,
    biCalendarX,
    ioThumbsDown,
    hiRefresh,
  } = useStyles();

  const orderMaterialTheme = createMuiTheme({
    palette: {
      primary: {
        main: color,
      },
    },
    overrides: {
      MuiMenuItem: {
        root: {
          '&& svg': {
            margin: '0 10px -1px -2px',
            '&[class*="ioThumbsDown"]': {
              margin: '0 10px -1px -3px',
              fontSize: '17px',
            },
            '&[class*="faTimes"]': {
              margin: '0 10px 0px -4px',
              fontSize: '20px',
            },
            '&[class*="faCalendarAlt"]': {
              margin: '0 10px 0px -4px',
              fontSize: '17px',
            },
            '&[class*="riDraftFill"]': {
              margin: '0 10px -1px -3px',
              fontSize: '17px',
            },
            '&[class*="biCalendarX"]': {
              margin: '0 10px -1px -3px',
              fontSize: '18px',
            },
            '&[class*="hiRefresh"]': {
              margin: '0 10px -1px -4px',
              fontSize: '18px',
            },
          },
          '&:hover': {
            backgroundColor: color,
            color: '#fff',
            '&& svg': {
              margin: '0 10px -1px -2px',
              color: '#fff',
              '&[class*="ioThumbsDown"]': {
                margin: '0 10px -1px -3px',
                fontSize: '17px',
              },
              '&[class*="faTimes"]': {
                margin: '0 10px 0px -4px',
                fontSize: '20px',
              },
              '&[class*="faCalendarAlt"]': {
                margin: '0 10px 0px -4px',
                fontSize: '17px',
              },
              '&[class*="riDraftFill"]': {
                margin: '0 10px -1px -3px',
                fontSize: '17px',
              },
              '&[class*="biCalendarX"]': {
                margin: '0 10px -1px -3px',
                fontSize: '18px',
              },
              '&[class*="hiRefresh"]': {
                margin: '0 10px -1px -4px',
                fontSize: '18px',
              },
            },
          },
          '&$selected': {
            backgroundColor: color,
            color: '#fff',
            '&& svg': {
              margin: '0 10px -1px -2px',
              color: '#fff',
              '&[class*="ioThumbsDown"]': {
                margin: '0 10px -1px -3px',
                fontSize: '17px',
              },
              '&[class*="faTimes"]': {
                margin: '0 10px 0px -4px',
                fontSize: '20px',
              },
              '&[class*="faCalendarAlt"]': {
                margin: '0 10px 0px -4px',
                fontSize: '17px',
              },
              '&[class*="riDraftFill"]': {
                margin: '0 10px -1px -3px',
                fontSize: '17px',
              },
              '&[class*="biCalendarX"]': {
                margin: '0 10px -1px -3px',
                fontSize: '18px',
              },
              '&[class*="hiRefresh"]': {
                margin: '0 10px -1px -4px',
                fontSize: '18px',
              },
            },
            '&:hover': {
              backgroundColor: color,
              color: '#fff',
              '&& svg': {
                margin: '0 10px -1px -2px',
                color: '#fff',
                '&[class*="ioThumbsDown"]': {
                  margin: '0 10px -1px -3px',
                  fontSize: '17px',
                },
                '&[class*="faTimes"]': {
                  margin: '0 10px 0px -4px',
                  fontSize: '20px',
                },
                '&[class*="faCalendarAlt"]': {
                  margin: '0 10px 0px -4px',
                  fontSize: '17px',
                },
                '&[class*="riDraftFill"]': {
                  margin: '0 10px -1px -3px',
                  fontSize: '17px',
                },
                '&[class*="biCalendarX"]': {
                  margin: '0 10px -1px -3px',
                  fontSize: '18px',
                },
                '&[class*="hiRefresh"]': {
                  margin: '0 10px -1px -4px',
                  fontSize: '18px',
                },
              },
            },
          },
        },
      },
    },
  });

  // Função que busca os dados do pedido na API
  useEffect(() => {
    checkToken();
    api
      .get<OrderData>(`/orders/${order_id}`)
      .then((response) => {
        const {
          company,
          seller,
          approved_at,
          order_number,
          status_order,
          created_at,
          requested_delivery_date,
          delivery_date,
          orders_products,
          total_value,
          ...rest
        } = response.data;

        // Verifica se existe um cliente
        if (company) {
          // Armazena no estado o pedido recebido e formatado
          setOrderData({
            ...rest,
            approved_at,
            formatted_approved_at: approved_at
              ? formatToDate(parseISO(approved_at))
              : '',
            created_at: created_at ? formatToDate(parseISO(created_at)) : '',
            order_number,
            status_order,
            requested_delivery_date,
            formatted_requested_delivery_date: requested_delivery_date
              ? formatToDate(parseISO(requested_delivery_date))
              : '',
            delivery_date,
            formatted_delivery_date: delivery_date
              ? formatToDate(parseISO(delivery_date))
              : '',
            company: {
              ...company,
              formatted_cnpj_cpf: company.cnpj_cpf
                ? company.cnpj_cpf.length === 14
                  ? formatToCNPJ(company.cnpj_cpf)
                  : company.cnpj_cpf.length === 11
                  ? formatToCPF(company.cnpj_cpf)
                  : convertToCEI(company.cnpj_cpf)
                : '',
              formatted_phone: formatToPhone(company.phone),
              formatted_mobile: company.mobile
                ? formatToPhone(company.mobile)
                : '',
            },
            seller,
            total_value: formatValueCurrency(Number(total_value)),
            orders_products: orders_products?.sort((a, b) => {
              if (a.created_at < b.created_at) return -1;
              if (a.created_at > b.created_at) return 1;
              return 0;
            }),
          });
        }
      })
      .catch(() => {
        addToast({
          type: 'error',
          description: '#0170 - Erro ao carregar o pedido',
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order_id]);

  // Se houver updateOrderProduct significa que algum order_product foi atualizado
  useEffect(() => {
    if (updateOrderProduct.id && orderData.orders_products) {
      // Localiza qual order_product foi atualizado
      const getOrderIndex = orderData.orders_products.findIndex(
        (result) => result.id === updateOrderProduct.id
      );

      if (getOrderIndex >= 0 && orderData.orders_products[getOrderIndex]) {
        // Armazena o valor recebido no estado
        orderData.orders_products[getOrderIndex] = updateOrderProduct;

        // Envia atualização para o component searchResults
        toUpdateSearchResults({
          order_id,
          order_product_update: updateOrderProduct,
        });
      }

      // Limpa o estado
      setUpdateOrderProduct({} as OrderProductData); // Limpa o estado
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateOrderProduct.id]);

  // Se houver addNewOrderProduct significa que foi criado um novo order_product
  useEffect(() => {
    if (addNewOrderProduct.id && orderData.orders_products) {
      // Armazena o valor recebido no estado
      orderData.orders_products = [
        ...orderData.orders_products,
        addNewOrderProduct,
      ];

      // Envia atualização para o component searchResults
      toUpdateSearchResults({
        order_id,
        order_product_add: addNewOrderProduct,
      });

      // Limpa o estado
      setAddNewOrderProduct({} as OrderProductData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addNewOrderProduct.id]);

  // Função para atualizar o status do pedido e/ou a data de aprovação
  const updateStatusOrder = useCallback(
    async (e: ChangeEvent<{ value: unknown }>) => {
      if (e.target.value === 'Aprovado') {
        /**
         * Se o valor recebido for 'Aprovado' atualiza
         * a data de aprovação, status_delivery e status_billing
         */

        // Armazena o valor recebido no estado
        orderData.status_order = e.target.value;
        orderData.approved_at = String(new Date(Date.now()));
        orderData.formatted_approved_at = formatToDate(new Date(Date.now()));
        orderData.status_delivery = 'Aguardando';
        orderData.status_billing = 'Aguardando';

        // Envia atualização para o component searchResults
        toUpdateSearchResults({
          order_id,
          status_order: e.target.value,
          status_delivery: 'Aguardando',
          status_billing: 'Aguardando',
        });

        // Define que o banco de dados deve ser atualizado
        setOrderUpdated(true);
      }
      // Se o status for Cancelado vai atualizar a API direto
      else if (e.target.value === 'Cancelado') {
        await api
          .patch<OrderData>(`/orders/${order_id}`, {
            status_order: e.target.value,
          })
          .then(() => {
            // Armazena o valor recebido no estado
            orderData.status_order = e.target.value;

            // Envia atualização para o component searchResults
            toUpdateSearchResults({
              order_id,
              status_order: e.target.value,
            });

            addToast({
              type: 'success',
              description: 'Status do pedido atualizado com sucesso!',
            });
          })
          .catch(() => {
            addToast({
              type: 'error',
              description: '#0190 - Erro ao atualizar o status do pedido',
            });
          });
      }
      // Se o valor recebido for diferente de 'Aprovado' atualiza apenas o status
      else {
        // Armazena o valor recebido no estado
        orderData.status_order = e.target.value;

        // Envia atualização para o component searchResults
        toUpdateSearchResults({
          order_id,
          status_order: e.target.value,
        });

        // Define que o banco de dados deve ser atualizado
        setOrderUpdated(true);
      }
    },
    [addToast, orderData, order_id, toUpdateSearchResults]
  );

  // Função para atualizar o status da área técnica e/ou o técnico executante
  const updateStatusDelivery = useCallback(
    async (e: ChangeEvent<{ value: unknown }>) => {
      if (!orderData.technical) {
        // Se não possui técnico executante, define o usuário como técnico executante

        // Armazena o valor recebido no estado
        orderData.status_delivery = e.target.value;
        orderData.technical = user;

        // Envia atualização para o component searchResults
        toUpdateSearchResults({
          order_id,
          status_delivery: e.target.value,
          technical: user,
        });

        // Define que o banco de dados deve ser atualizado
        setOrderUpdated(true);
      }
      // Se possui técnico executante verifica se existe valor recebido
      else if (e.target.value === 'Aguardando') {
        // Se não houver valor recebido limpa o status e remove técnico executante

        // Armazena o valor recebido no estado
        orderData.status_delivery = 'Aguardando';
        orderData.technical = undefined;

        // Envia atualização para o component searchResults
        toUpdateSearchResults({
          order_id,
          status_delivery: 'Aguardando',
          technical: null,
        });

        // Define que o banco de dados deve ser atualizado
        setOrderUpdated(true);
      }
      // Se o status for Cancelado vai atualizar a API direto
      else if (e.target.value === 'Cancelado') {
        await api
          .patch<OrderData>(`/orders/${order_id}`, {
            status_delivery: e.target.value,
          })
          .then(() => {
            // Armazena o valor recebido no estado
            orderData.status_delivery = e.target.value;

            // Envia atualização para o component searchResults
            toUpdateSearchResults({
              order_id,
              status_delivery: e.target.value,
            });

            addToast({
              type: 'success',
              description: 'Status do pedido atualizado com sucesso!',
            });
          })
          .catch(() => {
            addToast({
              type: 'error',
              description: '#0190 - Erro ao atualizar o status do pedido',
            });
          });
      }
      // Se houver valor recebido, altera o status e mantem o técnico executante
      else {
        // Armazena o valor recebido no estado
        orderData.status_delivery = e.target.value;

        // Envia atualização para o component searchResults
        toUpdateSearchResults({
          order_id,
          status_delivery: e.target.value,
        });

        // Define que o banco de dados deve ser atualizado
        setOrderUpdated(true);
      }
    },
    [addToast, orderData, order_id, toUpdateSearchResults, user]
  );

  // Função para atualizar o status do faturamento
  const updateStatusBilling = useCallback(
    async (e: ChangeEvent<{ value: unknown }>) => {
      // Verifica o valor recebido se é diferente de Cancelado
      if (e.target.value !== 'Cancelado') {
        // Armazena o valor recebido no estado
        orderData.status_billing = e.target.value;

        // Envia atualização para o component searchResults
        toUpdateSearchResults({
          order_id,
          status_billing: e.target.value,
        });

        // Define que o banco de dados deve ser atualizado
        setOrderUpdated(true);
      }
      // Se o status for Cancelado vai atualizar a API direto
      else if (e.target.value === 'Cancelado') {
        await api
          .patch<OrderData>(`/orders/${order_id}`, {
            status_billing: e.target.value,
          })
          .then(() => {
            // Armazena o valor recebido no estado
            orderData.status_billing = e.target.value;

            // Envia atualização para o component searchResults
            toUpdateSearchResults({
              order_id,
              status_billing: e.target.value,
            });

            addToast({
              type: 'success',
              description: 'Status do pedido atualizado com sucesso!',
            });
          })
          .catch(() => {
            addToast({
              type: 'error',
              description: '#0190 - Erro ao atualizar o status do pedido',
            });
          });
      }
    },
    [addToast, orderData, order_id, toUpdateSearchResults]
  );

  // Função para atualizar o status do financeiro
  const updateStatusPayment = useCallback(
    async (e: ChangeEvent<{ value: unknown }>) => {
      if (e.target.value !== 'Cancelado') {
        // Armazena o valor recebido no estado
        orderData.status_payment = e.target.value;

        // Envia atualização para o component searchResults
        toUpdateSearchResults({
          order_id,
          status_payment: e.target.value,
        });

        // Define que o banco de dados deve ser atualizado
        setOrderUpdated(true);
      }
      // Se o status for Cancelado vai atualizar a API direto
      else if (e.target.value === 'Cancelado') {
        await api
          .patch<OrderData>(`/orders/${order_id}`, {
            status_payment: e.target.value,
          })
          .then(() => {
            // Armazena o valor recebido no estado
            orderData.status_payment = e.target.value;

            // Envia atualização para o component searchResults
            toUpdateSearchResults({
              order_id,
              status_payment: e.target.value,
            });

            addToast({
              type: 'success',
              description: 'Status do pedido atualizado com sucesso!',
            });
          })
          .catch(() => {
            addToast({
              type: 'error',
              description: '#0190 - Erro ao atualizar o status do pedido',
            });
          });
      }
    },
    [addToast, orderData, order_id, toUpdateSearchResults]
  );

  // Função para atualizar as condições de pagamento
  const submitDeliveryConditions = useCallback(
    ({ deliveryConditionsData }: InputData) => {
      // Remove espaços em branco no final, no início da string e duplo espaço
      const clearDeliveryConditionsData = deliveryConditionsData
        .trimEnd()
        .trimStart()
        .split(/\s+/)
        .join(' ');

      // Verifica se o valor recebido é diferente do existente
      if (orderData.delivery_conditions !== clearDeliveryConditionsData) {
        // Armazena o valor recebido no estado
        orderData.delivery_conditions = clearDeliveryConditionsData;

        // Define que o banco de dados deve ser atualizado
        setOrderUpdated(true);
      }
    },
    [orderData]
  );

  // Função para executar a função submitDeliveryConditions
  const onDeliveryConditionsSubmit = useCallback(() => {
    deliveryConditionsRef.current?.submitForm();
  }, []);

  // Função para atualizar a data de entrega solicitada
  const submitRequestedDeliveryDate = useCallback(
    ({ requestedDeliveryDateData }: InputData) => {
      // Verifica se o valor recebido é diferente do existente
      if (
        orderData.formatted_requested_delivery_date !==
        requestedDeliveryDateData
      ) {
        // Verifica se possui valor recebido
        if (requestedDeliveryDateData) {
          // Converte o valor recebido para formato americano
          const convertedRequestedDeliveryDateData = convertDate(
            requestedDeliveryDateData
          );

          // Separa os valores de ano, mês e dia do valor convertido
          const year = new Date(
            convertedRequestedDeliveryDateData
          ).getFullYear();
          const month = new Date(convertedRequestedDeliveryDateData).getMonth();
          const day =
            new Date(convertedRequestedDeliveryDateData).getDate() + 1;

          // Converte a data para o formato de data do Javascript
          const newRequestedDeliveryDateData = new Date(year, month, day);

          // Converte a data para o formato de data brasileiro
          const formattedNewRequestedDeliveryDateData = formatToDate(
            newRequestedDeliveryDateData
          );

          // Verifica se a data recebida é válida
          if (isValid(newRequestedDeliveryDateData)) {
            // Armazena o valor recebido no estado
            orderData.requested_delivery_date = formatISO(
              newRequestedDeliveryDateData
            );
            orderData.formatted_requested_delivery_date = formattedNewRequestedDeliveryDateData;

            // Define que o banco de dados deve ser atualizado
            setOrderUpdated(true);

            // Limpa os erros
            requestedDeliveryDateRef.current?.setErrors({});
            setCounterErrors((state) =>
              state.filter((e) => e !== 'requestedDeliveryDate')
            );
          } else {
            // Se é uma data inválida define um erro
            requestedDeliveryDateRef.current?.setErrors({
              requestedDeliveryDateData: 'Data inválida',
            });

            addToast({
              type: 'error',
              description: 'Data inválida',
            });

            // Define que possui erros na edição do pedido
            if (!counterErrors.find((e) => e === 'requestedDeliveryDate')) {
              setCounterErrors((state) => [...state, 'requestedDeliveryDate']);
            }
          }
        }
        // Se não possui valor então remove a data
        else {
          // Limpa o estado
          orderData.requested_delivery_date = null;
          orderData.formatted_requested_delivery_date = '';

          // Define que o banco de dados deve ser atualizado
          setOrderUpdated(true);

          // Limpa os erros
          requestedDeliveryDateRef.current?.setErrors({});
          setCounterErrors((state) =>
            state.filter((e) => e !== 'requestedDeliveryDate')
          );
        }
      }
      // Verifica se o valor recebido é igual ao cadastrado e limpa possíveis erros
      else if (
        orderData.formatted_requested_delivery_date ===
        requestedDeliveryDateData
      ) {
        // Limpa os erros
        requestedDeliveryDateRef.current?.setErrors({});
        setCounterErrors((state) =>
          state.filter((e) => e !== 'requestedDeliveryDate')
        );
      }
    },
    [addToast, counterErrors, orderData]
  );

  // Função para executar a função submitRequestedDeliveryDate
  const onRequestedDeliveryDateSubmit = useCallback(() => {
    requestedDeliveryDateRef.current?.submitForm();
  }, [requestedDeliveryDateRef]);

  // Função para atualizar a data de entrega
  const submitDeliveryDate = useCallback(
    ({ deliveryDateData }: InputData) => {
      // Verifica se o valor recebido é diferente do existente
      if (orderData.formatted_delivery_date !== deliveryDateData) {
        // Verifica se possui valor recebido
        if (deliveryDateData) {
          // Converte o valor recebido para formato americano
          const convertedDeliveryDateData = convertDate(deliveryDateData);

          // Separa os valores de ano, mês e dia do valor convertido
          const year = new Date(convertedDeliveryDateData).getFullYear();
          const month = new Date(convertedDeliveryDateData).getMonth();
          const day = new Date(convertedDeliveryDateData).getDate() + 1;

          // Converte a data para o formato de data do Javascript
          const newDeliveryDateData = new Date(year, month, day);

          // Converte a data para o formato de data brasileiro
          const formattedNewDeliveryDateData = formatToDate(
            newDeliveryDateData
          );

          // Verifica se a data recebida é válida
          if (isValid(newDeliveryDateData)) {
            // Armazena o valor recebido no estado
            orderData.delivery_date = formatISO(newDeliveryDateData);
            orderData.formatted_delivery_date = formattedNewDeliveryDateData;

            // Envia atualização para o component searchResults
            toUpdateSearchResults({
              order_id,
              delivery_date: deliveryDateData,
            });

            // Define que o banco de dados deve ser atualizado
            setOrderUpdated(true);

            // Limpa os erros
            deliveryDateRef.current?.setErrors({});
            setCounterErrors((state) =>
              state.filter((e) => e !== 'deliveryDate')
            );
          } else {
            // Se é uma data inválida define um erro
            deliveryDateRef.current?.setErrors({
              deliveryDateData: 'Data inválida',
            });

            addToast({
              type: 'error',
              description: 'Data inválida',
            });

            // Define que possui erros na edição do pedido

            if (!counterErrors.find((e) => e === 'deliveryDate')) {
              setCounterErrors((state) => [...state, 'deliveryDate']);
            }
          }
        }
        // Se não possui valor então remove a data
        else {
          // Limpa o estado
          orderData.delivery_date = null;
          orderData.formatted_delivery_date = '';

          // Envia atualização para o component searchResults
          toUpdateSearchResults({
            order_id,
            delivery_date: '',
          });

          // Define que o banco de dados deve ser atualizado
          setOrderUpdated(true);

          // Limpa os erros
          deliveryDateRef.current?.setErrors({});
          setCounterErrors((state) =>
            state.filter((e) => e !== 'deliveryDate')
          );
        }
      }
      // Verifica se o valor recebido é igual ao cadastrado e limpa possíveis erros
      else if (orderData.formatted_delivery_date === deliveryDateData) {
        // Limpa os erros
        deliveryDateRef.current?.setErrors({});
        setCounterErrors((state) => state.filter((e) => e !== 'deliveryDate'));
      }
    },
    [addToast, counterErrors, orderData, order_id, toUpdateSearchResults]
  );

  // Função para executar a função submitDeliveryDate
  const onDeliveryDateSubmit = useCallback(() => {
    deliveryDateRef.current?.submitForm();
  }, []);

  // Função para atualizar a forma de pagamento
  const submitPaymentWay = useCallback(
    ({ paymentWayData }: InputData) => {
      // Remove espaços em branco no final, no início da string e duplo espaço
      const clearPaymentWayData = paymentWayData
        .trimEnd()
        .trimStart()
        .split(/\s+/)
        .join(' ');

      // Verifica se o valor recebido é diferente do existente
      if (orderData.payment_way !== clearPaymentWayData) {
        // Armazena o valor recebido no estado
        orderData.payment_way = clearPaymentWayData;

        // Define que o banco de dados deve ser atualizado
        setOrderUpdated(true);
      }
    },
    [orderData]
  );

  // Função para executar a função submitPaymentWay
  const onPaymentWaySubmit = useCallback(() => {
    paymentWayRef.current?.submitForm();
  }, []);

  // Função para atualizar o vencimento
  const submitDueDate = useCallback(
    ({ dueDateData }: InputData) => {
      // Remove espaços em branco no final, no início da string e duplo espaço
      const clearDueDateData = dueDateData
        .trimEnd()
        .trimStart()
        .split(/\s+/)
        .join(' ');

      // Verifica se o valor recebido é diferente do existente
      if (orderData.due_date !== clearDueDateData) {
        // Armazena o valor recebido no estado
        orderData.due_date = clearDueDateData;

        // Define que o banco de dados deve ser atualizado
        setOrderUpdated(true);
      }
    },
    [orderData]
  );

  // Função para executar a função submitDueDate
  const onDueDateSubmit = useCallback(() => {
    dueDateRef.current?.submitForm();
  }, []);

  // Função para atualizar o nome da empresa
  const submitCompanyName = useCallback(
    ({ companyNameData }: InputData) => {
      // Remove espaços em branco no final, no início da string e duplo espaço
      const clearCompanyNameData = companyNameData
        .trimEnd()
        .trimStart()
        .split(/\s+/)
        .join(' ');

      // Verifica se o valor recebido é diferente do existente
      if (orderData?.company.name !== clearCompanyNameData) {
        // Verifica se o valor recebido é um nome válido
        if (!clearCompanyNameData) {
          // Define um erro
          companyNameRef.current?.setErrors({
            companyNameData: 'Favor digitar um nome válido',
          });

          // Define que possui um erro na edição do cliente
          if (!counterErrors.find((e) => e === 'companyName')) {
            setCounterErrors((state) => [...state, 'companyName']);
          }

          addToast({
            type: 'error',
            description: 'Favor digitar um nome válido',
          });
        }
        // Se houver nome de cliente válido o valor será atualizado
        else {
          // Armazena o valor recebido no estado
          orderData.company.name = clearCompanyNameData;

          // Envia atualização para o component searchResults
          toUpdateSearchResults({
            order_id,
            company_name: clearCompanyNameData,
            company_id: orderData.company.id,
          });

          // Define que o banco de dados deve ser atualizado
          setCompanyUpdated(true);

          // Limpa os erros
          companyNameRef.current?.setErrors({});
          setCounterErrors((state) => state.filter((e) => e !== 'companyName'));
        }
      }
      // Verifica se o valor recebido é igual ao cadastrado e limpa possíveis erros
      else if (orderData?.company.name === clearCompanyNameData) {
        // Limpa os erros
        companyNameRef.current?.setErrors({});
        setCounterErrors((state) => state.filter((e) => e !== 'companyName'));
      }
    },
    [addToast, counterErrors, orderData, order_id, toUpdateSearchResults]
  );

  // Função para executar a função submitCompanyName
  const onCompanyNameSubmit = useCallback(() => {
    companyNameRef.current?.submitForm();
  }, []);

  // Função para atualizar o CNPJ/CPF da empresa
  const submitCompanyCnpjCpf = useCallback(
    ({ companyCnpjCpfData }: InputData) => {
      // Remove os caracteres especiais do valor recebido
      const clearCompanyCnpjCpfData = companyCnpjCpfData
        .replace(/[^\w\s]/gi, '')
        .trimEnd()
        .trimStart();

      // Verifica se o valor recebido é diferente do existente
      if (orderData?.company.cnpj_cpf !== clearCompanyCnpjCpfData) {
        // Verifica se o valor recebido é um CNPJ ou CPF válido ou se não possui valor recebido
        if (
          !clearCompanyCnpjCpfData ||
          (clearCompanyCnpjCpfData &&
            !isCNPJ(clearCompanyCnpjCpfData) &&
            !isCPF(clearCompanyCnpjCpfData) &&
            !isCEI(clearCompanyCnpjCpfData))
        ) {
          // Define um erro
          companyCnpjCpfRef.current?.setErrors({
            companyCnpjCpfData: 'Favor digitar um CPF ou CNPJ válido',
          });

          // Define que possui um erro na edição do cliente
          if (!counterErrors.find((e) => e === 'companyCnpjCpf')) {
            setCounterErrors((state) => [...state, 'companyCnpjCpf']);
          }

          addToast({
            type: 'error',
            description: 'Favor digitar um CPF ou CNPJ válido',
          });
        }
        // Se houver CNPJ ou CPF válido os valores serão atualizados
        else if (
          isCNPJ(clearCompanyCnpjCpfData) ||
          isCPF(clearCompanyCnpjCpfData) ||
          isCEI(clearCompanyCnpjCpfData)
        ) {
          // Armazena o valor recebido no estado
          orderData.company.cnpj_cpf = clearCompanyCnpjCpfData;
          orderData.company.formatted_cnpj_cpf =
            clearCompanyCnpjCpfData.length === 14
              ? formatToCNPJ(clearCompanyCnpjCpfData)
              : clearCompanyCnpjCpfData.length === 11
              ? formatToCPF(clearCompanyCnpjCpfData)
              : convertToCEI(clearCompanyCnpjCpfData);

          // Define que o banco de dados deve ser atualizado
          setCompanyUpdated(true);

          // Limpa os erros
          companyCnpjCpfRef.current?.setErrors({});
          setCounterErrors((state) =>
            state.filter((e) => e !== 'companyCnpjCpf')
          );
        }
      }
      // Verifica se o valor recebido é igual ao cadastrado e limpa possíveis erros
      else if (orderData?.company.cnpj_cpf === clearCompanyCnpjCpfData) {
        // Limpa os erros
        companyCnpjCpfRef.current?.setErrors({});
        setCounterErrors((state) =>
          state.filter((e) => e !== 'companyCnpjCpf')
        );
      }
    },
    [addToast, counterErrors, orderData]
  );

  // Função para executar a função submitCompanyCnpjCpf
  const onCompanyCnpjCpfSubmit = useCallback(() => {
    companyCnpjCpfRef.current?.submitForm();
  }, []);

  // Função para atualizar o nome do responsável pela empresa
  const submitCompanyNameContact = useCallback(
    ({ companyNameContactData }: InputData) => {
      // Remove espaços em branco no final, no início da string e duplo espaço
      const clearCompanyNameContactData = companyNameContactData
        .trimEnd()
        .trimStart()
        .split(/\s+/)
        .join(' ');

      // Verifica se o valor recebido é diferente do existente
      if (orderData?.company.contact_name !== clearCompanyNameContactData) {
        // Verifica se o valor recebido é um nome de responsável válido
        if (!clearCompanyNameContactData) {
          companyNameContactRef.current?.setErrors({
            companyNameContactData: 'Favor digitar um nome válido',
          });

          // Define que possui um erro na edição do cliente
          if (!counterErrors.find((e) => e === 'companyNameContact')) {
            setCounterErrors((state) => [...state, 'companyNameContact']);
          }

          addToast({
            type: 'error',
            description: 'Favor digitar um nome válido',
          });
        }
        // Se houver nome de responsável válido o valor será atualizado
        else {
          // Armazena o valor recebido no estado
          orderData.company.contact_name = formatToCapitalized(
            clearCompanyNameContactData,
            {
              trimTrailingWhiteSpaces: false,
            }
          );

          // Define que o banco de dados deve ser atualizado
          setCompanyUpdated(true);

          // Limpa os erros
          companyNameContactRef.current?.setErrors({});
          setCounterErrors((state) =>
            state.filter((e) => e !== 'companyNameContact')
          );
        }
      }
      // Verifica se o valor recebido é igual ao cadastrado e limpa possíveis erros
      else if (
        orderData?.company.contact_name === clearCompanyNameContactData
      ) {
        // Limpa os erros
        companyNameContactRef.current?.setErrors({});
        setCounterErrors((state) =>
          state.filter((e) => e !== 'companyNameContact')
        );
      }
    },
    [addToast, counterErrors, orderData]
  );

  // Função para executar a função submitCompanyNameContact
  const onCompanyNameContactSubmit = useCallback(() => {
    companyNameContactRef.current?.submitForm();
  }, []);

  // Função para atualizar o e-mail da empresa
  const submitCompanyEmail = useCallback(
    ({ companyEmailData }: InputData) => {
      // Remove espaços em branco no final, no início da string e duplo espaço
      const clearCompanyEmailData = companyEmailData
        .trimEnd()
        .trimStart()
        .split(/\s+/)
        .join(' ');

      // Verifica se o valor recebido é diferente do existente
      if (
        orderData?.company.email !== clearCompanyEmailData.toLocaleLowerCase()
      ) {
        // Verifica se o valor recebido é um e-mail válido
        if (!isEmail(clearCompanyEmailData) || !clearCompanyEmailData) {
          // Define um erro
          companyEmailRef.current?.setErrors({
            companyEmailData: 'Favor digitar um e-mail válido',
          });

          // Define que possui um erro na edição do cliente
          if (!counterErrors.find((e) => e === 'companyEmail')) {
            setCounterErrors((state) => [...state, 'companyEmail']);
          }

          addToast({
            type: 'error',
            description: 'Favor digitar um e-mail válido',
          });
        }
        // Se houver e-mail válido o valor será atualizado
        else {
          // Armazena o valor recebido no estado
          orderData.company.email = clearCompanyEmailData.toLocaleLowerCase();

          // Define que o banco de dados deve ser atualizado
          setCompanyUpdated(true);

          // Limpa os erros
          companyEmailRef.current?.setErrors({});
          setCounterErrors((state) =>
            state.filter((e) => e !== 'companyEmail')
          );
        }
      }
      // Verifica se o valor recebido é igual ao cadastrado e limpa possíveis erros
      else if (
        orderData?.company.email === clearCompanyEmailData.toLocaleLowerCase()
      ) {
        // Limpa os erros
        companyEmailRef.current?.setErrors({});
        setCounterErrors((state) => state.filter((e) => e !== 'companyEmail'));
      }
    },
    [addToast, counterErrors, orderData]
  );
  // Função para executar a função submitCompanyEmail
  const onCompanyEmailSubmit = useCallback(() => {
    companyEmailRef.current?.submitForm();
  }, []);

  // Função para atualizar o telefone da empresa
  const submitCompanyPhone = useCallback(
    ({ companyPhoneData }: InputData) => {
      // Remove os caracteres especiais do valor recebido
      const clearCompanyPhoneData = companyPhoneData
        .replace(/[^\w]/gi, '')
        .trimEnd()
        .trimStart();

      // Verifica se o valor recebido é diferente do existente
      if (orderData?.company.phone !== clearCompanyPhoneData) {
        // Verifica se o valor recebido é um telefone válido
        if (clearCompanyPhoneData && !isPhone(clearCompanyPhoneData)) {
          // Define um erro
          companyPhoneRef.current?.setErrors({
            companyPhoneData: 'Favor digitar um telefone válido',
          });

          // Define que possui um erro na edição do cliente
          if (!counterErrors.find((e) => e === 'companyPhone')) {
            setCounterErrors((state) => [...state, 'companyPhone']);
          }

          addToast({
            type: 'error',
            description: 'Favor digitar um telefone válido',
          });
        }
        // Verifica se o celular já não está vazio
        else if (!clearCompanyPhoneData && !orderData?.company.mobile) {
          // Define um erro
          companyPhoneRef.current?.setErrors({
            companyPhoneData: 'Favor digitar um telefone ou celular válido',
          });

          // Define que possui um erro na edição do cliente
          if (!counterErrors.find((e) => e === 'companyPhone')) {
            setCounterErrors((state) => [...state, 'companyPhone']);
          }

          addToast({
            type: 'error',
            description: 'Favor digitar um telefone ou celular válido',
          });
        }
        // Se o valor recebido for um telefone válido será atualizado
        else if (isPhone(clearCompanyPhoneData)) {
          // Armazena o valor recebido no estado
          orderData.company.phone = clearCompanyPhoneData;
          orderData.company.formatted_phone = formatToPhone(
            clearCompanyPhoneData
          );

          // Define que o banco de dados deve ser atualizado
          setCompanyUpdated(true);

          // Limpa os erros
          companyPhoneRef.current?.setErrors({});
          setCounterErrors((state) =>
            state.filter((e) => e !== 'companyPhone')
          );
        }
        // Se não houver valor recebido e houver telefone celular, será atualizado
        else if (!clearCompanyPhoneData && !!orderData?.company.mobile) {
          // Armazena o valor recebido no estado
          orderData.company.phone = clearCompanyPhoneData;
          orderData.company.formatted_phone = formatToPhone(
            clearCompanyPhoneData
          );

          // Define que o banco de dados deve ser atualizado
          setCompanyUpdated(true);

          // Limpa os erros
          companyPhoneRef.current?.setErrors({});
          setCounterErrors((state) =>
            state.filter((e) => e !== 'companyPhone')
          );
        }
      }
      // Verifica se o valor recebido é igual ao cadastrado e limpa possíveis erros
      else if (orderData?.company.phone === clearCompanyPhoneData) {
        // Limpa os erros
        companyPhoneRef.current?.setErrors({});
        setCounterErrors((state) => state.filter((e) => e !== 'companyPhone'));
      }
    },
    [addToast, counterErrors, orderData]
  );

  // Função para executar a função submitCompanyPhone
  const onCompanyPhoneSubmit = useCallback(() => {
    companyPhoneRef.current?.submitForm();
  }, []);

  // Função para atualizar o celular da empresa
  const submitCompanyMobilePhone = useCallback(
    ({ companyMobilePhoneData }: InputData) => {
      // Remove os caracteres especiais do valor recebido
      const clearCompanyMobilePhoneData = companyMobilePhoneData
        .replace(/[^\w]/gi, '')
        .trimEnd()
        .trimStart();

      // Verifica se o valor recebido é diferente do existente
      if (orderData?.company.mobile !== clearCompanyMobilePhoneData) {
        // Verifica se o valor recebido é um telefone válido
        if (
          clearCompanyMobilePhoneData &&
          !isPhone(clearCompanyMobilePhoneData)
        ) {
          // Define um erro
          companyMobilePhoneRef.current?.setErrors({
            companyMobilePhoneData: 'Favor digitar um telefone válido',
          });

          // Define que possui um erro na edição do cliente
          if (!counterErrors.find((e) => e === 'companyMobilePhone')) {
            setCounterErrors((state) => [...state, 'companyMobilePhone']);
          }

          addToast({
            type: 'error',
            description: 'Favor digitar um telefone válido',
          });
        }
        // Verifica se o telefone fixo já não está vazio
        else if (!clearCompanyMobilePhoneData && !orderData?.company.phone) {
          // Define um erro
          companyMobilePhoneRef.current?.setErrors({
            companyMobilePhoneData:
              'Favor digitar um celular ou telefone válido',
          });

          // Define que possui um erro na edição do cliente
          if (!counterErrors.find((e) => e === 'companyMobilePhone')) {
            setCounterErrors((state) => [...state, 'companyMobilePhone']);
          }

          addToast({
            type: 'error',
            description: 'Favor digitar um telefone ou celular válido',
          });
        }
        // Se o valor recebido for um telefone válido será atualizado
        else if (isPhone(clearCompanyMobilePhoneData)) {
          // Armazena o valor recebido no estado
          orderData.company.mobile = clearCompanyMobilePhoneData;
          orderData.company.formatted_mobile = formatToPhone(
            clearCompanyMobilePhoneData
          );

          // Define que o banco de dados deve ser atualizado
          setCompanyUpdated(true);

          // Limpa os erros
          companyMobilePhoneRef.current?.setErrors({});
          setCounterErrors((state) =>
            state.filter((e) => e !== 'companyMobilePhone')
          );
        }
        // Se não houver valor recebido e houver telefone fixo, será atualizado
        else if (!clearCompanyMobilePhoneData && !!orderData?.company.phone) {
          // Armazena o valor recebido no estado
          orderData.company.mobile = clearCompanyMobilePhoneData;
          orderData.company.formatted_mobile = formatToPhone(
            clearCompanyMobilePhoneData
          );

          // Define que o banco de dados deve ser atualizado
          setCompanyUpdated(true);

          // Limpa os erros
          companyMobilePhoneRef.current?.setErrors({});
          setCounterErrors((state) =>
            state.filter((e) => e !== 'companyMobilePhone')
          );
        }
      }
      // Verifica se o valor recebido é igual ao cadastrado e limpa possíveis erros
      else if (orderData?.company.mobile === clearCompanyMobilePhoneData) {
        // Limpa os erros
        companyMobilePhoneRef.current?.setErrors({});
        setCounterErrors((state) =>
          state.filter((e) => e !== 'companyMobilePhone')
        );
      }
    },
    [addToast, counterErrors, orderData]
  );

  // Função para executar a função submitCompanyMobilePhone
  const onCompanyMobilePhoneSubmit = useCallback(() => {
    companyMobilePhoneRef.current?.submitForm();
  }, []);

  // Função para deletar um order_product
  const handleDeleteOrderProductItem = useCallback(
    async (order_product_id: string) => {
      checkToken();
      await api
        .delete(`/orders-products/${order_product_id}`)
        .then(() => {
          // Atualiza o estado removendo o item deletado
          orderData.orders_products = orderData.orders_products?.filter(
            (orders_product) => orders_product.id !== order_product_id
          );

          // Envia atualização para o component searchResults
          toUpdateSearchResults({
            order_id,
            order_product_delete: order_product_id,
          });

          addToast({
            type: 'success',
            description: 'Serviço excluído com sucesso!',
          });
        })
        .catch(() => {
          addToast({
            type: 'error',
            description: '#0200 - Erro ao excluir um serviço do pedido',
          });
        });
    },
    [addToast, checkToken, orderData, order_id, toUpdateSearchResults]
  );

  // Função para somar o valor total do pedido baseado nos orders_products
  const totalValue = useMemo((): string => {
    const productsValues = orderData?.orders_products
      ?.map((product) => Number(product.product_value))
      .reduce((accumulator, productValue) => {
        return accumulator + productValue;
      }, 0);

    return productsValues && productsValues > 0
      ? formatValueCurrency(productsValues)
      : formatValueCurrency(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    orderData,
    updateOrderProduct,
    addNewOrderProduct,
    handleDeleteOrderProductItem,
  ]);

  // Função para definir estado com o order_product selecionado
  const handleSelectProduct = useCallback(
    (order_product: OrderProductData) => {
      setSelectedOrderProduct(order_product);

      // Verifica se pode editar o order_product ou apenas visualizar
      if (
        (from === 'Comercial' &&
          !orderData.status_delivery &&
          !orderData.status_billing &&
          !orderData.status_payment) ||
        (from === 'Comercial' && user.permissions === 'Admin')
      ) {
        overlapNewProductOpen(!newProductOpen);
      } else {
        overlapProductViewOpen(!productViewOpen);
      }
    },
    [
      from,
      newProductOpen,
      orderData.status_billing,
      orderData.status_delivery,
      orderData.status_payment,
      overlapNewProductOpen,
      overlapProductViewOpen,
      productViewOpen,
      user.permissions,
    ]
  );

  // Função que atualiza o pedido no banco de dados
  const handleSubmitOrderToUpdate = useCallback(async () => {
    await api
      .patch<OrderData>(`/orders/${order_id}`, {
        status_order: orderData?.status_order,
        approved_at: orderData?.approved_at,
        status_delivery: orderData?.status_delivery,
        technical_id: orderData.technical?.id || null,
        status_billing: orderData?.status_billing,
        status_payment: orderData?.status_payment,
        delivery_conditions: orderData?.delivery_conditions,
        requested_delivery_date: orderData?.requested_delivery_date,
        delivery_date: orderData?.delivery_date,
        payment_way: orderData?.payment_way,
        due_date: orderData?.due_date,
      })
      .then(() => {
        addToast({
          type: 'success',
          description: 'Pedido atualizado com sucesso!',
        });

        setOrderUpdated(false); // Limpa do estado
        overlapOrderOpen(!orderOpen); // Fecha o component
      })
      .catch(() => {
        addToast({
          type: 'error',
          description: '#0210 - Erro ao atualizar o pedido',
        });
      });
  }, [addToast, orderData, orderOpen, order_id, overlapOrderOpen]);

  // Função que atualiza o pedido no banco de dados
  const handleSubmitCompanyToUpdate = useCallback(async () => {
    await api
      .patch<CompanyData>(`/companies/${orderData.company.id}`, {
        name: orderData.company?.name,
        cnpj_cpf: orderData.company?.cnpj_cpf,
        contact_name: orderData.company?.contact_name,
        email: orderData.company?.email,
        phone: orderData.company?.phone,
        mobile: orderData.company?.mobile,
      })
      .then(() => {
        addToast({
          type: 'success',
          description: 'Pedido atualizado com sucesso!',
        });

        setCompanyUpdated(false); // Limpa do estado
        overlapOrderOpen(!orderOpen); // Fecha o component
      })
      .catch(() => {
        addToast({
          type: 'error',
          description: '#0220 - Erro ao atualizar o cadastro do cliente',
        });
      });
  }, [addToast, orderData.company, orderOpen, overlapOrderOpen]);

  // Função que faz validações ao fechar a order
  const handleCloseOrder = useCallback(() => {
    // Verifica o módulo que o usuário está acessando esse pedido
    if (from === 'TechnicalArea') {
      // Verifica se o pedido possui data de entrega e status de entrega
      if (
        !orderData?.delivery_date &&
        !!orderData?.status_delivery &&
        orderData?.status_delivery !== 'Aguardando' &&
        orderData?.status_delivery !== 'Cancelado' &&
        orderData?.status_delivery !== 'Pendência'
      ) {
        if (orderData.status_delivery === 'Concluído') {
          // Se não possui data e possui status define um erro
          addToast({
            type: 'error',
            description: 'Favor preencher a data de conclusão',
          });

          deliveryDateRef.current?.setErrors({
            deliveryDateData: 'Data inválida',
          });

          return;
        }
        if (orderData.status_delivery === 'Entregue') {
          // Se não possui data e possui status define um erro
          addToast({
            type: 'error',
            description: 'Favor preencher a data de entrega',
          });

          deliveryDateRef.current?.setErrors({
            deliveryDateData: 'Data inválida',
          });

          return;
        }
        // Se não possui data e possui status define um erro
        addToast({
          type: 'error',
          description: 'Favor preencher a data de entrega prevista',
        });

        deliveryDateRef.current?.setErrors({
          deliveryDateData: 'Data inválida',
        });

        return;
      }

      // Limpa os erros
      deliveryDateRef.current?.setErrors({});
      setCounterErrors((state) => state.filter((e) => e !== 'deliveryDate'));
    }

    // Verifica o módulo que o usuário está acessando esse pedido
    if (from === 'Comercial') {
      // Verifica se o pedido possui CNPJ/CPF e status do pedido
      if (
        !orderData.company?.cnpj_cpf &&
        orderData?.status_order === 'Aprovado'
      ) {
        // Se não possui CNPJ/CPF e possuir status Aprovado define um erro
        addToast({
          type: 'error',
          description: 'Favor preencher um CNPJ ou CPF',
        });

        companyCnpjCpfRef.current?.setErrors({
          companyCnpjCpfData: 'CNPJ/CPF inválido',
        });

        return;
      }

      // Verifica se o pedido possui algum serviço e status do pedido
      if (
        !orderData.orders_products?.length &&
        orderData?.status_order === 'Aprovado'
      ) {
        // Se não possui serviço e possuir status Aprovado define um erro
        addToast({
          type: 'error',
          description: 'Favor adicionar um serviço',
        });

        return;
      }
    }

    if (newOrderOpen) {
      overlapNewOrderOpen(false);
    }

    // Verifica se não existe erros nos campos
    if (
      counterErrors.length === 0 ||
      counterErrors.includes('companyCnpjCpf') ||
      counterErrors.includes('deliveryDate')
    ) {
      checkToken();
      // Se houve alteração no pedido vai atualizar
      if (orderUpdated && !companyUpdated) {
        handleSubmitOrderToUpdate(); // Atualiza o pedido
      }

      // Se houve alteração no cliente vai atualizar
      if (!orderUpdated && companyUpdated) {
        handleSubmitCompanyToUpdate(); // Atualiza o cliente
      }

      // Se houve alteração no pedido e no cliente vai atualizar os dois
      if (companyUpdated && orderUpdated) {
        handleSubmitOrderToUpdate(); // Atualiza o pedido
        handleSubmitCompanyToUpdate(); // Atualiza o cliente
      }

      // Se não houve alteração vai fechar
      if (!orderUpdated && !companyUpdated) {
        overlapOrderOpen(!orderOpen); // Fecha o component
      }
    }
    // Se houver erros avisa o usuário para corrigir
    else {
      addToast({
        type: 'error',
        description: 'Verifique as informações digitadas e tente novamente',
      });
    }
  }, [
    from,
    newOrderOpen,
    counterErrors,
    orderData?.delivery_date,
    orderData.status_delivery,
    orderData.company?.cnpj_cpf,
    orderData?.status_order,
    orderData.orders_products?.length,
    addToast,
    overlapNewOrderOpen,
    orderUpdated,
    companyUpdated,
    checkToken,
    handleSubmitOrderToUpdate,
    handleSubmitCompanyToUpdate,
    overlapOrderOpen,
    orderOpen,
  ]);

  // Mensagem que aparece para o usuário se ele tentar fechar o navegador ao invés de fechar o pedido
  window.onbeforeunload = () => {
    return companyUpdated || orderUpdated
      ? 'Se você sair desta página você irá perder suas alterações.'
      : null;
  };

  return (
    <OrderOverlap>
      {newProductOpen && (
        <ModalOverlap>
          <NewProduct
            color={color}
            orderProduct={selectedOrderProduct}
            order_id={order_id}
            setSelectedOrderProduct={() => {
              setSelectedOrderProduct({} as OrderProductData);
            }}
            updateOrderProduct={(e) => setUpdateOrderProduct(e)}
            addNewOrderProduct={(e) => setAddNewOrderProduct(e)}
          />
        </ModalOverlap>
      )}
      {productViewOpen && (
        <ModalOverlap>
          <ProductView
            color={color}
            orderProduct={selectedOrderProduct}
            from={from}
          />
        </ModalOverlap>
      )}
      {orderData?.company && orderData?.seller && (
        <>
          <HeaderButton
            show={orderOpen && !newProductOpen && !productViewOpen}
            handleClick={() => handleCloseOrder()}
            type="button"
            icon={FaTimes}
            color={color}
            className="headerButton"
          />
          <Container>
            <ThemeProvider theme={orderMaterialTheme}>
              <PrimaryContent isModalOpen={newProductOpen || productViewOpen}>
                <CompanyContainer>
                  <TitlesForm>
                    <p>Razão social:</p>
                    {orderData.company.cnpj_cpf ? (
                      orderData.company.cnpj_cpf.length === 14 ? (
                        <p>CNPJ:</p>
                      ) : orderData.company.cnpj_cpf.length === 11 ? (
                        <p>CPF:</p>
                      ) : (
                        <p>CEI:</p>
                      )
                    ) : (
                      <p>CNPJ/CPF/CEI:</p>
                    )}
                    <p>Contato:</p>
                    <p>E-mail:</p>
                    <p>Telefone:</p>
                    <p>Celular:</p>
                  </TitlesForm>
                  <DataForm>
                    {from === 'Comercial' && !orderData.status_billing ? (
                      <>
                        <Form ref={companyNameRef} onSubmit={submitCompanyName}>
                          <InputAsText
                            name="companyNameData"
                            onBlur={onCompanyNameSubmit}
                            defaultValue={orderData.company.name}
                          />
                        </Form>
                        <Form
                          ref={companyCnpjCpfRef}
                          onSubmit={submitCompanyCnpjCpf}
                        >
                          {orderData.company.cnpj_cpf &&
                          orderData.company.cnpj_cpf.length > 11 ? (
                            <InputAsText
                              name="companyCnpjCpfData"
                              onBlur={onCompanyCnpjCpfSubmit}
                              defaultValue={
                                orderData.company.formatted_cnpj_cpf
                              }
                              styled={{ width: '10em' }}
                              maxLength={18}
                            />
                          ) : (
                            <InputAsText
                              name="companyCnpjCpfData"
                              onBlur={onCompanyCnpjCpfSubmit}
                              defaultValue={
                                orderData.company.formatted_cnpj_cpf
                              }
                              styled={{ width: '10em' }}
                              maxLength={18}
                            />
                          )}
                        </Form>
                        <Form
                          ref={companyNameContactRef}
                          onSubmit={submitCompanyNameContact}
                        >
                          <InputAsText
                            name="companyNameContactData"
                            onBlur={onCompanyNameContactSubmit}
                            defaultValue={orderData.company.contact_name}
                          />
                        </Form>
                        <Form
                          ref={companyEmailRef}
                          onSubmit={submitCompanyEmail}
                        >
                          <InputAsText
                            name="companyEmailData"
                            onBlur={onCompanyEmailSubmit}
                            defaultValue={orderData.company.email}
                          />
                        </Form>
                        <Form
                          ref={companyPhoneRef}
                          onSubmit={submitCompanyPhone}
                        >
                          <InputAsTextWithMask
                            name="companyPhoneData"
                            onBlur={onCompanyPhoneSubmit}
                            defaultValue={orderData.company.formatted_phone}
                            mask="(99) 9999-9999"
                            maskChar={null}
                            styled={{ width: '8em' }}
                          />
                        </Form>
                        <Form
                          ref={companyMobilePhoneRef}
                          onSubmit={submitCompanyMobilePhone}
                        >
                          <InputAsTextWithMask
                            name="companyMobilePhoneData"
                            onBlur={onCompanyMobilePhoneSubmit}
                            defaultValue={orderData.company.formatted_mobile}
                            mask="(99) 9 9999-9999"
                            maskChar={null}
                            styled={{ width: '8em' }}
                          />
                        </Form>
                      </>
                    ) : (
                      <>
                        <p>{orderData.company.name}</p>
                        <p>{orderData.company.formatted_cnpj_cpf}</p>
                        <p>{orderData.company.contact_name}</p>
                        <p>{orderData.company.email}</p>
                        <p>{orderData.company.formatted_phone}</p>
                        <p>{orderData.company.formatted_mobile}</p>
                      </>
                    )}
                  </DataForm>
                </CompanyContainer>
                <OrdersProductsContainer>
                  <TitlesForm>
                    <p>Pedido Nº:</p>
                    <p>Vendedor:</p>
                    <p>Valor total:</p>
                    <p>Data:</p>
                    <p>Status:</p>
                    <p>Data de aprovação:</p>
                  </TitlesForm>
                  <DataForm>
                    <p>{orderData.order_number}</p>
                    <p>{orderData.seller.name}</p>
                    <p>{from !== 'TechnicalArea' && totalValue}</p>
                    <p>{orderData.created_at}</p>
                    {from !== 'Comercial' &&
                      orderData.status_order === 'Rascunho' && (
                        <div className="status">
                          <RiDraftFill
                            className={`faRegClock ${riDraftFill}`}
                          />
                          <span>Rascunho</span>
                        </div>
                      )}
                    {from !== 'Comercial' &&
                      orderData.status_order === 'Aguardando' && (
                        <div className="status">
                          <FaRegClock className={`faRegClock ${faRegClock}`} />
                          <span>Aguardando cliente</span>
                        </div>
                      )}
                    {from !== 'Comercial' &&
                      orderData.status_order === 'Reprovado' && (
                        <div className="status">
                          <IoMdThumbsDown
                            className={`ioThumbsDown ${ioThumbsDown}`}
                          />
                          <span>Reprovado</span>
                        </div>
                      )}
                    {from !== 'Comercial' &&
                      orderData.status_order === 'Aprovado' && (
                        <div className="status">
                          <FaCheckCircle
                            className={`faGreenCheck ${faGreenCheck}`}
                          />
                          <span>Aprovado</span>
                        </div>
                      )}
                    {from !== 'Comercial' &&
                      orderData.status_order === 'Cancelado' && (
                        <div className="status">
                          <FaTimes className={`faTimes ${faTimes}`} />
                          <span>Cancelado</span>
                        </div>
                      )}
                    {from === 'Comercial' && (
                      <Status>
                        <FormControl className={formControl}>
                          <Select
                            labelId="demo-simple-select-label"
                            id="data-select"
                            value={orderData.status_order}
                            defaultValue=""
                            displayEmpty
                            onChange={(e: ChangeEvent<{ value: unknown }>) => {
                              updateStatusOrder(e);
                            }}
                          >
                            <MenuItem
                              value="Rascunho"
                              disabled={user.permissions !== 'Admin'}
                            >
                              <RiDraftFill className={riDraftFill} />
                              Rascunho
                            </MenuItem>
                            <MenuItem
                              value="Aguardando"
                              disabled={
                                orderData.status_order !== 'Rascunho' &&
                                orderData.status_order !== 'Aguardando' &&
                                user.permissions !== 'Admin'
                              }
                            >
                              <FaRegClock className={faRegClock} />
                              Aguardando cliente
                            </MenuItem>
                            <MenuItem
                              value="Reprovado"
                              disabled={
                                orderData.status_order !== 'Rascunho' &&
                                orderData.status_order !== 'Aguardando' &&
                                orderData.status_order !== 'Reprovado' &&
                                user.permissions !== 'Admin'
                              }
                            >
                              <IoMdThumbsDown className={ioThumbsDown} />
                              Reprovado
                            </MenuItem>
                            <MenuItem
                              value="Aprovado"
                              disabled={
                                orderData.status_order !== 'Rascunho' &&
                                orderData.status_order !== 'Aguardando' &&
                                orderData.status_order !== 'Reprovado' &&
                                orderData.status_order !== 'Aprovado' &&
                                user.permissions !== 'Admin'
                              }
                            >
                              <FaCheckCircle className={faGreenCheck} />
                              Aprovado
                            </MenuItem>
                            <MenuItem
                              value="Cancelado"
                              disabled={
                                orderData.status_order !== 'Rascunho' &&
                                orderData.status_order !== 'Aguardando' &&
                                orderData.status_order !== 'Reprovado' &&
                                orderData.status_order !== 'Aprovado' &&
                                orderData.status_order !== 'Cancelado' &&
                                user.permissions !== 'Admin'
                              }
                            >
                              <FaTimes className={faTimes} />
                              Cancelado
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Status>
                    )}
                    <p>
                      {orderData.status_order === 'Aprovado' &&
                        orderData.formatted_approved_at}
                    </p>
                  </DataForm>
                </OrdersProductsContainer>
              </PrimaryContent>
              <SecondaryContent isModalOpen={newProductOpen || productViewOpen}>
                {((from === 'Comercial' &&
                  !orderData.status_delivery &&
                  !orderData.status_billing &&
                  !orderData.status_payment) ||
                  (from === 'Comercial' && user.permissions === 'Admin')) && (
                  <AddProductButton
                    type="button"
                    color={color}
                    onClick={() => overlapNewProductOpen(!newProductOpen)}
                  >
                    <MaterialTooltip
                      title="Adicionar Serviço"
                      arrow
                      placement="top"
                    >
                      <FaPlus />
                    </MaterialTooltip>
                  </AddProductButton>
                )}
                <DeliveryData>
                  <TitlesForm>
                    <p>Condições de entrega:</p>
                    <p>Data de entrega solicitada:</p>
                    <p>
                      {orderData.status_delivery === 'Entregue'
                        ? 'Data da entrega:'
                        : orderData.status_delivery === 'Concluído'
                        ? 'Data da conclusão:'
                        : 'Data de entrega prevista:'}
                    </p>
                    <p>Status área técnica:</p>
                  </TitlesForm>
                  <DataForm>
                    {from === 'Comercial' && !orderData.status_delivery && (
                      <>
                        <Form
                          ref={deliveryConditionsRef}
                          onSubmit={submitDeliveryConditions}
                        >
                          <InputAsText
                            name="deliveryConditionsData"
                            onBlur={onDeliveryConditionsSubmit}
                            defaultValue={orderData.delivery_conditions}
                          />
                        </Form>
                        <Form
                          ref={requestedDeliveryDateRef}
                          onSubmit={submitRequestedDeliveryDate}
                        >
                          {orderData?.formatted_requested_delivery_date && (
                            <InputAsTextWithMask
                              name="requestedDeliveryDateData"
                              onBlur={onRequestedDeliveryDateSubmit}
                              defaultValue={
                                orderData.formatted_requested_delivery_date
                              }
                              mask="99/99/9999"
                              maskChar={null}
                              styled={{ width: '6em' }}
                            />
                          )}
                          {!orderData?.formatted_requested_delivery_date && (
                            <InputAsTextWithMask
                              name="requestedDeliveryDateData"
                              onBlur={onRequestedDeliveryDateSubmit}
                              defaultValue={
                                orderData.formatted_requested_delivery_date
                              }
                              mask="99/99/9999"
                              maskChar={null}
                              styled={{ width: '6em' }}
                            />
                          )}
                        </Form>
                        <p>{orderData?.formatted_delivery_date}</p>
                      </>
                    )}
                    {from === 'Comercial' && !!orderData.status_delivery && (
                      <>
                        <p>{orderData?.delivery_conditions}</p>
                        <p>{orderData?.formatted_requested_delivery_date}</p>
                        <p>{orderData?.formatted_delivery_date}</p>
                      </>
                    )}
                    {from === 'Billing' && (
                      <>
                        <p>{orderData?.delivery_conditions}</p>
                        <p>{orderData?.formatted_requested_delivery_date}</p>
                        <p>{orderData?.formatted_delivery_date}</p>
                      </>
                    )}
                    {from === 'TechnicalArea' && (
                      <>
                        <p>{orderData?.delivery_conditions}</p>
                        <p>{orderData?.formatted_requested_delivery_date}</p>
                        <Form
                          ref={deliveryDateRef}
                          onSubmit={submitDeliveryDate}
                        >
                          {orderData?.formatted_delivery_date && (
                            <InputAsTextWithMask
                              name="deliveryDateData"
                              onBlur={onDeliveryDateSubmit}
                              defaultValue={orderData.formatted_delivery_date}
                              mask="99/99/9999"
                              maskChar={null}
                              styled={{ width: '6em' }}
                            />
                          )}
                          {!orderData?.formatted_delivery_date && (
                            <InputAsTextWithMask
                              name="deliveryDateData"
                              onBlur={onDeliveryDateSubmit}
                              defaultValue={orderData.formatted_delivery_date}
                              mask="99/99/9999"
                              maskChar={null}
                              styled={{ width: '6em' }}
                            />
                          )}
                        </Form>
                      </>
                    )}
                    {from !== 'TechnicalArea' && !orderData.status_delivery && (
                      <p />
                    )}
                    {from !== 'TechnicalArea' &&
                      orderData.status_delivery === 'Aguardando' && (
                        <div className="status">
                          <FaRegClock className={faRegClock} />
                          <span>Aguardando área técnica</span>
                        </div>
                      )}
                    {from !== 'TechnicalArea' &&
                      orderData.status_delivery === 'Agendado' && (
                        <div className="status">
                          <FaCalendarAlt className={faCalendarAlt} />
                          <span>Agendado com o cliente</span>
                        </div>
                      )}
                    {from !== 'TechnicalArea' &&
                      orderData.status_delivery === 'Execução' && (
                        <div className="status">
                          <HiOutlineRefresh
                            className={`hiRefresh ${hiRefresh}`}
                          />
                          <span>Em execução</span>
                        </div>
                      )}
                    {from !== 'TechnicalArea' &&
                      orderData.status_delivery === 'Concluído' && (
                        <div className="status">
                          <FaRegCheckCircle
                            className={`faGrayCheck ${faGrayCheck}`}
                          />
                          <span>Concluído</span>
                        </div>
                      )}
                    {from !== 'TechnicalArea' &&
                      orderData.status_delivery === 'Entregue' && (
                        <div className="status">
                          <FaCheckCircle
                            className={`faGreenCheck ${faGreenCheck}`}
                          />
                          <span>Entregue</span>
                        </div>
                      )}
                    {from !== 'TechnicalArea' &&
                      orderData.status_delivery === 'Pendência' && (
                        <div className="status">
                          <GoAlert className={`goAlert ${goAlert}`} />
                          <span>Pendência do cliente</span>
                        </div>
                      )}
                    {from !== 'TechnicalArea' &&
                      orderData.status_delivery === 'Cancelado' && (
                        <div className="status">
                          <FaTimes className={`faTimes ${faTimes}`} />
                          <span>Cancelado</span>
                        </div>
                      )}
                    {from === 'TechnicalArea' && (
                      <Status>
                        <FormControl className={formControl}>
                          <Select
                            labelId="demo-simple-select-label"
                            id="data-select"
                            value={orderData.status_delivery}
                            defaultValue=""
                            displayEmpty
                            onChange={(e: ChangeEvent<{ value: unknown }>) => {
                              updateStatusDelivery(e);
                            }}
                          >
                            <MenuItem
                              value="Aguardando"
                              disabled={user.permissions !== 'Admin'}
                            >
                              <FaRegClock className={faRegClock} />
                              Aguardando área técnica
                            </MenuItem>
                            <MenuItem
                              value="Agendado"
                              disabled={
                                (!!orderData.status_delivery &&
                                  orderData.status_delivery !== 'Aguardando' &&
                                  orderData.status_delivery !== 'Pendência' &&
                                  orderData.status_delivery !== 'Agendado' &&
                                  user.permissions !== 'Admin') ||
                                orderData.status_order === 'Cancelado'
                              }
                            >
                              <FaCalendarAlt className={faCalendarAlt} />
                              Agendado com o cliente
                            </MenuItem>
                            <MenuItem
                              value="Execução"
                              disabled={
                                (!!orderData.status_delivery &&
                                  orderData.status_delivery !== 'Aguardando' &&
                                  orderData.status_delivery !== 'Agendado' &&
                                  orderData.status_delivery !== 'Pendência' &&
                                  orderData.status_delivery !== 'Execução' &&
                                  user.permissions !== 'Admin') ||
                                orderData.status_order === 'Cancelado'
                              }
                            >
                              <HiOutlineRefresh className={hiRefresh} />
                              Em execução
                            </MenuItem>
                            <MenuItem
                              value="Concluído"
                              disabled={
                                (!!orderData.status_delivery &&
                                  orderData.status_delivery !== 'Aguardando' &&
                                  orderData.status_delivery !== 'Agendado' &&
                                  orderData.status_delivery !== 'Execução' &&
                                  orderData.status_delivery !== 'Pendência' &&
                                  orderData.status_delivery !== 'Concluído' &&
                                  user.permissions !== 'Admin') ||
                                orderData.status_order === 'Cancelado'
                              }
                            >
                              <FaRegCheckCircle className={faGrayCheck} />
                              Concluído
                            </MenuItem>
                            <MenuItem
                              value="Entregue"
                              disabled={
                                (!!orderData.status_delivery &&
                                  orderData.status_delivery !== 'Aguardando' &&
                                  orderData.status_delivery !== 'Agendado' &&
                                  orderData.status_delivery !== 'Execução' &&
                                  orderData.status_delivery !== 'Concluído' &&
                                  orderData.status_delivery !== 'Pendência' &&
                                  orderData.status_delivery !== 'Entregue' &&
                                  user.permissions !== 'Admin') ||
                                orderData.status_order === 'Cancelado'
                              }
                            >
                              <FaCheckCircle className={faGreenCheck} />
                              Entregue
                            </MenuItem>
                            <MenuItem
                              value="Pendência"
                              disabled={
                                (!!orderData.status_delivery &&
                                  orderData.status_delivery === 'Entregue' &&
                                  user.permissions !== 'Admin') ||
                                orderData.status_order === 'Cancelado'
                              }
                            >
                              <GoAlert className={goAlert} />
                              Pendência do cliente
                            </MenuItem>
                            <MenuItem
                              value="Cancelado"
                              disabled={
                                (!!orderData.status_delivery &&
                                  orderData.status_delivery !== 'Aguardando' &&
                                  orderData.status_delivery !== 'Agendado' &&
                                  orderData.status_delivery !== 'Execução' &&
                                  orderData.status_delivery !== 'Concluído' &&
                                  orderData.status_delivery !== 'Entregue' &&
                                  orderData.status_delivery !== 'Pendência' &&
                                  orderData.status_delivery !== 'Cancelado' &&
                                  user.permissions !== 'Admin') ||
                                orderData.status_order !== 'Cancelado'
                              }
                            >
                              <FaTimes className={faTimes} />
                              Cancelado
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Status>
                    )}
                  </DataForm>
                </DeliveryData>
                <BillingData>
                  <TitlesForm>
                    <p>Forma de pagamento:</p>
                    <p>Vencimento:</p>
                    <p>Status faturamento:</p>
                    <p>Status financeiro:</p>
                  </TitlesForm>
                  <DataForm>
                    {from === 'Comercial' && !orderData.status_billing && (
                      <>
                        <Form ref={paymentWayRef} onSubmit={submitPaymentWay}>
                          <InputAsText
                            name="paymentWayData"
                            onBlur={onPaymentWaySubmit}
                            defaultValue={orderData.payment_way}
                          />
                        </Form>
                        <Form ref={dueDateRef} onSubmit={submitDueDate}>
                          <InputAsText
                            name="dueDateData"
                            onBlur={onDueDateSubmit}
                            defaultValue={orderData.due_date}
                          />
                        </Form>
                      </>
                    )}
                    {(from === 'Billing' ||
                      (from !== 'TechnicalArea' &&
                        !!orderData.status_billing)) && (
                      <>
                        <p>{orderData?.payment_way}</p>
                        <p>{orderData?.due_date}</p>
                      </>
                    )}
                    {from === 'TechnicalArea' && (
                      <>
                        <p />
                        <p />
                      </>
                    )}
                    {from !== 'Billing' && !orderData.status_billing && <p />}
                    {from !== 'Billing' &&
                      orderData.status_billing === 'Aguardando' && (
                        <div className="status">
                          <FaRegClock className={faRegClock} />
                          <span>Aguardando para faturar</span>
                        </div>
                      )}
                    {from !== 'Billing' &&
                      orderData.status_billing === 'Faturado' && (
                        <div className="status">
                          <FaCheckCircle
                            className={`faGreenCheck ${faGreenCheck}`}
                          />
                          <span>Faturado</span>
                        </div>
                      )}
                    {from !== 'Billing' &&
                      orderData.status_billing === 'Cancelado' && (
                        <div className="status">
                          <FaTimes className={`faTimes ${faTimes}`} />
                          <span>Cancelado</span>
                        </div>
                      )}
                    {from === 'Billing' && (
                      <Status>
                        <FormControl className={formControl}>
                          <Select
                            labelId="demo-simple-select-label"
                            id="data-select"
                            value={orderData.status_billing}
                            defaultValue=""
                            displayEmpty
                            onChange={(e: ChangeEvent<{ value: unknown }>) => {
                              updateStatusBilling(e);
                            }}
                          >
                            <MenuItem
                              value="Aguardando"
                              disabled={user.permissions !== 'Admin'}
                            >
                              <FaRegClock className={faRegClock} />
                              Aguardando para faturar
                            </MenuItem>
                            <MenuItem
                              value="Faturado"
                              disabled={
                                (!!orderData.status_billing &&
                                  orderData.status_billing !== 'Aguardando' &&
                                  orderData.status_billing !== 'Faturado' &&
                                  user.permissions !== 'Admin') ||
                                orderData.status_order === 'Cancelado'
                              }
                            >
                              <FaCheckCircle className={faGreenCheck} />
                              Faturado
                            </MenuItem>
                            <MenuItem
                              value="Cancelado"
                              disabled={
                                (!!orderData.status_billing &&
                                  orderData.status_billing !== 'Aguardando' &&
                                  orderData.status_billing !== 'Faturado' &&
                                  orderData.status_billing !== 'Cancelado' &&
                                  user.permissions !== 'Admin') ||
                                orderData.status_order !== 'Cancelado'
                              }
                            >
                              <FaTimes className={faTimes} />
                              Cancelado
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Status>
                    )}
                    {from !== 'Billing' && !orderData.status_payment && <p />}
                    {from !== 'Billing' &&
                      orderData.status_payment === 'Aguardando' && (
                        <div className="status">
                          <FaRegClock className={faRegClock} />
                          <span>Aguardando Pagamento</span>
                        </div>
                      )}
                    {from !== 'Billing' && orderData.status_payment === 'Pago' && (
                      <div className="status">
                        <FaCheckCircle
                          className={`faGreenCheck ${faGreenCheck}`}
                        />
                        <span>Pago</span>
                      </div>
                    )}
                    {from !== 'Billing' &&
                      orderData.status_payment === 'Vencido' && (
                        <div className="status">
                          <BiCalendarX
                            className={`biCalendarX ${biCalendarX}`}
                          />
                          <span>Vencido</span>
                        </div>
                      )}
                    {from !== 'Billing' &&
                      orderData.status_payment === 'Cancelado' && (
                        <div className="status">
                          <FaTimes className={`faTimes ${faTimes}`} />
                          <span>Cancelado</span>
                        </div>
                      )}
                    {from === 'Billing' && (
                      <Status>
                        <FormControl className={formControl}>
                          <Select
                            labelId="demo-simple-select-label"
                            id="data-select"
                            value={orderData.status_payment}
                            defaultValue=""
                            displayEmpty
                            onChange={(e: ChangeEvent<{ value: unknown }>) => {
                              updateStatusPayment(e);
                            }}
                          >
                            {(!orderData.status_payment ||
                              user.permissions === 'Admin') && (
                              <MenuItem value="">
                                -- Selecione um status --
                              </MenuItem>
                            )}
                            <MenuItem
                              value="Aguardando"
                              disabled={
                                (!!orderData.status_payment &&
                                  orderData.status_payment !== 'Aguardando' &&
                                  user.permissions !== 'Admin') ||
                                orderData.status_order === 'Cancelado'
                              }
                            >
                              <FaRegClock className={faRegClock} />
                              Aguardando Pagamento
                            </MenuItem>
                            <MenuItem
                              value="Pago"
                              disabled={
                                (!!orderData.status_payment &&
                                  orderData.status_payment !== 'Aguardando' &&
                                  orderData.status_payment !== 'Pago' &&
                                  orderData.status_payment !== 'Vencido' &&
                                  user.permissions !== 'Admin') ||
                                orderData.status_order === 'Cancelado'
                              }
                            >
                              <FaCheckCircle className={faGreenCheck} />
                              Pago
                            </MenuItem>
                            {orderData.status_payment !== 'Pago' && (
                              <MenuItem
                                value="Vencido"
                                disabled={
                                  (!!orderData.status_payment &&
                                    orderData.status_payment !== 'Aguardando' &&
                                    orderData.status_payment !== 'Vencido' &&
                                    user.permissions !== 'Admin') ||
                                  orderData.status_order === 'Cancelado'
                                }
                              >
                                <BiCalendarX className={biCalendarX} />
                                Vencido
                              </MenuItem>
                            )}
                            <MenuItem
                              value="Cancelado"
                              disabled={
                                (!!orderData.status_payment &&
                                  orderData.status_payment !== 'Aguardando' &&
                                  orderData.status_payment !== 'Pago' &&
                                  orderData.status_payment !== 'Vencido' &&
                                  orderData.status_payment !== 'Cancelado' &&
                                  user.permissions !== 'Admin') ||
                                orderData.status_order !== 'Cancelado'
                              }
                            >
                              <FaTimes className={faTimes} />
                              Cancelado
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Status>
                    )}
                  </DataForm>
                </BillingData>
              </SecondaryContent>
              <ProductsOrderContent
                isModalOpen={newProductOpen || productViewOpen}
              >
                <TitleRow>
                  <TitleProductName>SERVIÇO</TitleProductName>
                  <TitleProductDescription>
                    DESCRIÇÃO DO SERVIÇO
                  </TitleProductDescription>
                  {from !== 'TechnicalArea' && (
                    <TitleProductValue>VALOR</TitleProductValue>
                  )}
                </TitleRow>
                {orderData.orders_products &&
                  orderData.orders_products.length > 0 &&
                  orderData.orders_products.map((product) => (
                    <ProductRow color={color} key={product.id}>
                      <ProductName
                        type="button"
                        onClick={() => handleSelectProduct(product)}
                      >
                        <span>{product.product && product.product.name}</span>
                      </ProductName>
                      <ProductDescription
                        type="button"
                        onClick={() => handleSelectProduct(product)}
                      >
                        <span>{product.product_description}</span>
                      </ProductDescription>
                      {from !== 'TechnicalArea' && (
                        <ProductValue>
                          <button
                            className="product-value"
                            type="button"
                            onClick={() => handleSelectProduct(product)}
                          >
                            <span>R$</span>
                            <span>
                              {formatValue(Number(product.product_value))}
                            </span>
                          </button>
                          {((from === 'Comercial' &&
                            !orderData.status_delivery &&
                            !orderData.status_billing &&
                            !orderData.status_payment) ||
                            (from === 'Comercial' &&
                              user.permissions === 'Admin')) && (
                            <div>
                              <button
                                className="edit-product"
                                type="button"
                                onClick={() => handleSelectProduct(product)}
                              >
                                <MaterialTooltip
                                  title="Alterar"
                                  arrow
                                  placement="left"
                                >
                                  <FaEdit className="faEdit" />
                                </MaterialTooltip>
                              </button>
                              <button
                                className="delete-product"
                                type="button"
                                onClick={() => {
                                  handleDeleteOrderProductItem(product.id);
                                }}
                              >
                                <MaterialTooltip
                                  title="Excluir"
                                  arrow
                                  placement="left"
                                >
                                  <FaTrashAlt className="faTrashAlt" />
                                </MaterialTooltip>
                              </button>
                            </div>
                          )}
                        </ProductValue>
                      )}
                    </ProductRow>
                  ))}
              </ProductsOrderContent>
            </ThemeProvider>
          </Container>
        </>
      )}
    </OrderOverlap>
  );
};

export default Order;
