/* eslint-disable react/jsx-indent */
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import {
  ThemeProvider,
  createTheme,
  makeStyles,
  createStyles,
  Theme,
} from '@material-ui/core/styles';
import {
  FaPlus,
  FaRegCheckCircle,
  FaCheckCircle,
  FaRegClock,
  FaTimes,
  FaTrashAlt,
  FaCalendarAlt,
} from 'react-icons/fa';
import { BiCalendarX } from 'react-icons/bi';
import { GoAlert } from 'react-icons/go';
import { RiDraftFill } from 'react-icons/ri';
import { IoMdThumbsDown } from 'react-icons/io';
import { MdOpenInNew } from 'react-icons/md';
import { HiOutlineRefresh } from 'react-icons/hi';
import { Form } from '@unform/web';
import { FormHandles } from '@unform/core';
import {
  formatISO,
  isValid,
  parseISO,
  isBefore,
  endOfDay,
  startOfDay,
} from 'date-fns';
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

import {
  formatValue,
  formatValueCurrency,
  convertDate,
  isCEI,
  convertToCEI,
} from '../../utils';

import { useToast } from '../../hooks/toast';
import { useOverlap } from '../../hooks/overlap';
import { useAuth } from '../../hooks/auth';
import { useOrdersSearch } from '../../hooks/orders_search';
import api from '../../services/api';

import MaterialTooltip from '../MaterialTooltip';
import NewProduct from '../NewProduct';
import SplitPaymentWay from '../SplitPaymentWay';
import ProductView from '../ProductView';
import InputAsText from '../InputAsText';
import InputAsTextWithMask from '../InputAsTextWithMask';
import HeaderButton from '../HeaderButton';

import { UpdateSearchResultsData } from '../SearchResults';
import {
  IPaymentMethod,
  ICompany,
  IOrderProduct,
  IOrder,
} from '../../interfaces';

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
  PaymentTypeProductItem,
  TitleProductName,
  TitleProductDescription,
  TitleProductValue,
  ProductName,
  ProductDescription,
  ProductValue,
  PaymentWay,
  PaymentMethod,
} from './styles';
import SplitPaymentWayView from '../SplitPaymentWayView';

interface InputData {
  deliveryConditionsData?: string;
  technicalObsData?: string;
  requestedDeliveryDateData?: string;
  deliveryDateData?: string;
  paymentWayData?: string;
  dueDateData?: string;
  companyNameData?: string;
  companyCnpjCpfData?: string;
  companyNameContactData?: string;
  companyEmailData?: string;
  companyPhoneData?: string;
  companyMobilePhoneData?: string;
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
  const [orderData, setOrderData] = useState<IOrder>({} as IOrder);

  // Armazena o order_product selecionado para ser alterado ou visualizado
  const [selectedOrderProduct, setSelectedOrderProduct] =
    useState<IOrderProduct>({} as IOrderProduct);

  // Armazena o order_product atualizado para atualizar o pedido e também o searchResults
  const [updateOrderProduct, setUpdateOrderProduct] = useState<IOrderProduct>(
    {} as IOrderProduct
  );

  // Armazena o order_product criado para atualizar o pedido e o searchResults
  const [addNewOrderProduct, setAddNewOrderProduct] = useState<IOrderProduct>(
    {} as IOrderProduct
  );

  // Armazena se houve alguma atualização no pedido
  const [orderUpdated, setOrderUpdated] = useState(false);

  // Armazena se houve alguma atualização para enviar ao SearchResults
  const [updatesToSendToSearchResults, setUpdatesToSendToSearchResults] =
    useState<UpdateSearchResultsData>({} as UpdateSearchResultsData);

  // Armazena se houve alguma atualização no cliente
  const [companyUpdated, setCompanyUpdated] = useState(false);

  // Armazena se existe algum erro em algum campo
  const [counterErrors, setCounterErrors] = useState<string[]>([]);

  // Armazena dos meios de pagamentos cadastrados
  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>([]);

  // Armazena os splitsPaymentWay cadastrados no banco de dados
  const [splitsPaymentWay, setSplitsPaymentWay] = useState(false);

  const deliveryConditionsRef = useRef<FormHandles>(null);
  const technicalObsRef = useRef<FormHandles>(null);
  const requestedDeliveryDateRef = useRef<FormHandles>(null);
  const deliveryDateRef = useRef<FormHandles>(null);
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
    splitPaymentWayOpen,
    splitPaymentWayViewOpen,
    overlapOrderOpen,
    overlapNewProductOpen,
    overlapProductViewOpen,
    overlapNewOrderOpen,
    overlapSplitPaymentWayOpen,
    overlapSplitPaymentWayViewOpen,
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
      mdOpenInNew: {
        color: '#000',
        fontSize: '15px',
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
    mdOpenInNew,
  } = useStyles();

