import React, {
  useState,
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { createFilterOptions, Autocomplete } from '@material-ui/lab';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { ThemeProvider } from '@material-ui/styles';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as themeAugmentation from '@material-ui/lab/themeAugmentation';
import {
  createMuiTheme,
  Grid,
  IconButton,
  TextField as OriginalTextField,
} from '@material-ui/core';
import NumberFormat from 'react-number-format';
import { Close } from '@material-ui/icons';
import { FaTimes } from 'react-icons/fa';
import { Form } from '@unform/web';
import { FormHandles } from '@unform/core';
import { TextField } from 'unform-material-ui';

import { OrderProductData } from '../SearchResults';
import Button from '../Button';
import DisabledButton from '../DisabledButton';

import api from '../../services/api';

import { useToast } from '../../hooks/toast';
import { useAuth } from '../../hooks/auth';

import {
  ModalContainer,
  Header,
  Content,
  Background,
  Product,
  Description,
  Value,
} from './styles';
import { useOverlap } from '../../hooks/overlap';

// Interface do product
interface ProductData {
  inputValue?: string; // Para adicionar um novo produto
  id?: string;
  name: string;
  description?: string;
  value: string;
}

// Interface para referenciar os dados inseridos nos inputs
interface InputData {
  descriptionData: string;
}

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

interface NewProductProps {
  // Recebe a cor do módulo a partir de qual módulo este component está sendo executado
  color: string;
  // Recebe opcionalmente o orderProduct, se receber indica atualização
  orderProduct?: OrderProductData;
  // Se receber o order_id para ser utilizado quando precisar criar uma nova order_product
  order_id: string;
  // Limpa o order_product após o fechamento deste component
  // setSelectedOrderProduct(e: string): void;
  // Envia atualização para os components order e searchResults
  // updateOrderProduct(data: OrderProductData): void;
  // Envia o order_product recém criado para os components order e searchResults
  // addNewOrderProduct(data: OrderProductData): void;
}

const SplitPaymentWay: React.FC<NewProductProps> = ({
  color,
  orderProduct,
  order_id,
  // setSelectedOrderProduct,
  // updateOrderProduct,
  // addNewOrderProduct,
}) => {
  // Armazena os products cadastrados no banco de dados
  const [products, setProducts] = useState<ProductData[]>([]);
  // Armazena o product selecionado pelo usuário
  const [selectedProduct, setSelectedProduct] = useState<ProductData>(
    {} as ProductData
  );

  const { addToast } = useToast();
  const { checkToken } = useAuth();
  const { overlapSplitPaymentWayOpen } = useOverlap();

  const descriptionRef = useRef<FormHandles>(null);

  const newProductMaterialTheme = createMuiTheme({
    palette: {
      primary: {
        main: color,
      },
    },
    overrides: {
      MuiAutocomplete: {
        option: {
          '&:hover': {
            backgroundColor: color,
            color: '#fff',
          },
          '&[data-focus="true"]': {
            backgroundColor: color,
            color: '#fff',
            '&:hover': {
              backgroundColor: color,
              color: '#fff',
            },
          },
          '&[aria-selected="true"]': {
            backgroundColor: color,
            color: '#fff',
            '&:hover': {
              backgroundColor: color,
              color: '#fff',
            },
          },
        },
        groupLabel: {
          borderBottom: `1px solid ${color}`,
          color,
          textTransform: 'uppercase',
        },
      },
      MuiTextField: {
        root: {
          width: '100%',
          '&& textarea': {
            minHeight: '50px',
            padding: '0 4px',
          },
        },
      },
    },
  });

  // Realiza um filtro ao pesquisar pelo nome da empresa
  const filter = createFilterOptions<ProductData>();

  // Função para buscar na API os dados deste parcelamento

  // Função para verificar se já existe parcelamento

  // Função para lidar com o fechamento deste component
  const handleCloseWindow = useCallback(() => {
    overlapSplitPaymentWayOpen(false); // Fecha este component
    setSelectedProduct({} as ProductData); // Limpa o estado
    // setSelectedOrderProduct(''); // Limpa o estado
  }, [overlapSplitPaymentWayOpen]);

  // Criar uma função para salvar o parcelamento

  return (
    <>
      {/* Verifica se existe parcelamento para carregar os dados */}
      {/* {orderProduct?.product && ( */}
      <ThemeProvider theme={newProductMaterialTheme}>
        <ModalContainer>
          <Header color={color}>
            <strong>PARCELAMENTO</strong>
            <button type="button" onClick={() => handleCloseWindow()}>
              <FaTimes />
            </button>
          </Header>
          {/* <Content color={color}>
              <Form ref={descriptionRef} onSubmit={handleSubmit}>
                <Product>
                  <Autocomplete
                    openText=""
                    clearText=""
                    clearOnBlur={false}
                    handleHomeEndKeys={false}
                    id="input-selectedProduct"
                    value={selectedProduct}
                    onChange={(event, newProduct) => {
                      if (newProduct?.inputValue) {
                        // Adiciona um novo produto
                        handleAddNewProduct(newProduct.inputValue);
                      } else if (newProduct) {
                        // Seleciona um existente
                        setSelectedProduct({
                          ...selectedProduct,
                          id: newProduct.id,
                          name: newProduct.name,
                        });
                      }
                      if (!newProduct) {
                        // Remove o ID do input
                        setSelectedProduct({
                          ...selectedProduct,
                          id: '',
                          name: '',
                        });
                      }
                    }}
                    filterOptions={(options, params) => {
                      const filtered = filter(options, params) as ProductData[];

                      if (params.inputValue !== '') {
                        filtered.push({
                          inputValue: params.inputValue,
                          name: `Adicionar ${params.inputValue}`,
                          value: '',
                        });
                      }

                      return filtered;
                    }}
                    options={products}
                    noOptionsText=""
                    getOptionLabel={({ name, inputValue }) => {
                      if (inputValue) {
                        return inputValue;
                      }
                      return name;
                    }}
                    renderInput={(params) => (
                      <OriginalTextField
                        autoFocus
                        label="Serviço"
                        {...params}
                      />
                    )}
                    renderOption={({ name }, { inputValue }) => {
                      const matches = match(name, inputValue);
                      const parts = parse(name, matches);

                      return (
                        <div>
                          {parts.map(({ highlight, text }) => (
                            <span
                              key={text}
                              style={{ fontWeight: highlight ? 700 : 400 }}
                            >
                              {text}
                            </span>
                          ))}
                        </div>
                      );
                    }}
                  />
                </Product>
                <Description>
                  <TextField
                    name="descriptionData"
                    placeholder="Descrição do serviço"
                    multiline
                    defaultValue={selectedProduct.description}
                    rowsMax={5}
                  />
                </Description>
                <Value>
                  <Grid container spacing={1} alignItems="flex-end">
                    <Grid item>
                      <OriginalTextField
                        label="Valor"
                        value={selectedProduct.value}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          setSelectedProduct({
                            ...selectedProduct,
                            value: e.target.value,
                          });
                        }}
                        InputProps={{
                          inputComponent: NumberFormatCustom as any,
                        }}
                      />
                    </Grid>
                    <Grid item>
                      {selectedProduct.value && (
                        <IconButton
                          onClick={() => {
                            setSelectedProduct({
                              ...selectedProduct,
                              value: '',
                            });
                          }}
                        >
                          <Close />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                </Value>
                {selectedProduct.name?.length > 0 && selectedProduct.value ? (
                  <Button>Alterar</Button>
                ) : (
                  <DisabledButton>Alterar</DisabledButton>
                )}
              </Form>
            </Content> */}
        </ModalContainer>
      </ThemeProvider>
      {/* )} */}
      {/* Verificar se já existe parcelamento ou se é um novo?? */}
      {/* Se não existe orderProduct os campos estarão em branco */}
      {/* {order_id && !orderProduct?.product && (
        <ThemeProvider theme={newProductMaterialTheme}>
          <ModalContainer>
            <Header color={color}>
              <strong>ADICIONAR SERVIÇO</strong>
              <button type="button" onClick={() => handleCloseWindow()}>
                <FaTimes />
              </button>
            </Header>
            <Content color={color}>
              <Form ref={descriptionRef} onSubmit={handleSubmit}>
                <Product>
                  <Autocomplete
                    openText=""
                    clearText=""
                    clearOnBlur={false}
                    handleHomeEndKeys={false}
                    value={selectedProduct}
                    onChange={(event, newProduct) => {
                      if (newProduct?.inputValue) {
                        // Adiciona um novo serviço
                        handleAddNewProduct(newProduct.inputValue);
                      } else if (newProduct) {
                        // Seleciona um existente
                        setSelectedProduct({
                          ...selectedProduct,
                          id: newProduct.id,
                          name: newProduct.name,
                        });
                      }
                      if (!newProduct) {
                        // Limpou o input
                        setSelectedProduct({
                          ...selectedProduct,
                          id: '',
                          name: '',
                        });
                      }
                    }}
                    filterOptions={(options, params) => {
                      const filtered = filter(options, params) as ProductData[];

                      if (params.inputValue !== '') {
                        filtered.push({
                          inputValue: params.inputValue,
                          name: `Adicionar ${params.inputValue}`,
                          value: '',
                        });
                      }

                      return filtered;
                    }}
                    options={products}
                    noOptionsText=""
                    getOptionLabel={({ name, inputValue }) => {
                      if (inputValue) {
                        return inputValue;
                      }
                      return name;
                    }}
                    renderInput={(params) => (
                      <OriginalTextField
                        autoFocus
                        {...params}
                        label="Serviço"
                      />
                    )}
                    renderOption={({ name }, { inputValue }) => {
                      const matches = match(name, inputValue);
                      const parts = parse(name, matches);

                      return (
                        <div>
                          {parts.map(({ highlight, text }) => (
                            <span
                              key={text}
                              style={{ fontWeight: highlight ? 700 : 400 }}
                            >
                              {text}
                            </span>
                          ))}
                        </div>
                      );
                    }}
                  />
                </Product>
                <Description>
                  <TextField
                    name="descriptionData"
                    placeholder="Descrição do serviço"
                    multiline
                    defaultValue={selectedProduct.description}
                    rowsMax={5}
                  />
                </Description>
                <Value>
                  <Grid container spacing={1} alignItems="flex-end">
                    <Grid item>
                      <OriginalTextField
                        label="Valor"
                        value={selectedProduct.value}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          setSelectedProduct({
                            ...selectedProduct,
                            value: e.target.value,
                          });
                        }}
                        InputProps={{
                          inputComponent: NumberFormatCustom as any,
                        }}
                      />
                    </Grid>
                    <Grid item>
                      {selectedProduct.value && (
                        <IconButton
                          onClick={() => {
                            setSelectedProduct({
                              ...selectedProduct,
                              value: '',
                            });
                          }}
                        >
                          <Close />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                </Value>
                {selectedProduct.name?.length > 0 && selectedProduct.value ? (
                  <Button>Adicionar</Button>
                ) : (
                  <DisabledButton>Adicionar</DisabledButton>
                )}
              </Form>
            </Content>
          </ModalContainer>
        </ThemeProvider>
      )} */}
      <Background />
    </>
  );
};

export default SplitPaymentWay;
