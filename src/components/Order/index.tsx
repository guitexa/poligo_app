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
  FaCheckCircle,
  FaRegClock,
  FaTimes,
  FaCalendarTimes,
  FaEdit,
  FaTrashAlt,
} from 'react-icons/fa';
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

import { useToast } from '../../hooks/toast';
import { useOverlap } from '../../hooks/overlap';
import { useAuth } from '../../hooks/auth';
import { useSearch } from '../../hooks/search';
import api from '../../services/api';

import MaterialTooltip from '../MaterialTooltip';
import NewProduct from '../NewProduct';
import ProductView from '../ProductView';
import InputAsText from '../InputAsText';
import InputAsTextWithMask from '../InputAsTextWithMask';
import HeaderButton from '../HeaderButton';

import { OrderData, OrderProductData, ClientData } from '../SearchResults';

import {
  OrderOverlap,
  ModalOverlap,
  Container,
  PrimaryContent,
  ClientContainer,
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
  clientNameData: string;
  clientCnpjCpfData: string;
  clientNameContactData: string;
  clientEmailData: string;
  clientPhoneData: string;
  clientMobilePhoneData: string;
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
  const [clientUpdated, setClientUpdated] = useState(false);

  // Armazena se existe algum erro em algum campo
  const [counterErrors, setCounterErrors] = useState<string[]>([]);

  const deliveryConditionsRef = useRef<FormHandles>(null);
  const requestedDeliveryDateRef = useRef<FormHandles>(null);
  const deliveryDateRef = useRef<FormHandles>(null);
  const paymentWayRef = useRef<FormHandles>(null);
  const dueDateRef = useRef<FormHandles>(null);
  const clientNameRef = useRef<FormHandles>(null);
  const clientCnpjCpfRef = useRef<FormHandles>(null);
  const clientNameContactRef = useRef<FormHandles>(null);
  const clientEmailRef = useRef<FormHandles>(null);
  const clientPhoneRef = useRef<FormHandles>(null);
  const clientMobilePhoneRef = useRef<FormHandles>(null);

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
  const { toUpdateSearchResults } = useSearch();

  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      formControl: {
        margin: theme.spacing(1),
      },
      faCheck: {
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
      faCalendarTimes: {
        color: '#c00000',
        margin: '0 4px 0 0',
      },
      ioThumbsDown: {
        color: '#c00000',
        fontSize: '15px',
        margin: '0 4px 0 -2px',
      },
      hiRefresh: {
        color: '#000',
        margin: '0 4px 0 0',
      },
    })
  );

  const {
    formControl,
    faCheck,
    faRegClock,
    riDraftFill,
    faTimes,
    faCalendarTimes,
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
              margin: '0 10px -1px -4px',
              fontSize: '20px',
            },
            '&[class*="riDraftFill"]': {
              margin: '0 10px -1px -3px',
              fontSize: '17px',
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
                margin: '0 10px -1px -4px',
                fontSize: '20px',
              },
              '&[class*="riDraftFill"]': {
                margin: '0 10px -1px -3px',
                fontSize: '17px',
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
                margin: '0 10px -1px -4px',
                fontSize: '20px',
              },
              '&[class*="riDraftFill"]': {
                margin: '0 10px -1px -3px',
                fontSize: '17px',
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
                  margin: '0 10px -1px -4px',
                  fontSize: '20px',
                },
                '&[class*="riDraftFill"]': {
                  margin: '0 10px -1px -3px',
                  fontSize: '17px',
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
    try {
      checkToken();
      api.get<OrderData>(`/orders/${order_id}`).then((response) => {
        const {
          client,
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
        if (client) {
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
            client: {
              ...client,
              formatted_cnpj_cpf:
                client.cnpj_cpf.length > 11
                  ? formatToCNPJ(client.cnpj_cpf)
                  : formatToCPF(client.cnpj_cpf),
              formatted_phone: formatToPhone(client.phone),
              formatted_mobile: client.mobile
                ? formatToPhone(client.mobile)
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
      });
    } catch (err) {
      addToast({
        type: 'error',
        description: 'Ocorreu um erro na comunicação com o servidor',
      });
    }
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
    (e: ChangeEvent<{ value: unknown }>) => {
      if (e.target.value === 'Aprovado') {
        // Se o valor recebido for 'Aprovado' atualiza também a data de aprovação

        // Armazena o valor recebido no estado
        orderData.status_order = e.target.value;
        orderData.approved_at = String(new Date(Date.now()));
        orderData.formatted_approved_at = formatToDate(new Date(Date.now()));

        // Envia atualização para o component searchResults
        toUpdateSearchResults({
          order_id,
          status_order: e.target.value,
        });

        // Define que o banco de dados deve ser atualizado
        setOrderUpdated(true);
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
    [orderData, order_id, toUpdateSearchResults]
  );

  // Função para atualizar o status da área técnica e/ou o técnico executante
  const updateStatusDelivery = useCallback(
    (e: ChangeEvent<{ value: unknown }>) => {
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
      else if (!e.target.value) {
        // Se não houver valor recebido limpa o status e remove técnico executante

        // Armazena o valor recebido no estado
        orderData.status_delivery = '';
        orderData.technical = undefined;

        // Envia atualização para o component searchResults
        toUpdateSearchResults({
          order_id,
          status_delivery: '',
          technical: null,
        });

        // Define que o banco de dados deve ser atualizado
        setOrderUpdated(true);
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
    [orderData, order_id, toUpdateSearchResults, user]
  );

  // Função para atualizar o status do faturamento
  const updateStatusBilling = useCallback(
    (e: ChangeEvent<{ value: unknown }>) => {
      // Armazena o valor recebido no estado
      orderData.status_billing = e.target.value;

      // Envia atualização para o component searchResults
      toUpdateSearchResults({
        order_id,
        status_billing: e.target.value,
      });

      // Define que o banco de dados deve ser atualizado
      setOrderUpdated(true);
    },
    [orderData, order_id, toUpdateSearchResults]
  );

  // Função para atualizar o status do financeiro
  const updateStatusPayment = useCallback(
    (e: ChangeEvent<{ value: unknown }>) => {
      // Armazena o valor recebido no estado
      orderData.status_payment = e.target.value;

      // Envia atualização para o component searchResults
      toUpdateSearchResults({
        order_id,
        status_payment: e.target.value,
      });

      // Define que o banco de dados deve ser atualizado
      setOrderUpdated(true);
    },
    [orderData, order_id, toUpdateSearchResults]
  );

  // Função para atualizar as condições de pagamento
  const submitDeliveryConditions = useCallback(
    ({ deliveryConditionsData }: InputData) => {
      // Verifica se o valor recebido é diferente do existente
      if (orderData.delivery_conditions !== deliveryConditionsData) {
        // Armazena o valor recebido no estado
        orderData.delivery_conditions = deliveryConditionsData;

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
      // Verifica se o valor recebido é diferente do existente
      if (orderData.payment_way !== paymentWayData) {
        // Armazena o valor recebido no estado
        orderData.payment_way = paymentWayData;

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
      // Verifica se o valor recebido é diferente do existente
      if (orderData.due_date !== dueDateData) {
        // Armazena o valor recebido no estado
        orderData.due_date = dueDateData;

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
  const submitClientName = useCallback(
    ({ clientNameData }: InputData) => {
      // Verifica se o valor recebido é diferente do existente
      if (orderData?.client.name !== clientNameData) {
        // Verifica se o valor recebido é um nome válido
        if (!clientNameData) {
          // Define um erro
          clientNameRef.current?.setErrors({
            clientNameData: 'Favor digitar um nome válido',
          });

          // Define que possui um erro na edição do cliente
          if (!counterErrors.find((e) => e === 'clientName')) {
            setCounterErrors((state) => [...state, 'clientName']);
          }

          addToast({
            type: 'error',
            description: 'Favor digitar um nome válido',
          });
        }
        // Se houver nome de cliente válido o valor será atualizado
        else {
          // Armazena o valor recebido no estado
          orderData.client.name = clientNameData;

          // Envia atualização para o component searchResults
          toUpdateSearchResults({
            order_id,
            client_name: clientNameData,
            client_id: orderData.client.id,
          });

          // Define que o banco de dados deve ser atualizado
          setClientUpdated(true);

          // Limpa os erros
          clientNameRef.current?.setErrors({});
          setCounterErrors((state) => state.filter((e) => e !== 'clientName'));
        }
      }
      // Verifica se o valor recebido é igual ao cadastrado e limpa possíveis erros
      else if (orderData?.client.name === clientNameData) {
        // Limpa os erros
        clientNameRef.current?.setErrors({});
        setCounterErrors((state) => state.filter((e) => e !== 'clientName'));
      }
    },
    [addToast, counterErrors, orderData, order_id, toUpdateSearchResults]
  );

  // Função para executar a função submitClientName
  const onClientNameSubmit = useCallback(() => {
    clientNameRef.current?.submitForm();
  }, []);

  // Função para atualizar o CNPJ/CPF da empresa
  const submitClientCnpjCpf = useCallback(
    ({ clientCnpjCpfData }: InputData) => {
      // Remove os caracteres especiais do valor recebido
      const clearClientCnpjCpfData = clientCnpjCpfData.replace(/[^\w\s]/gi, '');

      // Verifica se o valor recebido é diferente do existente
      if (orderData?.client.cnpj_cpf !== clearClientCnpjCpfData) {
        // Verifica se o valor recebido é um CNPJ ou CPF válido
        if (
          !clearClientCnpjCpfData ||
          (!isCNPJ(clearClientCnpjCpfData) && !isCPF(clearClientCnpjCpfData))
        ) {
          // Define um erro
          clientCnpjCpfRef.current?.setErrors({
            clientCnpjCpfData: 'Favor digitar um CPF ou CNPJ válido',
          });

          // Define que possui um erro na edição do cliente
          if (!counterErrors.find((e) => e === 'clientCnpjCpf')) {
            setCounterErrors((state) => [...state, 'clientCnpjCpf']);
          }

          addToast({
            type: 'error',
            description: 'Favor digitar um CPF ou CNPJ válido',
          });
        }
        // Se houver CNPJ ou CPF válido os valores serão atualizados
        else if (
          isCNPJ(clearClientCnpjCpfData) ||
          isCPF(clearClientCnpjCpfData)
        ) {
          // Armazena o valor recebido no estado
          orderData.client.cnpj_cpf = clearClientCnpjCpfData;
          orderData.client.formatted_cnpj_cpf =
            clearClientCnpjCpfData.length > 11
              ? formatToCNPJ(clearClientCnpjCpfData)
              : formatToCPF(clearClientCnpjCpfData);

          // Define que o banco de dados deve ser atualizado
          setClientUpdated(true);

          // Limpa os erros
          clientCnpjCpfRef.current?.setErrors({});
          setCounterErrors((state) =>
            state.filter((e) => e !== 'clientCnpjCpf')
          );
        }
      }
      // Verifica se o valor recebido é igual ao cadastrado e limpa possíveis erros
      else if (orderData?.client.cnpj_cpf === clearClientCnpjCpfData) {
        // Limpa os erros
        clientCnpjCpfRef.current?.setErrors({});
        setCounterErrors((state) => state.filter((e) => e !== 'clientCnpjCpf'));
      }
    },
    [addToast, counterErrors, orderData]
  );

  // Função para executar a função submitClientCnpjCpf
  const onClientCnpjCpfSubmit = useCallback(() => {
    clientCnpjCpfRef.current?.submitForm();
  }, []);

  // Função para atualizar o nome do responsável pela empresa
  const submitClientNameContact = useCallback(
    ({ clientNameContactData }: InputData) => {
      // Verifica se o valor recebido é diferente do existente
      if (orderData?.client.contact_name !== clientNameContactData) {
        // Verifica se o valor recebido é um nome de responsável válido
        if (!clientNameContactData) {
          clientNameContactRef.current?.setErrors({
            clientNameContactData: 'Favor digitar um nome válido',
          });

          // Define que possui um erro na edição do cliente
          if (!counterErrors.find((e) => e === 'clientNameContact')) {
            setCounterErrors((state) => [...state, 'clientNameContact']);
          }

          addToast({
            type: 'error',
            description: 'Favor digitar um nome válido',
          });
        }
        // Se houver nome de responsável válido o valor será atualizado
        else {
          // Armazena o valor recebido no estado
          orderData.client.contact_name = formatToCapitalized(
            clientNameContactData,
            {
              trimTrailingWhiteSpaces: false,
            }
          );

          // Define que o banco de dados deve ser atualizado
          setClientUpdated(true);

          // Limpa os erros
          clientNameContactRef.current?.setErrors({});
          setCounterErrors((state) =>
            state.filter((e) => e !== 'clientNameContact')
          );
        }
      }
      // Verifica se o valor recebido é igual ao cadastrado e limpa possíveis erros
      else if (orderData?.client.contact_name === clientNameContactData) {
        // Limpa os erros
        clientNameContactRef.current?.setErrors({});
        setCounterErrors((state) =>
          state.filter((e) => e !== 'clientNameContact')
        );
      }
    },
    [addToast, counterErrors, orderData]
  );

  // Função para executar a função submitClientNameContact
  const onClientNameContactSubmit = useCallback(() => {
    clientNameContactRef.current?.submitForm();
  }, []);

  // Função para atualizar o e-mail da empresa
  const submitClientEmail = useCallback(
    ({ clientEmailData }: InputData) => {
      // Verifica se o valor recebido é diferente do existente
      if (orderData?.client.email !== clientEmailData.toLocaleLowerCase()) {
        // Verifica se o valor recebido é um e-mail válido
        if (!isEmail(clientEmailData) || !clientEmailData) {
          // Define um erro
          clientEmailRef.current?.setErrors({
            clientEmailData: 'Favor digitar um e-mail válido',
          });

          // Define que possui um erro na edição do cliente
          if (!counterErrors.find((e) => e === 'clientEmail')) {
            setCounterErrors((state) => [...state, 'clientEmail']);
          }

          addToast({
            type: 'error',
            description: 'Favor digitar um e-mail válido',
          });
        }
        // Se houver e-mail válido o valor será atualizado
        else {
          // Armazena o valor recebido no estado
          orderData.client.email = clientEmailData.toLocaleLowerCase();

          // Define que o banco de dados deve ser atualizado
          setClientUpdated(true);

          // Limpa os erros
          clientEmailRef.current?.setErrors({});
          setCounterErrors((state) => state.filter((e) => e !== 'clientEmail'));
        }
      }
      // Verifica se o valor recebido é igual ao cadastrado e limpa possíveis erros
      else if (
        orderData?.client.email === clientEmailData.toLocaleLowerCase()
      ) {
        // Limpa os erros
        clientEmailRef.current?.setErrors({});
        setCounterErrors((state) => state.filter((e) => e !== 'clientEmail'));
      }
    },
    [addToast, counterErrors, orderData]
  );
  // Função para executar a função submitClientEmail
  const onClientEmailSubmit = useCallback(() => {
    clientEmailRef.current?.submitForm();
  }, []);

  // Função para atualizar o telefone da empresa
  const submitClientPhone = useCallback(
    ({ clientPhoneData }: InputData) => {
      // Remove os caracteres especiais do valor recebido
      const clearClientPhoneData = clientPhoneData.replace(/[^\w]/gi, '');

      // Verifica se o valor recebido é diferente do existente
      if (orderData?.client.phone !== clearClientPhoneData) {
        // Verifica se o valor recebido é um telefone válido
        if (clearClientPhoneData && !isPhone(clearClientPhoneData)) {
          // Define um erro
          clientPhoneRef.current?.setErrors({
            clientPhoneData: 'Favor digitar um telefone válido',
          });

          // Define que possui um erro na edição do cliente
          if (!counterErrors.find((e) => e === 'clientPhone')) {
            setCounterErrors((state) => [...state, 'clientPhone']);
          }

          addToast({
            type: 'error',
            description: 'Favor digitar um telefone válido',
          });
        }
        // Verifica se o celular já não está vazio
        else if (!clearClientPhoneData && !orderData?.client.mobile) {
          // Define um erro
          clientPhoneRef.current?.setErrors({
            clientPhoneData: 'Favor digitar um telefone ou celular válido',
          });

          // Define que possui um erro na edição do cliente
          if (!counterErrors.find((e) => e === 'clientPhone')) {
            setCounterErrors((state) => [...state, 'clientPhone']);
          }

          addToast({
            type: 'error',
            description: 'Favor digitar um telefone ou celular válido',
          });
        }
        // Se o valor recebido for um telefone válido será atualizado
        else if (isPhone(clearClientPhoneData)) {
          // Armazena o valor recebido no estado
          orderData.client.phone = clearClientPhoneData;
          orderData.client.formatted_phone = formatToPhone(
            clearClientPhoneData
          );

          // Define que o banco de dados deve ser atualizado
          setClientUpdated(true);

          // Limpa os erros
          clientPhoneRef.current?.setErrors({});
          setCounterErrors((state) => state.filter((e) => e !== 'clientPhone'));
        }
        // Se não houver valor recebido e houver telefone celular, será atualizado
        else if (!clearClientPhoneData && !!orderData?.client.mobile) {
          // Armazena o valor recebido no estado
          orderData.client.phone = clearClientPhoneData;
          orderData.client.formatted_phone = formatToPhone(
            clearClientPhoneData
          );

          // Define que o banco de dados deve ser atualizado
          setClientUpdated(true);

          // Limpa os erros
          clientPhoneRef.current?.setErrors({});
          setCounterErrors((state) => state.filter((e) => e !== 'clientPhone'));
        }
      }
      // Verifica se o valor recebido é igual ao cadastrado e limpa possíveis erros
      else if (orderData?.client.phone === clearClientPhoneData) {
        // Limpa os erros
        clientPhoneRef.current?.setErrors({});
        setCounterErrors((state) => state.filter((e) => e !== 'clientPhone'));
      }
    },
    [addToast, counterErrors, orderData]
  );

  // Função para executar a função submitClientPhone
  const onClientPhoneSubmit = useCallback(() => {
    clientPhoneRef.current?.submitForm();
  }, []);

  // Função para atualizar o celular da empresa
  const submitClientMobilePhone = useCallback(
    ({ clientMobilePhoneData }: InputData) => {
      // Remove os caracteres especiais do valor recebido
      const clearClientMobilePhoneData = clientMobilePhoneData.replace(
        /[^\w]/gi,
        ''
      );

      // Verifica se o valor recebido é diferente do existente
      if (orderData?.client.mobile !== clearClientMobilePhoneData) {
        // Verifica se o valor recebido é um telefone válido
        if (
          clearClientMobilePhoneData &&
          !isPhone(clearClientMobilePhoneData)
        ) {
          // Define um erro
          clientMobilePhoneRef.current?.setErrors({
            clientMobilePhoneData: 'Favor digitar um telefone válido',
          });

          // Define que possui um erro na edição do cliente
          if (!counterErrors.find((e) => e === 'clientMobilePhone')) {
            setCounterErrors((state) => [...state, 'clientMobilePhone']);
          }

          addToast({
            type: 'error',
            description: 'Favor digitar um telefone válido',
          });
        }
        // Verifica se o telefone fixo já não está vazio
        else if (!clearClientMobilePhoneData && !orderData?.client.phone) {
          // Define um erro
          clientMobilePhoneRef.current?.setErrors({
            clientMobilePhoneData:
              'Favor digitar um celular ou telefone válido',
          });

          // Define que possui um erro na edição do cliente
          if (!counterErrors.find((e) => e === 'clientMobilePhone')) {
            setCounterErrors((state) => [...state, 'clientMobilePhone']);
          }

          addToast({
            type: 'error',
            description: 'Favor digitar um telefone ou celular válido',
          });
        }
        // Se o valor recebido for um telefone válido será atualizado
        else if (isPhone(clearClientMobilePhoneData)) {
          // Armazena o valor recebido no estado
          orderData.client.mobile = clearClientMobilePhoneData;
          orderData.client.formatted_mobile = formatToPhone(
            clearClientMobilePhoneData
          );

          // Define que o banco de dados deve ser atualizado
          setClientUpdated(true);

          // Limpa os erros
          clientMobilePhoneRef.current?.setErrors({});
          setCounterErrors((state) =>
            state.filter((e) => e !== 'clientMobilePhone')
          );
        }
        // Se não houver valor recebido e houver telefone fixo, será atualizado
        else if (!clearClientMobilePhoneData && !!orderData?.client.phone) {
          // Armazena o valor recebido no estado
          orderData.client.mobile = clearClientMobilePhoneData;
          orderData.client.formatted_mobile = formatToPhone(
            clearClientMobilePhoneData
          );

          // Define que o banco de dados deve ser atualizado
          setClientUpdated(true);

          // Limpa os erros
          clientMobilePhoneRef.current?.setErrors({});
          setCounterErrors((state) =>
            state.filter((e) => e !== 'clientMobilePhone')
          );
        }
      }
      // Verifica se o valor recebido é igual ao cadastrado e limpa possíveis erros
      else if (orderData?.client.mobile === clearClientMobilePhoneData) {
        // Limpa os erros
        clientMobilePhoneRef.current?.setErrors({});
        setCounterErrors((state) =>
          state.filter((e) => e !== 'clientMobilePhone')
        );
      }
    },
    [addToast, counterErrors, orderData]
  );

  // Função para executar a função submitClientMobilePhone
  const onClientMobilePhoneSubmit = useCallback(() => {
    clientMobilePhoneRef.current?.submitForm();
  }, []);

  // Função para deletar um order_product
  const handleDeleteOrderProductItem = useCallback(
    async (order_product_id: string) => {
      try {
        checkToken();
        await api.delete(`/orders-products/${order_product_id}`);

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
      } catch (err) {
        addToast({
          type: 'error',
          description: 'Ocorreu um erro na comunicação com o servidor',
        });
      }
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

    return productsValues ? formatValueCurrency(productsValues) : '';
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
    try {
      await api.patch<OrderData>(`/orders/${order_id}`, {
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
      });

      setOrderUpdated(false); // Limpa do estado
      overlapOrderOpen(!orderOpen); // Fecha o component
    } catch (err) {
      addToast({
        type: 'error',
        description: 'Ocorreu um erro na comunicação com o servidor',
      });
    }
  }, [addToast, orderData, orderOpen, order_id, overlapOrderOpen]);

  // Função que atualiza o pedido no banco de dados
  const handleSubmitClientToUpdate = useCallback(async () => {
    try {
      await api.patch<ClientData>(`/clients/${orderData.client.id}`, {
        name: orderData.client?.name,
        cnpj_cpf: orderData.client?.cnpj_cpf,
        contact_name: orderData.client?.contact_name,
        email: orderData.client?.email,
        phone: orderData.client?.phone,
        mobile: orderData.client?.mobile,
      });

      setClientUpdated(false); // Limpa do estado
      overlapOrderOpen(!orderOpen); // Fecha o component
    } catch (err) {
      addToast({
        type: 'error',
        description: 'Ocorreu um erro na comunicação com o servidor',
      });
    }
  }, [addToast, orderData.client, orderOpen, overlapOrderOpen]);

  // Função que faz validações ao fechar a order
  const handleCloseOrder = useCallback(() => {
    // Verifica o módulo que o usuário está acessando esse pedido
    if (from === 'TechnicalArea') {
      if (!orderData?.delivery_date && !!orderData?.status_delivery) {
        // Se possui não data de entrega e possui status da área técnica define um erro
        submitDeliveryDate({
          deliveryDateData: '',
        } as InputData);

        addToast({
          type: 'error',
          description: 'Favor preencher a data de entrega',
        });

        return;
      }
    }

    if (newOrderOpen) {
      overlapNewOrderOpen(false);
    }

    // Verifica se não existe erros nos campos
    if (counterErrors.length === 0) {
      try {
        checkToken();
        // Se houve alteração no pedido vai atualizar
        if (orderUpdated && !clientUpdated) {
          handleSubmitOrderToUpdate(); // Atualiza o pedido

          addToast({
            type: 'success',
            description: 'Pedido atualizado com sucesso!',
          });
        }

        // Se houve alteração no cliente vai atualizar
        if (!orderUpdated && clientUpdated) {
          handleSubmitClientToUpdate(); // Atualiza o cliente

          addToast({
            type: 'success',
            description: 'Pedido atualizado com sucesso!',
          });
        }

        // Se houve alteração no pedido e no cliente vai atualizar os dois
        if (clientUpdated && orderUpdated) {
          handleSubmitOrderToUpdate(); // Atualiza o pedido
          handleSubmitClientToUpdate(); // Atualiza o cliente

          addToast({
            type: 'success',
            description: 'Pedido atualizado com sucesso!',
          });
        }
      } catch (err) {
        addToast({
          type: 'error',
          description: 'Ocorreu um erro na comunicação com o servidor',
        });
      }

      // Se não houve alteração vai fechar
      if (!orderUpdated && !clientUpdated) {
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
    counterErrors.length,
    orderData,
    submitDeliveryDate,
    addToast,
    overlapNewOrderOpen,
    orderUpdated,
    clientUpdated,
    checkToken,
    handleSubmitOrderToUpdate,
    handleSubmitClientToUpdate,
    overlapOrderOpen,
    orderOpen,
  ]);

  window.onbeforeunload = () => {
    return clientUpdated || orderUpdated
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
      {orderData?.client && orderData?.seller && (
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
                <ClientContainer>
                  <TitlesForm>
                    <p>Razão social:</p>
                    {orderData.client.cnpj_cpf.length > 11 ? (
                      <p>CNPJ:</p>
                    ) : (
                      <p>CPF:</p>
                    )}
                    <p>Contato:</p>
                    <p>E-mail:</p>
                    <p>Telefone:</p>
                    <p>Celular:</p>
                  </TitlesForm>
                  <DataForm>
                    {from === 'Comercial' && !orderData.status_billing ? (
                      <>
                        <Form ref={clientNameRef} onSubmit={submitClientName}>
                          <InputAsText
                            name="clientNameData"
                            onBlur={onClientNameSubmit}
                            defaultValue={orderData.client.name}
                          />
                        </Form>
                        <Form
                          ref={clientCnpjCpfRef}
                          onSubmit={submitClientCnpjCpf}
                        >
                          {orderData.client.cnpj_cpf.length > 11 ? (
                            <InputAsText
                              name="clientCnpjCpfData"
                              onBlur={onClientCnpjCpfSubmit}
                              defaultValue={orderData.client.formatted_cnpj_cpf}
                              styled={{ width: '10em' }}
                            />
                          ) : (
                            <InputAsText
                              name="clientCnpjCpfData"
                              onBlur={onClientCnpjCpfSubmit}
                              defaultValue={orderData.client.formatted_cnpj_cpf}
                              styled={{ width: '8em' }}
                            />
                          )}
                        </Form>
                        <Form
                          ref={clientNameContactRef}
                          onSubmit={submitClientNameContact}
                        >
                          <InputAsText
                            name="clientNameContactData"
                            onBlur={onClientNameContactSubmit}
                            defaultValue={orderData.client.contact_name}
                          />
                        </Form>
                        <Form ref={clientEmailRef} onSubmit={submitClientEmail}>
                          <InputAsText
                            name="clientEmailData"
                            onBlur={onClientEmailSubmit}
                            defaultValue={orderData.client.email}
                          />
                        </Form>
                        <Form ref={clientPhoneRef} onSubmit={submitClientPhone}>
                          <InputAsTextWithMask
                            name="clientPhoneData"
                            onBlur={onClientPhoneSubmit}
                            defaultValue={orderData.client.formatted_phone}
                            mask="(99) 9999-9999"
                            maskChar={null}
                            styled={{ width: '8em' }}
                          />
                        </Form>
                        <Form
                          ref={clientMobilePhoneRef}
                          onSubmit={submitClientMobilePhone}
                        >
                          <InputAsTextWithMask
                            name="clientMobilePhoneData"
                            onBlur={onClientMobilePhoneSubmit}
                            defaultValue={orderData.client.formatted_mobile}
                            mask="(99) 9 9999-9999"
                            maskChar={null}
                            styled={{ width: '8em' }}
                          />
                        </Form>
                      </>
                    ) : (
                      <>
                        <p>{orderData.client.name}</p>
                        <p>{orderData.client.formatted_cnpj_cpf}</p>
                        <p>{orderData.client.contact_name}</p>
                        <p>{orderData.client.email}</p>
                        <p>{orderData.client.formatted_phone}</p>
                        <p>{orderData.client.formatted_mobile}</p>
                      </>
                    )}
                  </DataForm>
                </ClientContainer>
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
                          <FaCheckCircle className={`faCheck ${faCheck}`} />
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
                              <FaCheckCircle className={faCheck} />
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
                      {orderData.status_delivery === 'Concluído'
                        ? 'Data da entrega:'
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
                      orderData.status_delivery === 'Agendado' && (
                        <div className="status">
                          <FaRegClock className={faRegClock} />
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
                          <FaCheckCircle className={`faCheck ${faCheck}`} />
                          <span>Concluído</span>
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
                            {(!orderData.status_delivery ||
                              user.permissions === 'Admin') && (
                              <MenuItem value="">
                                -- Selecione um status --
                              </MenuItem>
                            )}
                            <MenuItem
                              value="Agendado"
                              disabled={
                                !!orderData.status_delivery &&
                                orderData.status_delivery !== 'Agendado' &&
                                user.permissions !== 'Admin'
                              }
                            >
                              <FaRegClock className={faRegClock} />
                              Agendado com o cliente
                            </MenuItem>
                            <MenuItem
                              value="Execução"
                              disabled={
                                !!orderData.status_delivery &&
                                orderData.status_delivery !== 'Agendado' &&
                                orderData.status_delivery !== 'Execução' &&
                                user.permissions !== 'Admin'
                              }
                            >
                              <HiOutlineRefresh
                                className={`hiRefresh ${hiRefresh}`}
                              />
                              Em execução
                            </MenuItem>
                            <MenuItem
                              value="Concluído"
                              disabled={
                                !!orderData.status_delivery &&
                                orderData.status_delivery !== 'Agendado' &&
                                orderData.status_delivery !== 'Execução' &&
                                orderData.status_delivery !== 'Concluído' &&
                                user.permissions !== 'Admin'
                              }
                            >
                              <FaCheckCircle className={`faCheck ${faCheck}`} />
                              Concluído
                            </MenuItem>
                            <MenuItem
                              value="Cancelado"
                              disabled={
                                !!orderData.status_delivery &&
                                orderData.status_delivery !== 'Agendado' &&
                                orderData.status_delivery !== 'Execução' &&
                                orderData.status_delivery !== 'Concluído' &&
                                orderData.status_delivery !== 'Cancelado' &&
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
                          <span>Aguardando para Faturar</span>
                        </div>
                      )}
                    {from !== 'Billing' &&
                      orderData.status_billing === 'Faturado' && (
                        <div className="status">
                          <FaCheckCircle className={`faCheck ${faCheck}`} />
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
                            {(!orderData.status_billing ||
                              user.permissions === 'Admin') && (
                              <MenuItem value="">
                                -- Selecione um status --
                              </MenuItem>
                            )}
                            <MenuItem
                              value="Aguardando"
                              disabled={
                                !!orderData.status_billing &&
                                orderData.status_billing !== 'Aguardando' &&
                                user.permissions !== 'Admin'
                              }
                            >
                              <FaRegClock className={faRegClock} />
                              Aguardando para Faturar
                            </MenuItem>
                            <MenuItem
                              value="Faturado"
                              disabled={
                                !!orderData.status_billing &&
                                orderData.status_billing !== 'Aguardando' &&
                                orderData.status_billing !== 'Faturado' &&
                                user.permissions !== 'Admin'
                              }
                            >
                              <FaCheckCircle className={`faCheck ${faCheck}`} />
                              Faturado
                            </MenuItem>
                            <MenuItem
                              value="Cancelado"
                              disabled={
                                !!orderData.status_billing &&
                                orderData.status_billing !== 'Aguardando' &&
                                orderData.status_billing !== 'Faturado' &&
                                orderData.status_billing !== 'Cancelado' &&
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
                        <FaCheckCircle className={`faCheck ${faCheck}`} />
                        <span>Pago</span>
                      </div>
                    )}
                    {from !== 'Billing' &&
                      orderData.status_payment === 'Vencido' && (
                        <div className="status">
                          <FaCalendarTimes
                            className={`faCalendarTimes ${faCalendarTimes}`}
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
                                !!orderData.status_payment &&
                                orderData.status_payment !== 'Aguardando' &&
                                user.permissions !== 'Admin'
                              }
                            >
                              <FaRegClock className={faRegClock} />
                              Aguardando Pagamento
                            </MenuItem>
                            <MenuItem
                              value="Pago"
                              disabled={
                                !!orderData.status_payment &&
                                orderData.status_payment !== 'Aguardando' &&
                                orderData.status_payment !== 'Pago' &&
                                orderData.status_payment !== 'Vencido' &&
                                user.permissions !== 'Admin'
                              }
                            >
                              <FaCheckCircle className={`faCheck ${faCheck}`} />
                              Pago
                            </MenuItem>
                            {orderData.status_payment !== 'Pago' && (
                              <MenuItem
                                value="Vencido"
                                disabled={
                                  !!orderData.status_payment &&
                                  orderData.status_payment !== 'Aguardando' &&
                                  orderData.status_payment !== 'Vencido' &&
                                  user.permissions !== 'Admin'
                                }
                              >
                                <FaCalendarTimes
                                  className={`faCalendarTimes ${faCalendarTimes}`}
                                />
                                Vencido
                              </MenuItem>
                            )}
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
