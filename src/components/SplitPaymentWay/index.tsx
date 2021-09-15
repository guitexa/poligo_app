import React, {
  useState,
  useCallback,
  ChangeEvent,
  useEffect,
  useMemo,
} from 'react';
import { FaTimes } from 'react-icons/fa';
import createTheme from '@material-ui/core/styles/createTheme';
import { TextField as OriginalTextField } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import NumberFormat from 'react-number-format';
import Close from '@material-ui/icons/Close';
import { ThemeProvider } from '@material-ui/styles';
import DateFnsUtils from '@date-io/date-fns';
import {
  isBefore,
  endOfDay,
  isValid,
  subBusinessDays,
  startOfDay,
  isAfter,
} from 'date-fns';
import { formatValueCurrency } from '../../utils';

import Button from '../Button';
import DisabledButton from '../DisabledButton';
import api from '../../services/api';

import { useToast } from '../../hooks/toast';
import { useOverlap } from '../../hooks/overlap';
import { ISplitPaymentWay, IPaymentMethod } from '../../interfaces';

import {
  ModalContainer,
  Header,
  Content,
  PaymentType,
  PaymentContent,
  EnterPayment,
  DividedPayment,
  SplitNumber,
  PaymentMethod,
  PrimaryContent,
  SecondaryContent,
  Value,
  DateField,
  TotalValue,
  Background,
} from './styles';

// Interface da função de máscara do input Value
interface NumberFormatCustomProps {
  inputRef: (instance: NumberFormat | null) => void;
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

// Função que cria uma máscara no input Value
function NumberFormatCustom(props: NumberFormatCustomProps): JSX.Element {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(value) => {
        onChange({
          target: {
            name: props.name,
            value: value.value,
          },
        });
      }}
      thousandSeparator="."
      decimalSeparator=","
      isNumericString
      fixedDecimalScale
      allowNegative={false}
      prefix="R$ "
      decimalScale={2}
    />
  );
}

interface SplitsPaymentWay {
  payment_way?: string;
  splits?: ISplitPaymentWay[];
  enter_due_date?: Date | null;
  enter_value?: string;
  enter_payment_method?: IPaymentMethod | null;
  splits_quantity: number;
  split_due_date?: Date | null;
  split_value: number;
  split_payment_method?: IPaymentMethod | null;
}

interface SplitPaymentWayProps {
  // Recebe a cor do módulo a partir de qual módulo este component está sendo executado
  color: string;
  // Recebe o order_id
  order_id: string;
  // Recebe o valor do pedido
  order_total_value: number;
  // Recebe se existe splitsPaymentWay cadastrado
  hasSplitsPaymentWay: boolean;
  // Retorna para o pedido se foi salvo o parcelamento ou não
  updateSplitsPaymentWay(e: boolean): void;
}

