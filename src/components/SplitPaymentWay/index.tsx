import React, { useState, useCallback, ChangeEvent } from 'react';
import { FaTimes } from 'react-icons/fa';
import {
  createMuiTheme,
  Grid,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField as OriginalTextField,
} from '@material-ui/core';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import Radio from '@material-ui/core/Radio';
import NumberFormat from 'react-number-format';
import { Close } from '@material-ui/icons';
import { ThemeProvider } from '@material-ui/styles';
import { Form } from '@unform/web';
import { FormHandles } from '@unform/core';
import DateFnsUtils from '@date-io/date-fns';

import api from '../../services/api';

import { useToast } from '../../hooks/toast';
import { useAuth } from '../../hooks/auth';

import {
  ModalContainer,
  Header,
  Content,
  PaymentType,
  RadioLabel,
  PaymentContent,
  EnterPayment,
  DividedPayment,
  DividedQuantity,
  PaymentMethod,
  PrimaryContent,
  SecondaryContent,
  Value,
  Date,
  TotalValue,
  Background,
} from './styles';
import { useOverlap } from '../../hooks/overlap';

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
      prefix="R$ "
      decimalScale={2}
    />
  );
}

interface SplitPaymentWayProps {
  // Recebe a cor do módulo a partir de qual módulo este component está sendo executado
  color: string;
  // Recebe o order_id
  order_id: string;
}