  const orderMaterialTheme = createTheme({
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
            '&[class*="hiRefreshPay"]': {
              margin: '0 2px 0 2px',
              fontSize: '18px',
            },
            '&[class*="faDividePay"]': {
              margin: '0 2px 0 2px',
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
              '&[class*="hiRefreshPay"]': {
                margin: '0 2px 0 2px',
                fontSize: '18px',
              },
              '&[class*="faDividePay"]': {
                margin: '0 2px 0 2px',
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
              '&[class*="hiRefreshPay"]': {
                margin: '0 2px 0 2px',
                fontSize: '18px',
              },
              '&[class*="faDividePay"]': {
                margin: '0 2px 0 2px',
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
                '&[class*="hiRefreshPay"]': {
                  margin: '0 2px 0 2px',
                  fontSize: '18px',
                },
                '&[class*="faDividePay"]': {
                  margin: '0 2px 0 2px',
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
      .get<IOrder>(`/orders/${order_id}`)
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
          due_date,
          payment_method,
          orders_products,
          total_value,
          splits_payment_way,
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
            due_date,
            formatted_due_date: due_date
              ? formatToDate(parseISO(due_date))
              : '',
            total_value,
            formatted_total_value: total_value
              ? formatValueCurrency(Number(total_value.replace(/[,]/gi, '.')))
              : formatValueCurrency(0),
            number_total_value: total_value
              ? Number(total_value.replace(/[,]/gi, '.'))
              : 0,
            payment_method,
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
            orders_products: orders_products?.sort((a, b) => {
              if (a.created_at < b.created_at) return -1;
              if (a.created_at > b.created_at) return 1;
              return 0;
            }),
            splits_payment_way,
          });
        }

        if (splits_payment_way?.length) {
          // Indica que existe splitsPaymentWay cadastrados no banco de dados
          setSplitsPaymentWay(true);
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

  // Lógica comentada para não atualizar a coluna product_payment_type dos orders_products
  // const handleChangePaymentTypeProductItem = useCallback(
  //   (order_product_id) => {
  //     if (orderData.orders_products) {
  //       // Busca o order_product pelo ID
  //       const getOrderProductIndex = orderData.orders_products?.findIndex(
  //         (e) => e.id === order_product_id
  //       );

  //       // Armazena o order_product encontrado
  //       const orderProduct = orderData.orders_products[getOrderProductIndex];

  //       if (orderData.payment_way === 'Parcelado') {
  //         if (orderProduct.product.name === 'Contrato de Assessoria') {
  //           // Se for um Contrato de Assessoria então define o padrão que é Recorrente
  //           orderProduct.product_payment_type = 'Recorrente';
  //         } else {
  //           // Se for outro produto então define o padrão que é Parcelado
  //           orderProduct.product_payment_type = 'Parcelado';
  //         }
  //       }
  //       // Qualquer forma de pagamento que não seja Parcelado limpa o tipo do order_product
  //       else if (orderData.payment_way !== 'Parcelado') {
  //         orderProduct.product_payment_type = '';
  //       }

  //       // Atualiza o banco de dados
  //       // ESSA CHAMADA À API DEVE OCORRER NO BACKEND AO ATUALIZAR A ORDER
  //       // await api.patch(`/orders-products/${order_product_id}`, {
  //       //   product_payment_type: orderProduct.product_payment_type,
  //       // });
  //     }
  //   },
  //   [orderData]
  // );

  // Função para calcular o valor total do pedido
  const updateTotalValueBasedOnOrderProducts = useCallback(async () => {
    // Calcula o valor total dos products
    const productsValues = orderData?.orders_products
      ?.map((product) => Number(product.product_value))
      .reduce((accumulator, productValue) => {
        return accumulator + productValue;
      }, 0);

    // Verifica se existe orders_products para fazer o cálculo
    if (productsValues && productsValues > 0) {
      // Busca a taxa do meio de pagamento selecionado
      // Lógica comentada para não realizar o cálculo de juros
      // const interestRate = orderData.payment_method?.interest_rate;

      // Calcula o valor total adicionando o valor da taxa
      const productsValuesWithInterestRate = productsValues;
      // Lógica comentada para não realizar o cálculo de juros
      // const productsValuesWithInterestRate =
      //   (100 * productsValues) / (100 - Number(interestRate || 0));

      // Armazena o valor recebido no estado
      orderData.formatted_total_value = formatValueCurrency(
        productsValuesWithInterestRate
      );

      const databaseTotalValueFormat = String(
        productsValuesWithInterestRate
      ).replace(/[/.]/gi, ',');

      // Verifica se houve alteração no valor para atualizar o banco de dados
      if (orderData.total_value !== databaseTotalValueFormat) {
        // Armazena o valor recebido no estado
        orderData.total_value = databaseTotalValueFormat;
        orderData.number_total_value = Number(
          databaseTotalValueFormat.replace(/[,]/gi, '.')
        );

        // Define que o banco de dados deve ser atualizado
        setOrderUpdated(true);

        // Envia atualização para o component searchResults
        setUpdatesToSendToSearchResults({
          ...updatesToSendToSearchResults,
          order_id,
          update_database: true,
        });
      }
    }
    // Se não for encontrado nenhum orders_product então o valor total será zero
    else {
      // Armazena o valor recebido no estado
      orderData.formatted_total_value = formatValueCurrency(0);

      // Armazena o valor recebido no estado
      orderData.total_value = '0';
      orderData.number_total_value = 0;

      // Define que o banco de dados deve ser atualizado
      setOrderUpdated(true);
    }

    if (orderData.payment_way === 'Parcelado') {
      // Se houve alteração no valor total, verifica se existe parcelamentos para serem excluídos
      if (orderData.splits_payment_way?.length || splitsPaymentWay) {
        // Exclui os parcelamentos deste pedido no banco de dados, se houver
        await api.delete(`/splits-payment-way/${order_id}`);
      }

      // Limpa o estado
      setOrderData({
        ...orderData,
        due_date: null,
        formatted_due_date: '',
        payment_method: null,
        payment_way: '',
      });

      // Limpa o estado
      setSplitsPaymentWay(false);
    }
  }, [orderData, order_id, splitsPaymentWay, updatesToSendToSearchResults]);

  // Se houver updateOrderProduct significa que algum order_product foi atualizado
  useEffect(() => {
    if (updateOrderProduct.id && orderData.orders_products) {
      // Localiza qual order_product foi atualizado
      const getOrderIndex = orderData.orders_products.findIndex(
        (result) => result.id === updateOrderProduct.id
      );

      if (getOrderIndex >= 0 && orderData.orders_products[getOrderIndex]) {
        // Lógica comentada para não atualizar a coluna product_payment_type dos orders_products
        // Se o payment_way for Parcelado então vai atualizar o product_payment_type
        // if (orderData.payment_way === 'Parcelado') {
        //   handleChangePaymentTypeProductItem(updateOrderProduct.id);
        // }

        if (
          updateOrderProduct.product.name !==
            orderData.orders_products[getOrderIndex].product.name ||
          updateOrderProduct.product_description !==
            orderData.orders_products[getOrderIndex].product_description ||
          updateOrderProduct.product_value !==
            orderData.orders_products[getOrderIndex].product_value
        ) {
          if (
            updateOrderProduct.product_value !==
            orderData.orders_products[getOrderIndex].product_value
          ) {
            // Armazena o valor recebido no estado
            orderData.orders_products[getOrderIndex] = updateOrderProduct;

            // Força a atualização do valor total do pedido
            updateTotalValueBasedOnOrderProducts();
          } else {
            // Armazena o valor recebido no estado
            orderData.orders_products[getOrderIndex] = updateOrderProduct;
          }

          // Envia atualização para o component searchResults
          setUpdatesToSendToSearchResults({
            ...updatesToSendToSearchResults,
            order_id,
            update_database: true,
          });
        }
      }

      // Limpa o estado
      setUpdateOrderProduct({} as IOrderProduct); // Limpa o estado
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateOrderProduct]);

  // Se houver addNewOrderProduct significa que foi criado um novo order_product
  useEffect(() => {
    if (addNewOrderProduct.id && orderData.orders_products) {
      // Armazena o valor recebido no estado
      orderData.orders_products = [
        ...orderData.orders_products,
        addNewOrderProduct,
      ];

      // Lógica comentada para não atualizar a coluna product_payment_type dos orders_products
      // Se o payment_way for Parcelado então vai atualizar o product_payment_type
      // if (orderData.payment_way === 'Parcelado') {
      //   handleChangePaymentTypeProductItem(addNewOrderProduct.id);
      // }

      // Força a atualização do valor total do pedido
      updateTotalValueBasedOnOrderProducts();

      // Envia atualização para o component searchResults
      setUpdatesToSendToSearchResults({
        ...updatesToSendToSearchResults,
        order_id,
        update_database: true,
      });

      // Limpa o estado
      setAddNewOrderProduct({} as IOrderProduct);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addNewOrderProduct]);

  // Função que busca os métodos de pagamento cadastrados no banco de dados
  useEffect(() => {
    api
      .get<IPaymentMethod[]>('/payment-methods')
      .then((response) => {
        setPaymentMethods(response.data);
      })
      .catch(() => {
        addToast({
          type: 'error',
          description:
            '#0260 - Erro ao carregar os meios de pagamentos cadastrados',
        });
      });
  }, [addToast, setPaymentMethods]);

  // Função para atualizar o status do pedido e/ou a data de aprovação
  const updateStatusOrder = useCallback(
    async (e: ChangeEvent<{ value: unknown }>) => {
      if (e.target.value === 'Aprovado') {
        // Verifica se o pedido possui CNPJ/CPF/CEI
        if (!orderData.company?.cnpj_cpf) {
          // Se não possui CNPJ/CPF/CEI define um erro
          addToast({
            type: 'error',
            description: 'Digite um CNPJ ou CPF ou CEI',
          });

          companyCnpjCpfRef.current?.setErrors({
            companyCnpjCpfData: 'CNPJ/CPF/CEI inválido',
          });

          return;
        }

        // Verifica se o pedido possui algum serviço cadastrado
        if (!orderData.orders_products?.length) {
          // Se não possui serviço define um erro
          addToast({
            type: 'error',
            description: 'Insira pelo menos um serviço',
          });

          return;
        }

        // Verifica se o pedido possui forma de pagamento
        if (!orderData.payment_way && orderData.number_total_value > 0) {
          // Se não possui forma de pagamento
          addToast({
            type: 'error',
            description: 'Selecione uma forma de pagamento',
          });

          return;
        }

        // Verifica se o pedido possui meio de pagamento
        if (
          !orderData.payment_method &&
          orderData.payment_way !== 'Parcelado' &&
          orderData.number_total_value > 0
        ) {
          // Se não possui meio de pagamento
          addToast({
            type: 'error',
            description: 'Selecione um meio de pagamento',
          });

          return;
        }

        // Verifica se existe parcelas criadas
        if (orderData.payment_way === 'Parcelado' && !splitsPaymentWay) {
          // Se não possui meio de pagamento
          addToast({
            type: 'error',
            description:
              'Não existe parcelas criadas para a forma de pagamento selecionado',
          });

          return;
        }

        if (orderData.due_date) {
          // Separa os valores de ano, mês e dia da data de vencimento
          const year = new Date(orderData.due_date).getFullYear();
          const month = new Date(orderData.due_date).getMonth();
          const day = new Date(orderData.due_date).getDate();

          // Verifica se a data de vencimento é menor que hoje
          if (isBefore(endOfDay(new Date(year, month, day)), Date.now())) {
            dueDateRef.current?.setErrors({
              dueDateData:
                'Insira uma data de vencimento igual ou maior que hoje',
            });

            addToast({
              type: 'error',
              description:
                'Insira uma data de vencimento igual ou maior que hoje',
            });

            return;
          }
        }

        // Armazena o valor recebido no estado
        orderData.status_order = e.target.value;
        orderData.approved_at = String(new Date(Date.now()));
        orderData.formatted_approved_at = formatToDate(new Date(Date.now()));
        orderData.status_delivery = 'Aguardando';
        orderData.status_billing = 'Aguardando';

        // Envia atualização para o component searchResults
        setUpdatesToSendToSearchResults({
          ...updatesToSendToSearchResults,
          order_id,
          update_database: true,
        });

        // Define que o banco de dados deve ser atualizado
        setOrderUpdated(true);
      }
      // Se o status for Cancelado vai atualizar a API direto
      else if (e.target.value === 'Cancelado') {
        await api
          .patch<IOrder>(`/orders/${order_id}`, {
            status_order: e.target.value,
          })
          .then(() => {
            // Armazena o valor recebido no estado
            orderData.status_order = e.target.value;

            // Verifica os demais status se estiver como Aguardando limpa
            if (orderData.status_delivery === 'Aguardando') {
              orderData.status_delivery = '';
            }

            if (orderData.status_billing === 'Aguardando') {
              orderData.status_billing = '';
            }

            // Envia atualização para o component searchResults
            setUpdatesToSendToSearchResults({
              ...updatesToSendToSearchResults,
              order_id,
              update_database: true,
            });

            // Define que o banco de dados deve ser atualizado
            setOrderUpdated(true);
          })
          .catch(() => {
            addToast({
              type: 'error',
              description: '#0190 - Erro ao atualizar o status do pedido',
            });
          });
      }
      // Se o valor recebido for diferente de 'Aprovado' e diferente de 'Cancelado' atualiza o status
      else {
        // Armazena o valor recebido no estado
        orderData.status_order = e.target.value;

        // Envia atualização para o component searchResults
        setUpdatesToSendToSearchResults({
          ...updatesToSendToSearchResults,
          order_id,
          status_order: e.target.value,
        });

        // Define que o banco de dados deve ser atualizado
        setOrderUpdated(true);
      }
    },
    [
      addToast,
      orderData,
      order_id,
      splitsPaymentWay,
      updatesToSendToSearchResults,
    ]
  );

  // Função para atualizar o status da área técnica e/ou o técnico executante
  const updateStatusDelivery = useCallback(
    async (e: ChangeEvent<{ value: unknown }>) => {
      // Se o status for Cancelado vai atualizar a API direto
      if (e.target.value === 'Cancelado') {
        await api
          .patch<IOrder>(`/orders/${order_id}`, {
            status_delivery: e.target.value,
          })
          .then(() => {
            // Armazena o valor recebido no estado
            orderData.status_delivery = e.target.value;

            // Envia atualização para o component searchResults
            setUpdatesToSendToSearchResults({
              ...updatesToSendToSearchResults,
              order_id,
              update_database: true,
            });

            // Define que o banco de dados deve ser atualizado
            setOrderUpdated(true);
          })
          .catch(() => {
            addToast({
              type: 'error',
              description: '#0190 - Erro ao atualizar o status do pedido',
            });
          });
      }
      // Verifica se possui técnico executante
      else if (!orderData.technical) {
        // Armazena o valor recebido no estado
        orderData.status_delivery = e.target.value;
        // Se não possui técnico executante, define o usuário como técnico executante
        orderData.technical = user;

        // Se o status for 'Entregue' vai atualizar os resultados
        if (e.target.value === 'Entregue') {
          // Envia atualização para o component searchResults
          setUpdatesToSendToSearchResults({
            ...updatesToSendToSearchResults,
            order_id,
            update_database: true,
          });
        }
        // Se o status for diferente de 'Entregue' vai atualizar os resultados
        else {
          // Envia atualização para o component searchResults
          setUpdatesToSendToSearchResults({
            ...updatesToSendToSearchResults,
            order_id,
            status_delivery: e.target.value,
            technical: user,
          });
        }

        // Define que o banco de dados deve ser atualizado
        setOrderUpdated(true);
      }
      // Se houver técnico cadastrado, altera apenas o status
      else {
        // Armazena o valor recebido no estado
        orderData.status_delivery = e.target.value;

        // Se o status for 'Entregue' vai atualizar os resultados
        if (e.target.value === 'Entregue') {
          // Envia atualização para o component searchResults
          setUpdatesToSendToSearchResults({
            ...updatesToSendToSearchResults,
            order_id,
            update_database: true,
          });
        }
        // Se o status for diferente de 'Entregue' vai atualizar os resultados
        else {
          // Envia atualização para o component searchResults
          setUpdatesToSendToSearchResults({
            ...updatesToSendToSearchResults,
            order_id,
            status_delivery: e.target.value,
          });
        }

        // Define que o banco de dados deve ser atualizado
        setOrderUpdated(true);
      }

      // Verifica o status para definir alertas para preencher a data de entrega
      if (
        !orderData?.delivery_date &&
        e.target.value !== 'Aguardando' &&
        e.target.value !== 'Cancelado' &&
        e.target.value !== 'Pendência'
      ) {
        // Se não possui data define um erro conforme status
        if (e.target.value === 'Concluído') {
          addToast({
            type: 'warning',
            description: 'Favor preencher a data de conclusão',
          });

          deliveryDateRef.current?.setErrors({
            deliveryDateData: 'Favor preencher a data de conclusão',
          });

          // Define que possui erros na edição do pedido
          if (!counterErrors.find((err) => err === 'deliveryDate')) {
            setCounterErrors((state) => [...state, 'deliveryDate']);
          }
        } else if (e.target.value === 'Entregue') {
          // Se não possui data define um erro conforme status
          addToast({
            type: 'warning',
            description: 'Favor preencher a data de entrega',
          });

          deliveryDateRef.current?.setErrors({
            deliveryDateData: 'Favor preencher a data de entrega',
          });

          // Define que possui erros na edição do pedido
          if (!counterErrors.find((err) => err === 'deliveryDate')) {
            setCounterErrors((state) => [...state, 'deliveryDate']);
          }
        } else {
          // Se não possui data e possui status define um erro
          addToast({
            type: 'warning',
            description: 'Favor preencher a data de entrega prevista',
          });

          deliveryDateRef.current?.setErrors({
            deliveryDateData: 'Favor preencher a data de entrega prevista',
          });

          // Define que possui erros na edição do pedido
          if (!counterErrors.find((err) => err === 'deliveryDate')) {
            setCounterErrors((state) => [...state, 'deliveryDate']);
          }
        }
      }
    },
    [
      addToast,
      counterErrors,
      orderData,
      order_id,
      updatesToSendToSearchResults,
      user,
    ]
  );

  // Função para atualizar o status do faturamento
  const updateStatusBilling = useCallback(
    async (e: ChangeEvent<{ value: unknown }>) => {
      // Verifica o valor recebido se é diferente de Cancelado
      if (e.target.value !== 'Cancelado') {
        // Armazena o valor recebido no estado
        orderData.status_billing = e.target.value;

        // Envia atualização para o component searchResults
        setUpdatesToSendToSearchResults({
          ...updatesToSendToSearchResults,
          order_id,
          update_database: true,
        });

        // Define que o banco de dados deve ser atualizado
        setOrderUpdated(true);
      }
      // Se o status for Cancelado vai atualizar a API direto
      else if (e.target.value === 'Cancelado') {
        await api
          .patch<IOrder>(`/orders/${order_id}`, {
            status_billing: e.target.value,
          })
          .then(() => {
            // Armazena o valor recebido no estado
            orderData.status_billing = e.target.value;

            // Envia atualização para o component searchResults
            setUpdatesToSendToSearchResults({
              ...updatesToSendToSearchResults,
              order_id,
              update_database: true,
            });

            // Define que o banco de dados deve ser atualizado
            setOrderUpdated(true);
          })
          .catch(() => {
            addToast({
              type: 'error',
              description: '#0190 - Erro ao atualizar o status do pedido',
            });
          });
      }
    },
    [addToast, orderData, order_id, updatesToSendToSearchResults]
  );

  // Função para atualizar o status do financeiro
  const updateStatusPayment = useCallback(
    async (e: ChangeEvent<{ value: unknown }>) => {
      if (e.target.value !== 'Cancelado') {
        // Armazena o valor recebido no estado
        orderData.status_payment = e.target.value;

        // Envia atualização para o component searchResults
        setUpdatesToSendToSearchResults({
          ...updatesToSendToSearchResults,
          order_id,
          status_payment: e.target.value,
        });

        // Define que o banco de dados deve ser atualizado
        setOrderUpdated(true);
      }
      // Se o status for Cancelado vai atualizar a API direto
      else if (e.target.value === 'Cancelado') {
        await api
          .patch<IOrder>(`/orders/${order_id}`, {
            status_payment: e.target.value,
          })
          .then(() => {
            // Armazena o valor recebido no estado
            orderData.status_payment = e.target.value;

            // Envia atualização para o component searchResults
            setUpdatesToSendToSearchResults({
              ...updatesToSendToSearchResults,
              order_id,
              status_payment: e.target.value,
            });

            // Define que o banco de dados deve ser atualizado
            setOrderUpdated(true);
          })
          .catch(() => {
            addToast({
              type: 'error',
              description: '#0190 - Erro ao atualizar o status do pedido',
            });
          });
      }
    },
    [addToast, orderData, order_id, updatesToSendToSearchResults]
  );

  // Função para atualizar as condições de pagamento
  const submitDeliveryConditions = useCallback(
    ({ deliveryConditionsData }: InputData) => {
      if (deliveryConditionsData) {
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
      } else {
        // Armazena o valor recebido no estado
        orderData.delivery_conditions = '';

        // Define que o banco de dados deve ser atualizado
        setOrderUpdated(true);
      }
    },
    [orderData]
  );

  // Função para executar a função submitDeliveryConditions
  function onDeliveryConditionsSubmit(): void {
    deliveryConditionsRef.current?.submitForm();
  }

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

          // Verifica se a data recebida é válida
          if (isValid(newRequestedDeliveryDateData)) {
            // Armazena o valor recebido no estado
            orderData.requested_delivery_date = formatISO(
              newRequestedDeliveryDateData
            );
            orderData.formatted_requested_delivery_date =
              requestedDeliveryDateData;

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
            if (!counterErrors.find((err) => err === 'requestedDeliveryDate')) {
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
  function onRequestedDeliveryDateSubmit(): void {
    requestedDeliveryDateRef.current?.submitForm();
  }

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

          // Verifica se a data recebida é válida
          if (isValid(newDeliveryDateData)) {
            // Armazena o valor recebido no estado
            orderData.delivery_date = formatISO(newDeliveryDateData);
            orderData.formatted_delivery_date = deliveryDateData;

            // Envia atualização para o component searchResults
            setUpdatesToSendToSearchResults({
              ...updatesToSendToSearchResults,
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
            if (!counterErrors.find((err) => err === 'deliveryDate')) {
              setCounterErrors((state) => [...state, 'deliveryDate']);
            }
          }
        }
        // Se não possui valor verifica o status
        else if (
          !!orderData?.status_delivery &&
          orderData?.status_delivery !== 'Aguardando' &&
          orderData?.status_delivery !== 'Cancelado' &&
          orderData?.status_delivery !== 'Pendência'
        ) {
          // Se é uma data inválida define um erro
          deliveryDateRef.current?.setErrors({
            deliveryDateData: 'Data inválida',
          });

          addToast({
            type: 'error',
            description: 'Data inválida',
          });

          // Define que possui erros na edição do pedido
          if (!counterErrors.find((err) => err === 'deliveryDate')) {
            setCounterErrors((state) => [...state, 'deliveryDate']);
          }
        }
        // De acordo com o status é liberado para remover a data
        else {
          // Limpa o estado
          orderData.delivery_date = null;
          orderData.formatted_delivery_date = '';

          // Envia atualização para o component searchResults
          setUpdatesToSendToSearchResults({
            ...updatesToSendToSearchResults,
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
        setCounterErrors((state) =>
          state.filter((err) => err !== 'deliveryDate')
        );
      }
    },
    [addToast, counterErrors, orderData, order_id, updatesToSendToSearchResults]
  );

  // Função para executar a função submitDeliveryDate
  function onDeliveryDateSubmit(): void {
    deliveryDateRef.current?.submitForm();
  }

  // Função para atualizar as observações da área técnica
  const submitTechnicalObs = useCallback(
    ({ technicalObsData }: InputData) => {
      if (technicalObsData) {
        // Remove espaços em branco no final, no início da string e duplo espaço
        const clearTechnicalObsData = technicalObsData
          .trimEnd()
          .trimStart()
          .split(/\s+/)
          .join(' ');

        // Verifica se o valor recebido é diferente do existente
        if (orderData.technical_obs !== clearTechnicalObsData) {
          // Armazena o valor recebido no estado
          orderData.technical_obs = clearTechnicalObsData;

          // Define que o banco de dados deve ser atualizado
          setOrderUpdated(true);
        }
      } else {
        // Armazena o valor recebido no estado
        orderData.technical_obs = '';

        // Define que o banco de dados deve ser atualizado
        setOrderUpdated(true);
      }
    },
    [orderData]
  );

  // Função para executar a função submitTechnicalObs
  function onTechnicalObsSubmit(): void {
    technicalObsRef.current?.submitForm();
  }

  // Função para atualizar o vencimento
  const submitDueDate = useCallback(
    ({ dueDateData }: InputData) => {
      // Verifica se o valor recebido é diferente do existente
      if (orderData.formatted_due_date !== dueDateData) {
        // Verifica se possui valor recebido
        if (dueDateData) {
          // Converte o valor recebido para formato americano
          const convertedDueDateData = convertDate(dueDateData);

          // Separa os valores de ano, mês e dia do valor convertido
          const year = new Date(convertedDueDateData).getFullYear();
          const month = new Date(convertedDueDateData).getMonth();
          const day = new Date(convertedDueDateData).getDate() + 1;

          // Converte a data para o formato de data do Javascript
          const newDueDateData = new Date(year, month, day);

          // Verifica se a data recebida é menor que hoje
          if (isBefore(endOfDay(newDueDateData), Date.now())) {
            dueDateRef.current?.setErrors({
              dueDateData:
                'Não é possível definir uma data de vencimento passada',
            });

            addToast({
              type: 'error',
              description:
                'Não é possível definir uma data de vencimento passada',
            });
          }

          // Verifica se a data recebida é válida
          if (isValid(newDueDateData)) {
            // Armazena o valor recebido no estado
            orderData.due_date = formatISO(newDueDateData);
            orderData.formatted_due_date = dueDateData;

            // Envia atualização para o component searchResults
            setUpdatesToSendToSearchResults({
              ...updatesToSendToSearchResults,
              order_id,
              due_date: dueDateData,
            });

            // Define que o banco de dados deve ser atualizado
            setOrderUpdated(true);

            // Limpa os erros
            dueDateRef.current?.setErrors({});
            setCounterErrors((state) =>
              state.filter((err) => err !== 'dueDate')
            );
          } else {
            // Se é uma data inválida define um erro
            dueDateRef.current?.setErrors({
              dueDateData: 'Data inválida',
            });

            addToast({
              type: 'error',
              description: 'Data inválida',
            });

            // Define que possui erros na edição do pedido

            if (!counterErrors.find((err) => err === 'dueDate')) {
              setCounterErrors((state) => [...state, 'dueDate']);
            }
          }
        }
        // Verifica se não possui forma de pagamento para remover a data
        else if (!orderData?.payment_way) {
          // Limpa o estado
          orderData.due_date = null;
          orderData.formatted_due_date = '';

          // Envia atualização para o component searchResults
          setUpdatesToSendToSearchResults({
            ...updatesToSendToSearchResults,
            order_id,
            due_date: '',
          });

          // Define que o banco de dados deve ser atualizado
          setOrderUpdated(true);

          // Limpa os erros
          dueDateRef.current?.setErrors({});
          setCounterErrors((state) => state.filter((err) => err !== 'dueDate'));
        } else {
          // Se possui uma forma de pagamento define um erro
          dueDateRef.current?.setErrors({
            dueDateData: 'Data inválida para pagamento à vista',
          });

          addToast({
            type: 'error',
            description: 'Data inválida para pagamento à vista',
          });
        }
      }
      // Verifica se o valor recebido é igual ao cadastrado e limpa possíveis erros
      else if (orderData.formatted_due_date === dueDateData) {
        // Limpa os erros
        dueDateRef.current?.setErrors({});
        setCounterErrors((state) => state.filter((err) => err !== 'dueDate'));
      }
    },
    [addToast, counterErrors, orderData, order_id, updatesToSendToSearchResults]
  );

  // Função para executar a função submitDueDate
  function onDueDateSubmit(): void {
    dueDateRef.current?.submitForm();
  }

  // Função para atualizar a forma de pagamento
  const updatePaymentWay = useCallback(
    async (e: ChangeEvent<{ value: unknown }>) => {
      const payment_way = e.target.value as string;
      // Verifica se está no módulo Comercial e se tem permissão para alterar
      if (
        (from === 'Comercial' &&
          !orderData.status_billing &&
          !orderData.status_payment) ||
        (from === 'Comercial' && user.permissions === 'Admin')
      ) {
        if (payment_way === 'À vista') {
          // Envia a data de hoje como sugestão inicial
          submitDueDate({
            dueDateData: formatToDate(new Date(startOfDay(Date.now()))),
          });
        } else if (payment_way === 'Faturado') {
          // Define a data do próximo vencimento conforme cadastro do cliente
          // Armazena o valor recebido no estado
          orderData.due_date = formatISO(new Date(2300, 1, 1));
          orderData.formatted_due_date = '01/01/1500';
        } else if (payment_way === 'Parcelado') {
          // Abre o modal para cadastrar o parcelamento
          overlapSplitPaymentWayOpen(!splitPaymentWayOpen);

          // Limpa o estado
          orderData.due_date = null;
          orderData.formatted_due_date = '';
          orderData.payment_method = null;
        } else if (!payment_way) {
          // Limpa o estado
          orderData.due_date = null;
          orderData.formatted_due_date = '';
          orderData.payment_method = null;
        }

        if ((payment_way !== 'Parcelado' || !payment_way) && splitsPaymentWay) {
          // Exclui os parcelamentos deste pedido no banco de dados, se houver
          await api.delete(`/splits-payment-way/${order_id}`);

          // Limpa o estado
          setSplitsPaymentWay(false);
        }

        // Armazena o valor recebido no estado
        setOrderData({
          ...orderData,
          payment_way,
        });

        // Define que o banco de dados deve ser atualizado
        setOrderUpdated(true);
      }

      // Lógica comentada para não atualizar a coluna product_payment_type dos orders_products
      // Define o tipo dos orders_products
      // orderData.orders_products?.forEach((order_product) => {
      //   handleChangePaymentTypeProductItem(order_product.id);
      // });
    },
    [
      from,
      orderData,
      order_id,
      overlapSplitPaymentWayOpen,
      splitPaymentWayOpen,
      splitsPaymentWay,
      submitDueDate,
      user.permissions,
    ]
  );

  // Função para atualizar o meio de pagamento
  const handleSelectPaymentMethod = useCallback(
    (e: ChangeEvent<{ value: unknown }>) => {
      // Verifica se está no módulo Comercial e se tem permissão para alterar
      if (
        (from === 'Comercial' &&
          !orderData.status_billing &&
          !orderData.status_payment) ||
        (from === 'Comercial' && user.permissions === 'Admin')
      ) {
        // Busca no array o meio de pagamento selecionado
        const payMethod = paymentMethods.find(
          (item) => item.id === e.target.value
        );

        // Armazena o valor recebido no estado
        orderData.payment_method = payMethod;

        // Envia atualização para o component searchResults
        setUpdatesToSendToSearchResults({
          ...updatesToSendToSearchResults,
          order_id,
        });

        // Força a atualização do valor total do pedido
        updateTotalValueBasedOnOrderProducts();

        // Limpa os erros
        companyNameRef.current?.setErrors({});
        setCounterErrors((state) =>
          state.filter((err) => err !== 'paymentMethod')
        );

        // Define que o banco de dados deve ser atualizado
        setOrderUpdated(true);
      }
    },
    [
      from,
      orderData,
      order_id,
      paymentMethods,
      updateTotalValueBasedOnOrderProducts,
      updatesToSendToSearchResults,
      user.permissions,
    ]
  );

  // Função para atualizar o nome da empresa
  const submitCompanyName = useCallback(
    ({ companyNameData }: InputData) => {
      if (companyNameData) {
        // Remove espaços em branco no final, no início da string e duplo espaço
        const clearCompanyNameData = companyNameData
          .trimEnd()
          .trimStart()
          .split(/\s+/)
          .join(' ');

        // Verifica se o valor recebido é diferente do existente
        if (orderData?.company.name !== clearCompanyNameData) {
          // Armazena o valor recebido no estado
          orderData.company.name = clearCompanyNameData;

          // Envia atualização para o component searchResults
          setUpdatesToSendToSearchResults({
            ...updatesToSendToSearchResults,
            order_id,
            company_name: clearCompanyNameData,
            company_id: orderData.company.id,
          });

          // Define que o banco de dados deve ser atualizado
          setCompanyUpdated(true);

          // Limpa os erros
          companyNameRef.current?.setErrors({});
          setCounterErrors((state) =>
            state.filter((err) => err !== 'companyName')
          );
        }
        // Verifica se o valor recebido é igual ao cadastrado e limpa possíveis erros
        else if (orderData?.company.name === clearCompanyNameData) {
          // Limpa os erros
          companyNameRef.current?.setErrors({});
          setCounterErrors((state) =>
            state.filter((err) => err !== 'companyName')
          );
        }
      }
      // Se não houver valor recebido será definido um erro
      else {
        companyNameRef.current?.setErrors({
          companyNameData: 'Favor digitar um nome válido',
        });

        // Define que possui um erro na edição do cliente
        if (!counterErrors.find((err) => err === 'companyName')) {
          setCounterErrors((state) => [...state, 'companyName']);
        }

        addToast({
          type: 'error',
          description: 'Favor digitar um nome válido',
        });
      }
    },
    [
      addToast,
      counterErrors,
      orderData.company,
      order_id,
      updatesToSendToSearchResults,
    ]
  );

  // Função para executar a função submitCompanyName
  function onCompanyNameSubmit(): void {
    companyNameRef.current?.submitForm();
  }

  // Função para atualizar o CNPJ/CPF/CEI da empresa
  const submitCompanyCnpjCpf = useCallback(
    ({ companyCnpjCpfData }: InputData) => {
      if (companyCnpjCpfData) {
        // Remove os caracteres especiais do valor recebido
        const clearCompanyCnpjCpfData = companyCnpjCpfData
          .replace(/[^\w\s]/gi, '')
          .trimEnd()
          .trimStart();

        // Verifica se o valor recebido é diferente do existente
        if (orderData?.company.cnpj_cpf !== clearCompanyCnpjCpfData) {
          // Verifica se o valor recebido é válido
          if (
            !isCNPJ(clearCompanyCnpjCpfData) &&
            !isCPF(clearCompanyCnpjCpfData) &&
            !isCEI(clearCompanyCnpjCpfData)
          ) {
            // Define um erro
            companyCnpjCpfRef.current?.setErrors({
              companyCnpjCpfData: 'Favor digitar um CNPJ ou CPF ou CEI válido',
            });

            // Define que possui um erro na edição do cliente
            if (!counterErrors.find((err) => err === 'companyCnpjCpf')) {
              setCounterErrors((state) => [...state, 'companyCnpjCpf']);
            }

            addToast({
              type: 'error',
              description: 'Favor digitar um CNPJ ou CPF ou CEI válido',
            });
          }
          // Se houver CNPJ ou CPF ou CEI válido os valores serão atualizados
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
        else if (orderData?.company.cnpj_cpf) {
          // Limpa os erros
          companyCnpjCpfRef.current?.setErrors({});
          setCounterErrors((state) =>
            state.filter((e) => e !== 'companyCnpjCpf')
          );
        }
      }
      // Verifica se o usuário está limpando o campo
      else {
        // Define um erro
        companyCnpjCpfRef.current?.setErrors({
          companyCnpjCpfData: 'Favor digitar um CNPJ ou CPF ou CEI válido',
        });

        // Define que possui um erro na edição do cliente
        if (!counterErrors.find((err) => err === 'companyCnpjCpf')) {
          setCounterErrors((state) => [...state, 'companyCnpjCpf']);
        }

        addToast({
          type: 'error',
          description: 'Favor digitar um CNPJ ou CPF ou CEI válido',
        });
      }
    },
    [addToast, counterErrors, orderData]
  );

  // Função para executar a função submitCompanyCnpjCpf
  function onCompanyCnpjCpfSubmit(): void {
    companyCnpjCpfRef.current?.submitForm();
  }

  // Função para atualizar o nome do responsável pela empresa
  const submitCompanyNameContact = useCallback(
    ({ companyNameContactData }: InputData) => {
      if (companyNameContactData) {
        // Remove espaços em branco no final, no início da string e duplo espaço
        const clearCompanyNameContactData = companyNameContactData
          .trimEnd()
          .trimStart()
          .split(/\s+/)
          .join(' ');

        // Verifica se o valor recebido é diferente do existente
        if (orderData?.company.contact_name !== clearCompanyNameContactData) {
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
      }
      // Se não houver valor recebido será definido um erro
      else {
        companyNameContactRef.current?.setErrors({
          companyNameContactData: 'Favor digitar um nome válido',
        });

        // Define que possui um erro na edição do cliente
        if (!counterErrors.find((err) => err === 'companyNameContact')) {
          setCounterErrors((state) => [...state, 'companyNameContact']);
        }

        addToast({
          type: 'error',
          description: 'Favor digitar um nome válido',
        });
      }
    },
    [addToast, counterErrors, orderData]
  );

  // Função para executar a função submitCompanyNameContact
  function onCompanyNameContactSubmit(): void {
    companyNameContactRef.current?.submitForm();
  }

  // Função para atualizar o e-mail da empresa
  const submitCompanyEmail = useCallback(
    ({ companyEmailData }: InputData) => {
      if (companyEmailData) {
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
          if (!isEmail(clearCompanyEmailData)) {
            // Define um erro
            companyEmailRef.current?.setErrors({
              companyEmailData: 'Favor digitar um e-mail válido',
            });

            // Define que possui um erro na edição do cliente
            if (!counterErrors.find((err) => err === 'companyEmail')) {
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
          setCounterErrors((state) =>
            state.filter((e) => e !== 'companyEmail')
          );
        }
      }
      // Se não houver valor recebido será definido um erro
      else {
        companyEmailRef.current?.setErrors({
          companyEmailData: 'Favor digitar um e-mail válido',
        });

        // Define que possui um erro na edição do cliente
        if (!counterErrors.find((err) => err === 'companyEmail')) {
          setCounterErrors((state) => [...state, 'companyEmail']);
        }

        addToast({
          type: 'error',
          description: 'Favor digitar um e-mail válido',
        });
      }
    },
    [addToast, counterErrors, orderData]
  );
  // Função para executar a função submitCompanyEmail
  function onCompanyEmailSubmit(): void {
    companyEmailRef.current?.submitForm();
  }

  // Função para atualizar o telefone da empresa
  const submitCompanyPhone = useCallback(
    ({ companyPhoneData }: InputData) => {
      if (companyPhoneData) {
        // Remove os caracteres especiais do valor recebido
        const clearCompanyPhoneData = companyPhoneData
          .replace(/[^\w]/gi, '')
          .trimEnd()
          .trimStart();

        // Verifica se o valor recebido é diferente do existente
        if (orderData?.company.phone !== clearCompanyPhoneData) {
          // Verifica se o valor recebido é um telefone válido
          if (!isPhone(clearCompanyPhoneData)) {
            // Define um erro
            companyPhoneRef.current?.setErrors({
              companyPhoneData: 'Favor digitar um telefone válido',
            });

            // Define que possui um erro na edição do cliente
            if (!counterErrors.find((err) => err === 'companyPhone')) {
              setCounterErrors((state) => [...state, 'companyPhone']);
            }

            addToast({
              type: 'error',
              description: 'Favor digitar um telefone válido',
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
        }
        // Limpa possíveis erros
        else {
          // Limpa os erros
          companyPhoneRef.current?.setErrors({});
          setCounterErrors((state) =>
            state.filter((e) => e !== 'companyPhone')
          );
        }
      }
      // Verifica se o celular já não está vazio
      else if (!orderData?.company.mobile) {
        // Define um erro
        companyPhoneRef.current?.setErrors({
          companyPhoneData: 'Favor digitar um telefone válido, ou um celular',
        });

        // Define que possui um erro na edição do cliente
        if (!counterErrors.find((err) => err === 'companyPhone')) {
          setCounterErrors((state) => [...state, 'companyPhone']);
        }

        addToast({
          type: 'error',
          description: 'Favor digitar um telefone válido, ou um celular',
        });
      }
      // Se não houver valor recebido e houver telefone celular limpa o campo
      else {
        // Armazena o valor recebido no estado
        orderData.company.phone = '';
        orderData.company.formatted_phone = '';

        // Define que o banco de dados deve ser atualizado
        setCompanyUpdated(true);

        // Limpa os erros
        companyPhoneRef.current?.setErrors({});
        setCounterErrors((state) =>
          state.filter((err) => err !== 'companyPhone')
        );
      }
    },
    [addToast, counterErrors, orderData]
  );

  // Função para executar a função submitCompanyPhone
  function onCompanyPhoneSubmit(): void {
    companyPhoneRef.current?.submitForm();
  }

  // Função para atualizar o celular da empresa
  const submitCompanyMobilePhone = useCallback(
    ({ companyMobilePhoneData }: InputData) => {
      if (companyMobilePhoneData) {
        // Remove os caracteres especiais do valor recebido
        const clearCompanyMobilePhoneData = companyMobilePhoneData
          .replace(/[^\w]/gi, '')
          .trimEnd()
          .trimStart();

        // Verifica se o valor recebido é diferente do existente
        if (orderData?.company.mobile !== clearCompanyMobilePhoneData) {
          // Verifica se o valor recebido é um telefone válido
          if (!isPhone(clearCompanyMobilePhoneData)) {
            // Define um erro
            companyMobilePhoneRef.current?.setErrors({
              companyMobilePhoneData: 'Favor digitar um celular válido',
            });

            // Define que possui um erro na edição do cliente
            if (!counterErrors.find((err) => err === 'companyMobilePhone')) {
              setCounterErrors((state) => [...state, 'companyMobilePhone']);
            }

            addToast({
              type: 'error',
              description: 'Favor digitar um celular válido',
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
        }
        // Limpa possíveis erros
        else {
          // Limpa os erros
          companyMobilePhoneRef.current?.setErrors({});
          setCounterErrors((state) =>
            state.filter((e) => e !== 'companyMobilePhone')
          );
        }
      }
      // Verifica se o telefone fixo já não está vazio
      else if (!orderData?.company.phone) {
        // Define um erro
        companyMobilePhoneRef.current?.setErrors({
          companyMobilePhoneData:
            'Favor digitar um celular válido, ou um telefone fixo',
        });

        // Define que possui um erro na edição do cliente
        if (!counterErrors.find((err) => err === 'companyMobilePhone')) {
          setCounterErrors((state) => [...state, 'companyMobilePhone']);
        }

        addToast({
          type: 'error',
          description: 'Favor digitar um celular válido, ou um telefone fixo',
        });
      }
      // Se não houver valor recebido e houver telefone fixo limpa o campo
      else {
        // Armazena o valor recebido no estado
        orderData.company.mobile = '';
        orderData.company.formatted_mobile = '';

        // Define que o banco de dados deve ser atualizado
        setCompanyUpdated(true);

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
  function onCompanyMobilePhoneSubmit(): void {
    companyMobilePhoneRef.current?.submitForm();
  }

  // Função para deletar um order_product
  const handleDeleteOrderProductItem = useCallback(
    async (order_product_id: string) => {
      await api
        .delete(`/orders-products/${order_product_id}`)
        .then(() => {
          // Atualiza o estado removendo o item deletado
          orderData.orders_products = orderData.orders_products?.filter(
            (orders_product) => orders_product.id !== order_product_id
          );

          // Envia atualização para o component searchResults
          setUpdatesToSendToSearchResults({
            ...updatesToSendToSearchResults,
            order_id,
            update_database: true,
          });

          // Força a atualização do valor total do pedido
          updateTotalValueBasedOnOrderProducts();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addToast, orderData, order_id, updatesToSendToSearchResults]
  );

  // Função para definir estado com o order_product selecionado
  const handleSelectProduct = useCallback(
    (order_product: IOrderProduct) => {
      setSelectedOrderProduct(order_product);

      // Verifica se pode editar o order_product ou apenas visualizar
      if (
        (from === 'Comercial' &&
          !orderData.status_delivery &&
          !orderData.status_billing &&
          !orderData.status_payment) ||
        (from === 'Comercial' &&
          user.permissions === 'Admin' &&
          orderData.payment_way !== 'Parcelado')
      ) {
        overlapNewProductOpen(!newProductOpen);
      } else {
        overlapProductViewOpen(!productViewOpen);
      }
    },
    [
      from,
      newProductOpen,
      orderData,
      overlapNewProductOpen,
      overlapProductViewOpen,
      productViewOpen,
      user.permissions,
    ]
  );

  // Função para abrir o parcelamento
  function handleOpenSplitPaymentWay(): void {
    // Verifica se pode editar o split_payment_way ou apenas visualizar
    if (orderData.status_order === 'Aprovado') {
      overlapSplitPaymentWayViewOpen(!splitPaymentWayViewOpen);
    } else {
      overlapSplitPaymentWayOpen(!splitPaymentWayOpen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }

  // Lógica comentada para não atualizar a coluna product_payment_type dos orders_products
  // Função para trocar o tipo do pagamento do order_product
  // const formatPaymentTypeProductItem = useCallback(
  //   (val: string | undefined): IconBaseProps | undefined => {
  //     if (val === 'Parcelado') {
  //       return <FaDivide className="faDividePay" />;
  //     }
  //     if (val === 'Recorrente') {
  //       return <HiRefresh className="hiRefreshPay" />;
  //     }
  //     return undefined;
  //   },
  //   []
  // );

  // Função que atualiza o pedido no banco de dados
  const handleSubmitOrderToUpdate = useCallback(async () => {
    await api
      .patch<IOrder>(`/orders/${order_id}`, {
        status_order: orderData?.status_order,
        approved_at: orderData?.approved_at,
        status_delivery: orderData?.status_delivery,
        technical_id: orderData.technical?.id || null,
        status_billing: orderData?.status_billing,
        status_payment: orderData?.status_payment,
        delivery_conditions: orderData?.delivery_conditions,
        technical_obs: orderData?.technical_obs,
        requested_delivery_date: orderData?.requested_delivery_date,
        delivery_date: orderData?.delivery_date,
        payment_way:
          orderData.payment_way === 'Parcelado' && !splitsPaymentWay
            ? ''
            : orderData?.payment_way,
        due_date: orderData?.due_date,
        payment_method_id: orderData.payment_method?.id || null,
        total_value: orderData.total_value,
      })
      .then(() => {
        addToast({
          type: 'success',
          description: 'Pedido atualizado com sucesso!',
        });

        setOrderUpdated(false); // Limpa do estado
        overlapOrderOpen(false); // Fecha o component
      })
      .catch(() => {
        addToast({
          type: 'error',
          description: '#0210 - Erro ao atualizar o pedido',
        });
      });
  }, [addToast, orderData, order_id, overlapOrderOpen, splitsPaymentWay]);

  // Função que atualiza cadastro do cliente através do pedido no banco de dados
  const handleSubmitCompanyToUpdate = useCallback(async () => {
    await api
      .patch<ICompany>(`/companies/${orderData.company.id}`, {
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
        overlapOrderOpen(false); // Fecha o component
      })
      .catch(() => {
        addToast({
          type: 'error',
          description: '#0220 - Erro ao atualizar o cadastro do cliente',
        });
      });
  }, [addToast, orderData.company, overlapOrderOpen]);

  // Função que faz validações ao fechar a order
  const handleCloseOrder = useCallback(() => {
    if (newOrderOpen) {
      overlapNewOrderOpen(false);
    }

    // Verifica se não existe erros nos campos
    if (counterErrors.length === 0) {
      checkToken();
      // Se houve alteração no pedido vai atualizar
      if (orderUpdated && !companyUpdated) {
        handleSubmitOrderToUpdate(); // Atualiza o pedido
      }

      // Se houve alteração no cliente vai atualizar
      if (!orderUpdated && companyUpdated) {
        handleSubmitCompanyToUpdate(); // Atualiza o cliente
      }

      if (updatesToSendToSearchResults.order_id) {
        // Envia atualização para o component searchResults
        toUpdateSearchResults(updatesToSendToSearchResults);
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

      // Limpa o estado updatesToSendToSearchResults
      setUpdatesToSendToSearchResults({} as UpdateSearchResultsData);
    }
    // Se houver erros avisa o usuário para corrigir
    else {
      addToast({
        type: 'error',
        description: 'Verifique as informações digitadas e tente novamente',
      });
    }
  }, [
    newOrderOpen,
    counterErrors.length,
    overlapNewOrderOpen,
    checkToken,
    orderUpdated,
    companyUpdated,
    updatesToSendToSearchResults,
    handleSubmitOrderToUpdate,
    handleSubmitCompanyToUpdate,
    toUpdateSearchResults,
    overlapOrderOpen,
    orderOpen,
    addToast,
  ]);

  // Impede o usuário de fechar/atualizar o navegador sem salvar as informações
  window.onbeforeunload = () => {
    return companyUpdated || orderUpdated
      ? 'Se você sair desta página você irá perder suas alterações.'
      : null;
  };

  return (
    <OrderOverlap>
      {splitPaymentWayOpen && (
        <ModalOverlap>
          <SplitPaymentWay
            color={color}
            order_id={order_id}
            order_total_value={orderData.number_total_value}
            hasSplitsPaymentWay={splitsPaymentWay}
            updateSplitsPaymentWay={(e) => setSplitsPaymentWay(e)}
          />
        </ModalOverlap>
      )}
      {splitPaymentWayViewOpen && (
        <ModalOverlap>
          <SplitPaymentWayView
            color={color}
            order_id={order_id}
            order_total_value={orderData.number_total_value}
          />
        </ModalOverlap>
      )}
      {newProductOpen && (
        <ModalOverlap>
          <NewProduct
            color={color}
            orderProduct={selectedOrderProduct}
            order_id={order_id}
            setSelectedOrderProduct={() => {
              setSelectedOrderProduct({} as IOrderProduct);
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
            show={
              orderOpen &&
              !splitPaymentWayOpen &&
              !newProductOpen &&
              !productViewOpen &&
              !splitPaymentWayViewOpen
            }
            handleClick={() => handleCloseOrder()}
            type="button"
            icon={FaTimes}
            color={color}
            className="headerButton"
          />
          <Container>
            <ThemeProvider theme={orderMaterialTheme}>
              <PrimaryContent
                isBlurred={
                  splitPaymentWayOpen ||
                  newProductOpen ||
                  productViewOpen ||
                  splitPaymentWayViewOpen
                }
              >
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
                            onBlur={() => onCompanyNameSubmit()}
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
                              onBlur={() => onCompanyCnpjCpfSubmit()}
                              defaultValue={
                                orderData.company.formatted_cnpj_cpf
                              }
                              styled={{ width: '10em' }}
                              maxLength={18}
                            />
                          ) : (
                            <InputAsText
                              name="companyCnpjCpfData"
                              onBlur={() => onCompanyCnpjCpfSubmit()}
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
                            onBlur={() => onCompanyNameContactSubmit()}
                            defaultValue={orderData.company.contact_name}
                          />
                        </Form>
                        <Form
                          ref={companyEmailRef}
                          onSubmit={submitCompanyEmail}
                        >
                          <InputAsText
                            name="companyEmailData"
                            onBlur={() => onCompanyEmailSubmit()}
                            defaultValue={orderData.company.email}
                          />
                        </Form>
                        <Form
                          ref={companyPhoneRef}
                          onSubmit={submitCompanyPhone}
                        >
                          <InputAsTextWithMask
                            name="companyPhoneData"
                            onBlur={() => onCompanyPhoneSubmit()}
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
                            onBlur={() => onCompanyMobilePhoneSubmit()}
                            defaultValue={orderData.company.formatted_mobile}
                            mask="(99) 9 9999-9999"
                            maskChar={null}
                            styled={{ width: '8em' }}
                          />
                        </Form>
                      </>
                    ) : (
                      <>
                        <p>
                          {orderData.company.name ? (
                            orderData.company.name
                          ) : (
                            <br />
                          )}
                        </p>
                        <p>
                          {orderData.company.formatted_cnpj_cpf ? (
                            orderData.company.formatted_cnpj_cpf
                          ) : (
                            <br />
                          )}
                        </p>
                        <p>
                          {orderData.company.contact_name ? (
                            orderData.company.contact_name
                          ) : (
                            <br />
                          )}
                        </p>
                        <p>
                          {orderData.company.email ? (
                            orderData.company.email
                          ) : (
                            <br />
                          )}
                        </p>
                        <p>
                          {orderData.company.formatted_phone ? (
                            orderData.company.formatted_phone
                          ) : (
                            <br />
                          )}
                        </p>
                        <p>
                          {orderData.company.formatted_mobile ? (
                            orderData.company.formatted_mobile
                          ) : (
                            <br />
                          )}
                        </p>
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
                    <p>
                      {orderData.order_number ? orderData.order_number : <br />}
                    </p>
                    <p>
                      {orderData.seller.name ? orderData.seller.name : <br />}
                    </p>
                    <p>
                      {from !== 'TechnicalArea' ? (
                        orderData.formatted_total_value
                      ) : (
                        <br />
                      )}
                    </p>
                    <p>
                      {orderData.created_at ? orderData.created_at : <br />}
                    </p>
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
                            value={orderData.status_order}
                            defaultValue=""
                            displayEmpty
                            onChange={updateStatusOrder}
                          >
                            <MenuItem
                              value="Rascunho"
                              disabled={
                                user.permissions !== 'Admin' ||
                                (orderData.status_order === 'Aprovado' &&
                                  orderData.payment_way === 'Parcelado')
                              }
                            >
                              <RiDraftFill className={riDraftFill} />
                              Rascunho
                            </MenuItem>
                            <MenuItem
                              value="Aguardando"
                              disabled={
                                (orderData.status_order !== 'Rascunho' &&
                                  orderData.status_order !== 'Aguardando' &&
                                  user.permissions !== 'Admin') ||
                                (orderData.status_order === 'Aprovado' &&
                                  orderData.payment_way === 'Parcelado')
                              }
                            >
                              <FaRegClock className={faRegClock} />
                              Aguardando cliente
                            </MenuItem>
                            <MenuItem
                              value="Reprovado"
                              disabled={
                                (orderData.status_order !== 'Rascunho' &&
                                  orderData.status_order !== 'Aguardando' &&
                                  orderData.status_order !== 'Reprovado' &&
                                  user.permissions !== 'Admin') ||
                                (orderData.status_order === 'Aprovado' &&
                                  orderData.payment_way === 'Parcelado')
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
                      {orderData.status_order === 'Aprovado' ? (
                        orderData.formatted_approved_at
                      ) : (
                        <br />
                      )}
                    </p>
                  </DataForm>
                </OrdersProductsContainer>
              </PrimaryContent>
              <SecondaryContent
                isBlurred={
                  splitPaymentWayOpen ||
                  newProductOpen ||
                  productViewOpen ||
                  splitPaymentWayViewOpen
                }
              >
                {((from === 'Comercial' &&
                  !orderData.status_delivery &&
                  !orderData.status_billing &&
                  !orderData.status_payment) ||
                  (from === 'Comercial' &&
                    user.permissions === 'Admin' &&
                    orderData.payment_way !== 'Parcelado')) && (
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
                    <p>Observações da área técnica:</p>
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
                            onBlur={() => onDeliveryConditionsSubmit()}
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
                              onBlur={() => onRequestedDeliveryDateSubmit()}
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
                              onBlur={() => onRequestedDeliveryDateSubmit()}
                              defaultValue={
                                orderData.formatted_requested_delivery_date
                              }
                              mask="99/99/9999"
                              maskChar={null}
                              styled={{ width: '6em' }}
                            />
                          )}
                        </Form>
                        <p>
                          {orderData?.formatted_delivery_date ? (
                            orderData?.formatted_delivery_date
                          ) : (
                            <br />
                          )}
                        </p>
                      </>
                    )}
                    {from === 'Comercial' && !!orderData.status_delivery && (
                      <>
                        <p>
                          {orderData?.delivery_conditions ? (
                            orderData?.delivery_conditions
                          ) : (
                            <br />
                          )}
                        </p>
                        <p>
                          {orderData?.formatted_requested_delivery_date ? (
                            orderData?.formatted_requested_delivery_date
                          ) : (
                            <br />
                          )}
                        </p>
                        <p>
                          {orderData?.formatted_delivery_date ? (
                            orderData?.formatted_delivery_date
                          ) : (
                            <br />
                          )}
                        </p>
                      </>
                    )}
                    {from === 'Billing' && (
                      <>
                        <p>
                          {orderData?.delivery_conditions ? (
                            orderData?.delivery_conditions
                          ) : (
                            <br />
                          )}
                        </p>
                        <p>
                          {orderData?.formatted_requested_delivery_date ? (
                            orderData?.formatted_requested_delivery_date
                          ) : (
                            <br />
                          )}
                        </p>
                        <p>
                          {orderData?.formatted_delivery_date ? (
                            orderData?.formatted_delivery_date
                          ) : (
                            <br />
                          )}
                        </p>
                      </>
                    )}
                    {from === 'TechnicalArea' && (
                      <>
                        <p>
                          {orderData?.delivery_conditions ? (
                            orderData?.delivery_conditions
                          ) : (
                            <br />
                          )}
                        </p>
                        <p>
                          {orderData?.formatted_requested_delivery_date ? (
                            orderData?.formatted_requested_delivery_date
                          ) : (
                            <br />
                          )}
                        </p>
                        <Form
                          ref={deliveryDateRef}
                          onSubmit={submitDeliveryDate}
                        >
                          {orderData?.formatted_delivery_date && (
                            <InputAsTextWithMask
                              name="deliveryDateData"
                              onBlur={() => onDeliveryDateSubmit()}
                              defaultValue={orderData.formatted_delivery_date}
                              mask="99/99/9999"
                              maskChar={null}
                              styled={{ width: '6em' }}
                            />
                          )}
                          {!orderData?.formatted_delivery_date && (
                            <InputAsTextWithMask
                              name="deliveryDateData"
                              onBlur={() => onDeliveryDateSubmit()}
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
                      <p>
                        <br />
                      </p>
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
                    {from !== 'TechnicalArea' && (
                      <p>
                        {orderData?.technical_obs ? (
                          orderData?.technical_obs
                        ) : (
                          <br />
                        )}
                      </p>
                    )}
                    {from === 'TechnicalArea' && (
                      <>
                        <Status>
                          <FormControl className={formControl}>
                            <Select
                              value={orderData.status_delivery}
                              defaultValue=""
                              displayEmpty
                              onChange={updateStatusDelivery}
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
                                    orderData.status_delivery !==
                                      'Aguardando' &&
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
                                    orderData.status_delivery !==
                                      'Aguardando' &&
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
                                    orderData.status_delivery !==
                                      'Aguardando' &&
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
                                    orderData.status_delivery !==
                                      'Aguardando' &&
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
                                    orderData.status_delivery !==
                                      'Aguardando' &&
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
                        <Form
                          ref={technicalObsRef}
                          onSubmit={submitTechnicalObs}
                        >
                          <InputAsText
                            name="technicalObsData"
                            onBlur={() => onTechnicalObsSubmit()}
                            defaultValue={orderData.technical_obs}
                          />
                        </Form>
                      </>
                    )}
                  </DataForm>
                </DeliveryData>
                <BillingData>
                  <TitlesForm>
                    <p>Forma de pagamento:</p>
                    <p>Vencimento:</p>
                    <p>Meio de pagamento:</p>
                    <p>Status faturamento:</p>
                    <p>Status financeiro:</p>
                  </TitlesForm>
                  <DataForm>
                    {from === 'Comercial' &&
                      !orderData.status_billing &&
                      orderData.number_total_value > 0 && (
                        <>
                          <PaymentWay
                            paymentWay={orderData.payment_way as string}
                            statusBilling={!!orderData?.status_billing}
                          >
                            {!orderData.payment_way && (
                              <InputLabel>
                                Selecione uma forma de pagamento
                              </InputLabel>
                            )}
                            <FormControl className={formControl}>
                              <Select
                                value={orderData.payment_way}
                                defaultValue=""
                                displayEmpty
                                onChange={updatePaymentWay}
                              >
                                <MenuItem value="">&nbsp;</MenuItem>
                                <MenuItem value="À vista">À vista</MenuItem>
                                <MenuItem value="Faturado">Faturado</MenuItem>
                                {orderData.number_total_value >= 100 && (
                                  <MenuItem value="Parcelado">
                                    Parcelado
                                  </MenuItem>
                                )}
                              </Select>
                            </FormControl>
                            {orderData.payment_way === 'Parcelado' && (
                              <button
                                className="split-payment-way"
                                type="button"
                                onClick={handleOpenSplitPaymentWay}
                              >
                                <MaterialTooltip
                                  title="Ver parcelamento"
                                  arrow
                                  placement="top"
                                >
                                  <MdOpenInNew className={mdOpenInNew} />
                                </MaterialTooltip>
                              </button>
                            )}
                          </PaymentWay>
                          {orderData?.formatted_due_date &&
                            orderData?.payment_way === 'À vista' && (
                              <Form ref={dueDateRef} onSubmit={submitDueDate}>
                                <InputAsTextWithMask
                                  name="dueDateData"
                                  onBlur={() => onDueDateSubmit()}
                                  defaultValue={orderData.formatted_due_date}
                                  mask="99/99/9999"
                                  maskChar={null}
                                  styled={{ width: '6em' }}
                                />
                              </Form>
                            )}
                          {orderData?.formatted_due_date &&
                            orderData?.payment_way === 'Faturado' && (
                              <p>{orderData.formatted_due_date}</p>
                            )}
                          {orderData?.payment_way === 'Parcelado' && (
                            <p>
                              <br />
                            </p>
                          )}
                          {!orderData?.formatted_due_date &&
                            !orderData?.payment_way && (
                              <p>
                                <br />
                              </p>
                            )}
                          {orderData?.payment_way === 'Parcelado' ? (
                            <p>
                              <br />
                            </p>
                          ) : (
                            <PaymentMethod
                              paymentMethod={!!orderData.payment_method}
                            >
                              {!orderData.payment_method && (
                                <InputLabel>
                                  Selecione um meio de pagamento
                                </InputLabel>
                              )}
                              <FormControl className={formControl}>
                                <Select
                                  value={
                                    orderData.payment_method
                                      ? orderData.payment_method.id
                                      : ''
                                  }
                                  defaultValue=""
                                  displayEmpty
                                  onChange={handleSelectPaymentMethod}
                                >
                                  <MenuItem value="">&nbsp;</MenuItem>
                                  {paymentMethods.map((payment) => (
                                    <MenuItem
                                      value={payment.id}
                                      key={payment.id}
                                    >
                                      {payment.name as string}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </PaymentMethod>
                          )}
                        </>
                      )}
                    {(from === 'Billing' ||
                      (from !== 'TechnicalArea' &&
                        !!orderData.status_billing) ||
                      (from !== 'TechnicalArea' &&
                        orderData.number_total_value === 0)) && (
                      <>
                        {orderData.payment_way &&
                        orderData.number_total_value > 0 ? (
                          <PaymentWay
                            paymentWay={orderData.payment_way as string}
                            statusBilling={!!orderData?.status_billing}
                          >
                            <p>{orderData.payment_way as string}</p>

                            {orderData.payment_way === 'Parcelado' && (
                              <button
                                className="split-payment-way"
                                type="button"
                                onClick={handleOpenSplitPaymentWay}
                              >
                                <MaterialTooltip
                                  title="Ver parcelamento"
                                  arrow
                                  placement="top"
                                >
                                  <MdOpenInNew className={mdOpenInNew} />
                                </MaterialTooltip>
                              </button>
                            )}
                          </PaymentWay>
                        ) : (
                          <p>
                            <br />
                          </p>
                        )}
                        <p>
                          {orderData?.formatted_due_date ? (
                            orderData?.formatted_due_date
                          ) : (
                            <br />
                          )}
                        </p>
                        {orderData.payment_method ? (
                          <p>{orderData.payment_method.name as string}</p>
                        ) : (
                          <p>
                            <br />
                          </p>
                        )}
                      </>
                    )}
                    {from === 'TechnicalArea' && (
                      <>
                        <p>
                          <br />
                        </p>
                        <p>
                          <br />
                        </p>
                        <p>
                          <br />
                        </p>
                      </>
                    )}
                    {from !== 'Billing' && !orderData.status_billing && (
                      <p>
                        <br />
                      </p>
                    )}
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
                            value={orderData.status_billing}
                            defaultValue=""
                            displayEmpty
                            onChange={updateStatusBilling}
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
                    {from !== 'Billing' && !orderData.status_payment && (
                      <p>
                        <br />
                      </p>
                    )}
                    {from !== 'Billing' &&
                      orderData.status_payment === 'Aguardando' && (
                        <div className="status">
                          <FaRegClock className={faRegClock} />
                          <span>Aguardando pagamento</span>
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
                            value={orderData.status_payment}
                            defaultValue=""
                            displayEmpty
                            onChange={updateStatusPayment}
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
                              Aguardando pagamento
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
                isBlurred={
                  splitPaymentWayOpen ||
                  newProductOpen ||
                  productViewOpen ||
                  splitPaymentWayViewOpen
                }
              >
                <TitleRow>
                  <div style={{ width: '35px' }} />
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
                      <PaymentTypeProductItem
                        type="button"
                        onClick={() => handleSelectProduct(product)}
                      >
                        {/*
                        Lógica comentada para não atualizar a coluna product_payment_type dos orders_products
                        {orderData.payment_way === 'Parcelado' &&
                          formatPaymentTypeProductItem(
                            product.product_payment_type
                          )} */}
                      </PaymentTypeProductItem>
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
                              user.permissions === 'Admin' &&
                              orderData.payment_way !== 'Parcelado')) && (
                            <div>
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