const SplitPaymentWay: React.FC<SplitPaymentWayProps> = ({
  color,
  order_id,
  order_total_value,
  hasSplitsPaymentWay,
  updateSplitsPaymentWay,
}) => {
  // Armazena os splitsPaymentWay cadastrados no banco de dados
  const [splitsPaymentWay, setSplitsPaymentWay] = useState<SplitsPaymentWay>(
    {} as SplitsPaymentWay
  );

  // Armazena dos meios de pagamentos cadastrados
  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>([]);

  // Armazena se houve alguma atualização no pedido
  const [splitPaymentWayUpdated, setSplitPaymentWayUpdated] = useState(false);

  // Armazena se existe algum erro em algum campo
  const [counterErrors, setCounterErrors] = useState<string[]>([]);

  // Define a data limite para o pagamento da entrada, que é 1 dia antes da 1ª parcela
  const [maxEnterDate, setMaxEnterDate] = useState<Date | null>(null);

  const { addToast } = useToast();
  const { overlapSplitPaymentWayOpen } = useOverlap();

  const splitPaymentWayMaterialTheme = createTheme({
    palette: {
      primary: {
        main: color,
      },
    },
    overrides: {
      MuiMenuItem: {
        root: {
          '&:hover': {
            backgroundColor: color,
            color: '#fff',
          },
          '&$selected': {
            backgroundColor: color,
            color: '#fff',
            '&:hover': {
              backgroundColor: color,
              color: '#fff',
            },
          },
        },
      },
    },
  });

  // Função para montar a estrutura do parcelamento do zero com sugestões
  const handleFirstFill = useCallback(
    (payment_way: string) => {
      // Separa os valores de ano, mês e dia do valor convertido
      const year = new Date(Date.now()).getFullYear();
      const month = new Date(Date.now()).getMonth() + 1;

      // Busca o meio de pagamento
      const payMethod = paymentMethods.find(
        (item) => item.name === 'Boleto Bancário'
      );

      // Define valores iniciais
      if (payment_way === 'Com entrada') {
        // Monta toda a estrutura do parcelamento com sugestões iniciais
        setSplitsPaymentWay({
          payment_way,
          enter_due_date: new Date(startOfDay(Date.now())),
          enter_value: String(order_total_value / 2), // Sugestão: 50% do valor do pedido
          enter_payment_method: payMethod,
          splits_quantity: 2,
          split_due_date: new Date(year, month, 1),
          split_value: order_total_value / 4, // Sugestão: 50% do valor do pedido
          split_payment_method: payMethod,
        });

        // Define a data máxima para a entrada
        setMaxEnterDate(subBusinessDays(new Date(year, month, 1), 1));
      } else if (payment_way === 'Sem entrada') {
        // Monta toda a estrutura do parcelamento com sugestões
        setSplitsPaymentWay({
          payment_way,
          splits_quantity: 2,
          split_due_date: new Date(year, month, 1),
          split_value: order_total_value / 2,
          split_payment_method: payMethod,
        });

        // Define que o banco de dados deve ser atualizado
        setSplitPaymentWayUpdated(true);
      }
    },
    [order_total_value, paymentMethods]
  );

  // Função para buscar na API os dados deste parcelamento
  useEffect(() => {
    if (hasSplitsPaymentWay) {
      api
        .get<ISplitPaymentWay[]>(`/splits-payment-way/${order_id}`)
        .then((response) => {
          if (response.data.length > 0) {
            // Verifica se é 'Com entrada' ou 'Sem entrada'
            if (
              response.data[0].payment_way === 'Com entrada' ||
              response.data[0].payment_way === 'Sem entrada'
            ) {
              // Busca a entrada
              const enter_payment = response.data.find(
                (i) => i.split_number === '0'
              );

              // Buscar as parcelas
              const splits = response.data
                .filter((i) => i.split_number !== '0')
                ?.sort((a, b) => {
                  if (
                    a.split_number &&
                    b.split_number &&
                    a.split_number < b.split_number
                  )
                    return -1;
                  if (
                    a.split_number &&
                    b.split_number &&
                    a.split_number > b.split_number
                  )
                    return 1;
                  return 0;
                });

              const firstSplit = splits[0];

              if (firstSplit && firstSplit.split_due_date) {
                // Define a data limite para o pagamento da entrada, que é 1 dia antes da 1ª parcela
                setMaxEnterDate(subBusinessDays(firstSplit.split_due_date, 1));
              }

              // Define no estado os valores encontrados na API
              setSplitsPaymentWay({
                payment_way: firstSplit.payment_way,
                splits,
                enter_due_date: enter_payment?.split_due_date,
                enter_value: enter_payment
                  ? String(enter_payment.split_value)
                  : undefined,
                enter_payment_method: enter_payment?.payment_method,
                splits_quantity: splits.length,
                split_due_date: firstSplit.split_due_date,
                split_value: firstSplit.split_value,
                split_payment_method: firstSplit.payment_method,
              });
            }
          }
        })
        .catch(() => {
          addToast({
            type: 'error',
            description: '#0270 - Erro ao carregar o parcelamento cadastrado',
          });
        });
    } else if (Number(order_total_value) <= 100) {
      handleFirstFill('Sem entrada');
    }
  }, [
    addToast,
    handleFirstFill,
    hasSplitsPaymentWay,
    order_id,
    order_total_value,
  ]);

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

  // Função para lidar com o fechamento deste component
  const handleCloseWindow = useCallback(() => {
    if (!splitPaymentWayUpdated) {
      // Fecha este component
      overlapSplitPaymentWayOpen(false);
    } else {
      // eslint-disable-next-line no-alert
      const checkBeforeClose = window.confirm(
        'Tem certeza que deseja fechar sem salvar?'
      );
      if (checkBeforeClose) {
        // Fecha este component
        overlapSplitPaymentWayOpen(false);
      }
    }
  }, [overlapSplitPaymentWayOpen, splitPaymentWayUpdated]);

  // Função para trocar o valor da entrada
  const handleChangeEnterValue = useCallback(
    (enter_value: string) => {
      // Armazena o valor recebido no estado
      setSplitsPaymentWay({
        ...splitsPaymentWay,
        enter_value,
      });

      if (enter_value !== '') {
        if (Number(enter_value) >= order_total_value) {
          addToast({
            type: 'error',
            description:
              'Não é possível inserir um valor maior que o total do pedido',
          });

          // Define erro pois o valor é maior que o total do pedido
          if (!counterErrors.find((err) => err === 'enterValue')) {
            setCounterErrors((state) => [...state, 'enterValue']);
          }
        } else if (counterErrors.find((err) => err === 'enterValue')) {
          // Limpa os erros
          setCounterErrors((state) => state.filter((e) => e !== 'enterValue'));
        }
      } else if (!counterErrors.find((err) => err === 'enterValue')) {
        setCounterErrors((state) => [...state, 'enterValue']);
      }

      // Define que o banco de dados deve ser atualizado
      setSplitPaymentWayUpdated(true);
    },
    [addToast, counterErrors, order_total_value, splitsPaymentWay]
  );

  // Função para alterar a forma de parcelamento
  const handleSelectPaymentWay = useCallback(
    (e: ChangeEvent<{ value: unknown }>) => {
      const payment_way = e.target.value as string;

      // Verifica se já existe alguma informação preenchida
      if (!splitsPaymentWay.payment_way) {
        // Se o estado está vazio então vai realizar um primeiro preenchimento com sugestões
        handleFirstFill(payment_way);
      } else if (payment_way === 'Sem entrada') {
        // Limpa os valores referentes a entrada
        setSplitsPaymentWay({
          ...splitsPaymentWay,
          payment_way,
          enter_due_date: null,
          enter_value: '',
          enter_payment_method: null,
        });

        // Verifica se tem erro no valor de entrada para limpar
        if (counterErrors.find((err) => err === 'enterValue')) {
          // Limpa os erros
          setCounterErrors((state) => state.filter((i) => i !== 'enterValue'));
        }

        // Verifica se tem erro na data da entrada para limpar
        if (counterErrors.find((err) => err === 'enterDueDate')) {
          // Limpa os erros
          setCounterErrors((state) =>
            state.filter((i) => i !== 'enterDueDate')
          );
        }
      } else if (payment_way === 'Com entrada') {
        // Busca o meio de pagamento
        const enter_payment_method = paymentMethods.find(
          (item) => item.name === 'Boleto Bancário'
        );

        // Sugere data de vencimento e meio de pagamento
        setSplitsPaymentWay({
          ...splitsPaymentWay,
          payment_way,
          enter_due_date: new Date(Date.now()),
          enter_payment_method,
        });

        // Define um erro no valor de entrada para o usuário ter que digitar
        if (!counterErrors.find((err) => err === 'enterValue')) {
          setCounterErrors((state) => [...state, 'enterValue']);
        }
      }

      // Define que o banco de dados deve ser atualizado
      setSplitPaymentWayUpdated(true);
    },
    [counterErrors, handleFirstFill, paymentMethods, splitsPaymentWay]
  );

  // Função para alterar o meio de pagamento da entrada
  const handleSelectEnterPaymentMethod = useCallback(
    (e: ChangeEvent<{ value: unknown }>) => {
      // Busca o meio de pagamento
      const enter_payment_method = paymentMethods.find(
        (item) => item.id === (e.target.value as string)
      );

      if (enter_payment_method) {
        setSplitsPaymentWay({
          ...splitsPaymentWay,
          enter_payment_method,
        });

        // Define que o banco de dados deve ser atualizado
        setSplitPaymentWayUpdated(true);
      }
    },
    [paymentMethods, splitsPaymentWay]
  );

  // Função para alterar o meio de pagamento das parcelas
  const handleSelectSplitPaymentMethod = useCallback(
    (e: ChangeEvent<{ value: unknown }>) => {
      // Busca o meio de pagamento
      const split_payment_method = paymentMethods.find(
        (item) => item.id === (e.target.value as string)
      );

      if (split_payment_method) {
        // Compara o número de parcelas selecionado com o número máximo permitido
        if (
          splitsPaymentWay.splits_quantity >
          Number(split_payment_method.split_max)
        ) {
          // Define o estado com o número máximo de parcelas permitido
          setSplitsPaymentWay({
            ...splitsPaymentWay,
            splits_quantity: Number(split_payment_method.split_max),
            split_payment_method,
          });
        } else {
          // Define o estado com o meio de pagamento selecionado
          setSplitsPaymentWay({
            ...splitsPaymentWay,
            split_payment_method,
          });
        }

        // Define que o banco de dados deve ser atualizado
        setSplitPaymentWayUpdated(true);
      }
    },
    [paymentMethods, splitsPaymentWay]
  );

  // Função para alterar o número de parcelas
  const handleChangeSplitsQuantity = useCallback(
    (e: ChangeEvent<{ value: unknown }>) => {
      const splits_quantity = e.target.value as number;

      // Define o estado com o número de parcelas selecionado
      setSplitsPaymentWay({
        ...splitsPaymentWay,
        splits_quantity,
      });

      // Define que o banco de dados deve ser atualizado
      setSplitPaymentWayUpdated(true);
    },
    [splitsPaymentWay]
  );

  // Função para alterar a data de vencimento da entrada
  const handleChangeEnterDueDate = useCallback(
    (enter_due_date: Date | null) => {
      // Armazena o valor recebido no estado
      setSplitsPaymentWay({
        ...splitsPaymentWay,
        enter_due_date: enter_due_date
          ? startOfDay(enter_due_date)
          : enter_due_date,
      });

      if (enter_due_date && isValid(enter_due_date)) {
        // Verifica se a data de vencimento é válida e igual ou maior que hoje e menor que o maxEnterDate
        if (
          isBefore(endOfDay(enter_due_date), Date.now()) ||
          (maxEnterDate && isAfter(startOfDay(enter_due_date), maxEnterDate))
        ) {
          addToast({
            type: 'error',
            description:
              'Insira uma data de vencimento igual ou maior que hoje e menor que o 1º vencimento',
          });

          // Define que possui erros na edição
          if (!counterErrors.find((err) => err === 'enterDueDate')) {
            setCounterErrors((state) => [...state, 'enterDueDate']);
          }
        } else if (counterErrors.find((err) => err === 'enterDueDate')) {
          // Limpa os erros
          setCounterErrors((state) =>
            state.filter((e) => e !== 'enterDueDate')
          );
        }
      }
      // Se não for uma data válida vai definir um erro verifica se já não tem erros
      else if (!counterErrors.find((err) => err === 'enterDueDate')) {
        // Define que possui erros na edição
        setCounterErrors((state) => [...state, 'enterDueDate']);
      }

      // Define que o banco de dados deve ser atualizado
      setSplitPaymentWayUpdated(true);
    },
    [addToast, counterErrors, maxEnterDate, splitsPaymentWay]
  );

  // Função para alterar a data de vencimento do parcelamento
  const handleChangeSplitDueDate = useCallback(
    (split_due_date: Date | null) => {
      // Armazena o valor recebido no estado
      setSplitsPaymentWay({
        ...splitsPaymentWay,
        split_due_date: split_due_date
          ? startOfDay(split_due_date)
          : split_due_date,
      });

      if (split_due_date && isValid(split_due_date)) {
        // Verifica se a data de vencimento é válida e menor que hoje
        if (isBefore(startOfDay(split_due_date), Date.now())) {
          addToast({
            type: 'error',
            description: 'Insira uma data de vencimento maior que hoje',
          });

          // Define que possui erros na edição
          if (!counterErrors.find((err) => err === 'splitDueDate')) {
            setCounterErrors((state) => [...state, 'splitDueDate']);
          }
        } else {
          // Define a data máxima para a entrada
          setMaxEnterDate(subBusinessDays(split_due_date, 1));

          if (counterErrors.find((err) => err === 'splitDueDate')) {
            // Limpa os erros
            setCounterErrors((state) =>
              state.filter((e) => e !== 'splitDueDate')
            );
          }
        }
      }
      // Se não for uma data válida vai definir um erro verifica se já não tem erros
      else if (!counterErrors.find((err) => err === 'splitDueDate')) {
        // Define que possui erros na edição
        setCounterErrors((state) => [...state, 'splitDueDate']);

        // Define a data máxima para a entrada para hoje, visto que não tem data da 1ª parcela
        setMaxEnterDate(new Date(Date.now()));
      }

      // Define que o banco de dados deve ser atualizado
      setSplitPaymentWayUpdated(true);
    },
    [addToast, counterErrors, splitsPaymentWay]
  );

  // Função para mostrar o valor da parcela calculado
  const splitValue = useMemo((): string => {
    // Verifica se tem o valor das parcelas para realizar os cálculos
    if (splitsPaymentWay.split_value || splitsPaymentWay.enter_value) {
      // Verifica se já houve alguma atualização
      if (splitPaymentWayUpdated) {
        // Busca a taxa de juros do meio de pagamento selecionado no parcelamento
        // Lógica comentada para não realizar o cálculo de juros
        // const splitInterestRate =
        //   (splitsPaymentWay.split_payment_method &&
        //    splitsPaymentWay.split_payment_method.interest_rate *
        //     splitsPaymentWay.splits_quantity) / 2;

        // Verifica se possui valor de entrada
        if (splitsPaymentWay.enter_value) {
          // Calcular valor da parcela com taxa de juros deduzindo a entrada
          const splitPaymentValueWithEnter =
            (order_total_value - Number(splitsPaymentWay.enter_value)) /
            splitsPaymentWay.splits_quantity;
          // Lógica comentada para não realizar o cálculo de juros
          // const splitPaymentValueWithEnter =
          //   (100 *
          //     (order_total_value -
          //       Number(splitsPaymentWay.enter_value))) /
          //   (100 - splitInterestRate) /
          //   splitsPaymentWay.splits_quantity;

          // Busca a taxa de juros do meio de pagamento selecionado no parcelamento
          // Lógica comentada para não realizar o cálculo de juros
          // const enterInterestRate =
          //     Number(splitsPaymentWay.enter_value).payment_method &&
          //     Number(splitsPaymentWay.enter_value).payment_method.interest_rate
          // );

          // Realiza o cálculo dos juros do valor da entrada
          const diffEnterWithInterestRate = 0;
          // Lógica comentada para não realizar o cálculo de juros
          // const diffEnterWithInterestRate =
          //   ((100 * Number(splitsPaymentWay.enter_value)) /
          //     (100 - (enterInterestRate * splitsPaymentWay.splits_quantity) /
          //         2) - Number(splitsPaymentWay.enter_value)) /
          //   splitsPaymentWay.splits_quantity;

          const newSplitPaymentValue =
            splitPaymentValueWithEnter + diffEnterWithInterestRate;

          splitsPaymentWay.split_value = newSplitPaymentValue;

          if (newSplitPaymentValue <= 0) {
            if (!counterErrors.find((err) => err === 'splitValue')) {
              setCounterErrors((state) => [...state, 'splitValue']);
            }

            return formatValueCurrency(0);
          }

          if (newSplitPaymentValue < 50) {
            // Define que possui erro no valor da parcela
            if (!counterErrors.find((err) => err === 'splitValue')) {
              addToast({
                type: 'error',
                description: 'Parcela mínima permitida de R$50,00',
              });

              if (!counterErrors.find((err) => err === 'splitValue')) {
                setCounterErrors((state) => [...state, 'splitValue']);
              }
            }
          } else if (counterErrors.find((err) => err === 'splitValue')) {
            // Limpa os erros
            setCounterErrors((state) =>
              state.filter((e) => e !== 'splitValue')
            );
          }

          return formatValueCurrency(newSplitPaymentValue);
        }

        // Calcular valor da parcela com taxa de juros sem entrada
        const newSplitPaymentValue =
          order_total_value / splitsPaymentWay.splits_quantity;
        // Lógica comentada para não realizar o cálculo de juros
        // const newSplitPaymentValue =
        //   (100 * order_total_value) /
        //   (100 - splitInterestRate) /
        //   splitsPaymentWay.splits_quantity;

        splitsPaymentWay.split_value = newSplitPaymentValue;

        if (newSplitPaymentValue < 50) {
          // Define que possui erro no valor da parcela
          if (!counterErrors.find((err) => err === 'splitValue')) {
            addToast({
              type: 'error',
              description: 'Parcela mínima permitida de R$50,00',
            });

            if (!counterErrors.find((err) => err === 'splitValue')) {
              setCounterErrors((state) => [...state, 'splitValue']);
            }
          }
        } else if (counterErrors.find((err) => err === 'splitValue')) {
          // Limpa os erros
          setCounterErrors((state) => state.filter((e) => e !== 'splitValue'));
        }

        return formatValueCurrency(newSplitPaymentValue);
      }
      // Se não houve nenhuma atualização então retorna o valor original
      return formatValueCurrency(splitsPaymentWay.split_value);
    }

    return '';
  }, [
    addToast,
    counterErrors,
    order_total_value,
    splitPaymentWayUpdated,
    splitsPaymentWay,
  ]);

  // Função para somar o valor total do pedido baseado nos parcelamentos
  const totalValue = useMemo((): string => {
    // Variável para armazenar a soma total das parcelas
    let sumAllSplits;

    if (splitPaymentWayUpdated) {
      sumAllSplits =
        splitsPaymentWay.splits_quantity * splitsPaymentWay.split_value;
    } else {
      sumAllSplits = splitsPaymentWay?.splits
        ?.map((split) => Number(split.split_value))
        .reduce((acc, val) => {
          return acc + val;
        }, 0);
    }

    const enterValue =
      Number(splitsPaymentWay.enter_value) > 0
        ? Number(splitsPaymentWay.enter_value)
        : 0;

    return formatValueCurrency(enterValue + (sumAllSplits || 0));
  }, [splitPaymentWayUpdated, splitsPaymentWay]);

  // Impede o usuário de fechar/atualizar o navegador sem salvar as informações
  window.onbeforeunload = () => {
    return splitPaymentWayUpdated
      ? 'Se você sair desta página você irá perder suas alterações.'
      : null;
  };

  // Função para salvar no banco de dados as informações do parcelamento
  const handleSubmit = useCallback(async () => {
    if (splitPaymentWayUpdated && splitsPaymentWay.splits) {
      await api
        .patch(`/splits-payment-way/${order_id}`, {
          payment_way: splitsPaymentWay.payment_way,
          order_total_value,
          enter_due_date: splitsPaymentWay.enter_due_date,
          enter_value: Number(splitsPaymentWay.enter_value),
          enter_payment_method_id: splitsPaymentWay.enter_payment_method?.id,
          splits_quantity: splitsPaymentWay.splits_quantity,
          split_due_date: splitsPaymentWay.split_due_date,
          split_value: Number(splitsPaymentWay.split_value?.toFixed(2)),
          split_payment_method_id: splitsPaymentWay.split_payment_method?.id,
        })
        .then(() => {
          addToast({
            type: 'success',
            description: 'Parcelamento atualizado com sucesso!',
          });

          // Fecha este component
          overlapSplitPaymentWayOpen(false);

          // Define que o banco de dados foi atualizado
          setSplitPaymentWayUpdated(false);
        })
        .catch(() => {
          addToast({
            type: 'error',
            description: '#0280 - Erro ao salvar o parcelamento',
          });
        });
    } else {
      await api
        .post(`/splits-payment-way/${order_id}`, {
          payment_way: splitsPaymentWay.payment_way,
          order_total_value,
          enter_due_date: splitsPaymentWay.enter_due_date,
          enter_value: Number(splitsPaymentWay.enter_value),
          enter_payment_method_id: splitsPaymentWay.enter_payment_method?.id,
          splits_quantity: splitsPaymentWay.splits_quantity,
          split_due_date: splitsPaymentWay.split_due_date,
          split_value: Number(splitsPaymentWay.split_value?.toFixed(2)),
          split_payment_method_id: splitsPaymentWay.split_payment_method?.id,
        })
        .then(() => {
          addToast({
            type: 'success',
            description: 'Parcelamento salvo com sucesso!',
          });

          // Indica que existe splitsPaymentWay cadastrados no banco de dados
          updateSplitsPaymentWay(true);

          // Fecha este component
          overlapSplitPaymentWayOpen(false);

          // Define que o banco de dados deve ser atualizado
          setSplitPaymentWayUpdated(false);
        })
        .catch(() => {
          addToast({
            type: 'error',
            description: '#0280 - Erro ao salvar o parcelamento',
          });
        });
    }
  }, [
    addToast,
    updateSplitsPaymentWay,
    order_id,
    order_total_value,
    overlapSplitPaymentWayOpen,
    splitPaymentWayUpdated,
    splitsPaymentWay,
  ]);

  return (
    <>
      <ThemeProvider theme={splitPaymentWayMaterialTheme}>
        <ModalContainer>
          <Header color={color}>
            <strong>PARCELAMENTO</strong>
            <button type="button" onClick={() => handleCloseWindow()}>
              <FaTimes />
            </button>
          </Header>
          <Content color={color}>
            <PaymentType color={color} value>
              <div>
                <FormControl>
                  <InputLabel>Forma de parcelamento</InputLabel>
                  <Select
                    value={
                      splitsPaymentWay.payment_way ||
                      splitsPaymentWay.payment_way ||
                      ''
                    }
                    defaultValue=""
                    displayEmpty
                    onChange={handleSelectPaymentWay}
                  >
                    {Number(order_total_value) > 100 && (
                      <MenuItem value="Com entrada">Com entrada</MenuItem>
                    )}
                    <MenuItem value="Sem entrada">Sem entrada</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </PaymentType>
            {splitsPaymentWay.payment_way && (
              <PaymentContent>
                {splitsPaymentWay.payment_way === 'Com entrada' && (
                  <EnterPayment>
                    <PrimaryContent>
                      <PaymentMethod
                        color={color}
                        value={!!splitsPaymentWay.enter_payment_method}
                      >
                        <FormControl>
                          <InputLabel>Meio de pagamento</InputLabel>
                          {splitsPaymentWay.split_payment_method && (
                            <Select
                              value={
                                splitsPaymentWay.enter_payment_method &&
                                splitsPaymentWay.enter_payment_method.id
                              }
                              onChange={handleSelectEnterPaymentMethod}
                            >
                              {paymentMethods.map((payment) => (
                                <MenuItem value={payment.id} key={payment.id}>
                                  {payment.name as string}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        </FormControl>
                      </PaymentMethod>
                    </PrimaryContent>
                    <SecondaryContent>
                      <Value>
                        <Grid container spacing={1} alignItems="flex-end">
                          <Grid item>
                            <OriginalTextField
                              label="Valor entrada"
                              error={
                                !!counterErrors.find(
                                  (err) => err === 'enterValue'
                                )
                              }
                              value={splitsPaymentWay.enter_value}
                              onChange={(e) =>
                                handleChangeEnterValue(e.target.value as string)
                              }
                              InputProps={{
                                inputComponent: NumberFormatCustom as any,
                              }}
                            />
                          </Grid>
                          <Grid item>
                            {splitsPaymentWay.enter_value && (
                              <IconButton
                                onClick={() => handleChangeEnterValue('')}
                              >
                                <Close />
                              </IconButton>
                            )}
                          </Grid>
                        </Grid>
                      </Value>
                      <DateField isFilled={!!splitsPaymentWay.enter_due_date}>
                        <Grid container alignItems="flex-end">
                          <Grid item>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                disableToolbar
                                variant="inline"
                                autoOk
                                error={
                                  !!counterErrors.find(
                                    (err) => err === 'enterDueDate'
                                  )
                                }
                                helperText=""
                                label="Vencimento"
                                format="dd/MM/yyyy"
                                disablePast
                                maxDate={maxEnterDate}
                                value={splitsPaymentWay.enter_due_date}
                                onChange={handleChangeEnterDueDate}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          <Grid item>
                            {splitsPaymentWay.enter_due_date && (
                              <IconButton
                                className="close-button"
                                onClick={() => handleChangeEnterDueDate(null)}
                              >
                                <Close />
                              </IconButton>
                            )}
                          </Grid>
                        </Grid>
                      </DateField>
                    </SecondaryContent>
                  </EnterPayment>
                )}
                {(splitsPaymentWay.payment_way === 'Com entrada' ||
                  splitsPaymentWay.payment_way === 'Sem entrada') && (
                  <DividedPayment>
                    <PrimaryContent>
                      <SplitNumber color={color} value>
                        <FormControl>
                          <InputLabel>Parcelas</InputLabel>
                          <Select
                            value={splitsPaymentWay.splits_quantity}
                            onChange={handleChangeSplitsQuantity}
                          >
                            {splitsPaymentWay.split_payment_method &&
                              splitsPaymentWay.split_payment_method.split_max >=
                                2 && <MenuItem value="2">2</MenuItem>}
                            {splitsPaymentWay.split_payment_method &&
                              splitsPaymentWay.split_payment_method.split_max >=
                                3 && <MenuItem value="3">3</MenuItem>}
                            {splitsPaymentWay.split_payment_method &&
                              splitsPaymentWay.split_payment_method.split_max >=
                                4 && <MenuItem value="4">4</MenuItem>}
                            {splitsPaymentWay.split_payment_method &&
                              splitsPaymentWay.split_payment_method.split_max >=
                                5 && <MenuItem value="5">5</MenuItem>}
                            {splitsPaymentWay.split_payment_method &&
                              splitsPaymentWay.split_payment_method.split_max >=
                                6 && <MenuItem value="6">6</MenuItem>}
                            {splitsPaymentWay.split_payment_method &&
                              splitsPaymentWay.split_payment_method.split_max >=
                                10 && <MenuItem value="10">10</MenuItem>}
                            {splitsPaymentWay.split_payment_method &&
                              splitsPaymentWay.split_payment_method.split_max >=
                                12 && <MenuItem value="12">12</MenuItem>}
                          </Select>
                        </FormControl>
                      </SplitNumber>
                      <PaymentMethod
                        color={color}
                        value={!!splitsPaymentWay.split_payment_method}
                      >
                        <FormControl>
                          <InputLabel>Meio de pagamento</InputLabel>
                          {splitsPaymentWay.split_payment_method && (
                            <Select
                              value={
                                splitsPaymentWay.split_payment_method &&
                                splitsPaymentWay.split_payment_method.id
                              }
                              onChange={handleSelectSplitPaymentMethod}
                            >
                              {paymentMethods.map((payment) => (
                                <MenuItem value={payment.id} key={payment.id}>
                                  {payment.name as string}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        </FormControl>
                      </PaymentMethod>
                    </PrimaryContent>
                    <SecondaryContent>
                      <Value>
                        <Grid container spacing={1} alignItems="flex-end">
                          <Grid item>
                            <OriginalTextField
                              label="Valor parcela"
                              value={splitValue}
                              error={
                                !!counterErrors.find(
                                  (err) => err === 'splitValue'
                                )
                              }
                              InputProps={{
                                contentEditable: false,
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Value>
                      <DateField isFilled={!!splitsPaymentWay.split_due_date}>
                        <Grid container alignItems="flex-end">
                          <Grid item>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                disableToolbar
                                variant="inline"
                                autoOk
                                error={
                                  !!counterErrors.find(
                                    (err) => err === 'splitDueDate'
                                  )
                                }
                                helperText=""
                                label="1º vencimento"
                                format="dd/MM/yyyy"
                                minDate={new Date(Date.now())}
                                value={splitsPaymentWay.split_due_date}
                                onChange={handleChangeSplitDueDate}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          <Grid item>
                            {splitsPaymentWay.split_due_date && (
                              <IconButton
                                className="close-button"
                                onClick={() => handleChangeSplitDueDate(null)}
                              >
                                <Close />
                              </IconButton>
                            )}
                          </Grid>
                        </Grid>
                      </DateField>
                    </SecondaryContent>
                  </DividedPayment>
                )}
              </PaymentContent>
            )}
            {splitsPaymentWay.payment_way && (
              <>
                {counterErrors.length === 0 && splitPaymentWayUpdated ? (
                  splitsPaymentWay.payment_way === 'Sem entrada' ? (
                    <Button
                      style={{ padding: '8px 40px', marginLeft: '10px' }}
                      onClick={() => handleSubmit()}
                    >
                      {splitsPaymentWay.splits ? 'Atualizar' : 'Salvar'}
                    </Button>
                  ) : (
                    <Button
                      style={{ marginLeft: '10px' }}
                      onClick={() => handleSubmit()}
                    >
                      {splitsPaymentWay.splits ? 'Atualizar' : 'Salvar'}
                    </Button>
                  )
                ) : splitsPaymentWay.payment_way === 'Sem entrada' ? (
                  <DisabledButton
                    styled={{ padding: '8px 40px', marginLeft: '10px' }}
                  >
                    {splitsPaymentWay.splits ? 'Atualizar' : 'Salvar'}
                  </DisabledButton>
                ) : (
                  <DisabledButton styled={{ marginLeft: '10px' }}>
                    {splitsPaymentWay.splits ? 'Atualizar' : 'Salvar'}
                  </DisabledButton>
                )}
                <TotalValue color={color}>
                  <div>
                    <p>Valor total</p>
                    <p>{totalValue}</p>
                  </div>
                </TotalValue>
              </>
            )}
          </Content>
        </ModalContainer>
      </ThemeProvider>
      <Background />
    </>
  );
};

export default SplitPaymentWay;