const SplitPaymentWay: React.FC<SplitPaymentWayProps> = ({
  color,
  order_id,
}) => {
  // Armazena os products cadastrados no banco de dados
  const [selectedPaymentType, setSelectedPaymentType] = useState('');

  const { addToast } = useToast();
  const { checkToken } = useAuth();
  const { overlapSplitPaymentWayOpen } = useOverlap();

  const splitPaymentWayMaterialTheme = createMuiTheme({
    palette: {
      primary: {
        main: color,
      },
    },
  });

  // Função para buscar na API os dados deste parcelamento

  // Função para verificar se já existe parcelamento

  // Função para lidar com o fechamento deste component
  const handleCloseWindow = useCallback(() => {
    overlapSplitPaymentWayOpen(false); // Fecha este component
  }, [overlapSplitPaymentWayOpen]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSelectedPaymentType(e.target.value);
  }, []);

  // Criar uma função para salvar o parcelamento
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
            <Form onSubmit={() => {}}>
              <PaymentType>
                <Radio
                  checked={selectedPaymentType === 'Com entrada'}
                  onChange={handleChange}
                  value="Com entrada"
                />
                <RadioLabel
                  checked={
                    selectedPaymentType === 'Com entrada' ||
                    !selectedPaymentType
                  }
                >
                  Com entrada
                </RadioLabel>
                <Radio
                  checked={selectedPaymentType === 'Sem entrada'}
                  onChange={handleChange}
                  value="Sem entrada"
                />
                <RadioLabel
                  checked={
                    selectedPaymentType === 'Sem entrada' ||
                    !selectedPaymentType
                  }
                >
                  Sem entrada
                </RadioLabel>
              </PaymentType>
              <PaymentContent>
                {selectedPaymentType === 'Com entrada' && (
                  <EnterPayment>
                    <PrimaryContent>
                      <PaymentMethod color={color} value>
                        <FormControl>
                          <InputLabel>Forma de pagamento</InputLabel>
                          <Select
                            value="PIX"
                            defaultValue=""
                            displayEmpty
                            onChange={() => {}}
                          >
                            <MenuItem value="">&nbsp;</MenuItem>
                            <MenuItem value="PIX">PIX</MenuItem>
                          </Select>
                        </FormControl>
                      </PaymentMethod>
                    </PrimaryContent>
                    <SecondaryContent>
                      <Value>
                        <Grid container spacing={1} alignItems="flex-end">
                          <Grid item>
                            <OriginalTextField
                              label="Valor entrada"
                              value="500"
                              onChange={() => {}}
                              InputProps={{
                                inputComponent: NumberFormatCustom as any,
                              }}
                            />
                          </Grid>
                          <Grid item>
                            {/* {selectedProduct.value && ( */}
                            <IconButton
                            //   onClick={() => {
                            //     setSelectedProduct({
                            //       ...selectedProduct,
                            //       value: '',
                            //     });
                            //   }}
                            >
                              <Close />
                            </IconButton>
                            {/* )} */}
                          </Grid>
                        </Grid>
                      </Value>
                      <Date color={color} isFilled>
                        <Grid container alignItems="flex-end">
                          <Grid item>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                disableToolbar
                                variant="inline"
                                autoOk
                                helperText=""
                                label="Vencimento"
                                format="dd/MM/yyyy"
                                value="2021-01-01"
                                onChange={() => {}}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          <Grid item>
                            {/* {value && ( */}
                            <IconButton
                              className="close-button"
                              onClick={() => {}}
                            >
                              <Close />
                            </IconButton>
                            {/* )} */}
                          </Grid>
                        </Grid>
                      </Date>
                    </SecondaryContent>
                  </EnterPayment>
                )}
                {(selectedPaymentType === 'Com entrada' ||
                  selectedPaymentType === 'Sem entrada') && (
                  <DividedPayment>
                    <PrimaryContent>
                      <DividedQuantity color={color} value>
                        <FormControl>
                          <InputLabel>Parcelas</InputLabel>
                          <Select
                            value="12"
                            defaultValue=""
                            displayEmpty
                            onChange={() => {}}
                          >
                            <MenuItem value="2">2</MenuItem>
                            <MenuItem value="3">3</MenuItem>
                            <MenuItem value="4">4</MenuItem>
                            <MenuItem value="5">5</MenuItem>
                            <MenuItem value="6">6</MenuItem>
                            <MenuItem value="7">7</MenuItem>
                            <MenuItem value="8">8</MenuItem>
                            <MenuItem value="9">9</MenuItem>
                            <MenuItem value="10">10</MenuItem>
                            <MenuItem value="11">11</MenuItem>
                            <MenuItem value="12">12</MenuItem>
                          </Select>
                        </FormControl>
                      </DividedQuantity>
                      <PaymentMethod color={color} value>
                        <FormControl>
                          <InputLabel>Forma de pagamento</InputLabel>
                          <Select
                            value="Cartão de Crédito"
                            defaultValue=""
                            displayEmpty
                            onChange={() => {}}
                          >
                            <MenuItem value="">&nbsp;</MenuItem>
                            <MenuItem value="Cartão de Crédito">
                              Cartão de Crédito
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </PaymentMethod>
                    </PrimaryContent>
                    <SecondaryContent>
                      <Value>
                        <Grid container spacing={1} alignItems="flex-end">
                          <Grid item>
                            <OriginalTextField
                              label="Valor parcela"
                              value="60.69"
                              onChange={() => {}}
                              InputProps={{
                                inputComponent: NumberFormatCustom as any,
                              }}
                            />
                          </Grid>
                          <Grid item>
                            {/* {selectedProduct.value && ( */}
                            <IconButton
                            //   onClick={() => {
                            //     setSelectedProduct({
                            //       ...selectedProduct,
                            //       value: '',
                            //     });
                            //   }}
                            >
                              <Close />
                            </IconButton>
                            {/* )} */}
                          </Grid>
                        </Grid>
                      </Value>
                      <Date color={color} isFilled>
                        <Grid container alignItems="flex-end">
                          <Grid item>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                disableToolbar
                                variant="inline"
                                autoOk
                                helperText=""
                                label="1º vencimento"
                                format="dd/MM/yyyy"
                                value="2021-01-01"
                                onChange={() => {}}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                          <Grid item>
                            {/* {value && ( */}
                            <IconButton
                              className="close-button"
                              onClick={() => {}}
                            >
                              <Close />
                            </IconButton>
                            {/* )} */}
                          </Grid>
                        </Grid>
                      </Date>
                    </SecondaryContent>
                  </DividedPayment>
                )}
              </PaymentContent>
              {selectedPaymentType && (
                <TotalValue color={color}>
                  <p>Valor total</p>
                  <p>R$ 1.206,93</p>
                </TotalValue>
              )}
            </Form>
          </Content>
        </ModalContainer>
      </ThemeProvider>
      <Background />
    </>
  );
};

export default SplitPaymentWay;
