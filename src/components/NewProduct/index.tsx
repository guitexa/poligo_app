import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createFilterOptions, Autocomplete } from '@material-ui/lab';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { ThemeProvider } from '@material-ui/styles';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as themeAugmentation from '@material-ui/lab/themeAugmentation';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import { createTheme } from '@material-ui/core/styles';
import { TextField as OriginalTextField } from '@material-ui/core'; // Nome alterado pois foi utilizado o TextField do unform-material-ui também
import NumberFormat from 'react-number-format';
import Close from '@material-ui/icons/Close';
import { FaTimes } from 'react-icons/fa';
import { Form } from '@unform/web';
import { FormHandles } from '@unform/core';
import { TextField } from 'unform-material-ui';

import { IOrderProduct } from '../../interfaces';

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
  descriptionData?: string;
  id?: string;
  name?: string;
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
      allowNegative={false}
      prefix="R$ "
      decimalScale={2}
    />
  );
}

interface NewProductProps {
  // Recebe a cor do módulo a partir de qual módulo este component está sendo executado
  color: string;
  // Recebe opcionalmente o orderProduct, se receber indica atualização
  orderProduct?: IOrderProduct;
  // Se receber o order_id para ser utilizado quando precisar criar uma nova order_product
  order_id: string;
  // Limpa o order_product após o fechamento deste component
  setSelectedOrderProduct(e: string): void;
  // Envia atualização para os components order e searchResults
  updateOrderProduct(data: IOrderProduct): void;
  // Envia o order_product recém criado para os components order e searchResults
  addNewOrderProduct(data: IOrderProduct): void;
}

const NewProduct: React.FC<NewProductProps> = ({
  color,
  orderProduct,
  order_id,
  setSelectedOrderProduct,
  updateOrderProduct,
  addNewOrderProduct,
}) => {
  // Armazena os products cadastrados no banco de dados
  const [products, setProducts] = useState<ProductData[]>([]);

  // Armazena o product selecionado pelo usuário
  const [selectedProduct, setSelectedProduct] = useState<ProductData>(
    {} as ProductData
  );

  // Armazena se houve alguma atualização no product
  const [productUpdated, setProductUpdated] = useState(false);

  const { addToast } = useToast();
  const { checkToken } = useAuth();
  const { overlapNewProductOpen } = useOverlap();

  const descriptionRef = useRef<FormHandles>(null);

  const newProductMaterialTheme = createTheme({
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

  // Busca na API os products cadastrados e armazena no estado products
  useEffect(() => {
    checkToken();
    api
      .get<ProductData[]>('/products')
      .then((response) => {
        setProducts(response.data);
      })
      .catch(() => {
        addToast({
          type: 'error',
          description: '#0180 - Erro ao carregar os serviços cadastrados',
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Se houver orderProduct indica atualização
  if (
    !selectedProduct.id &&
    !selectedProduct.name &&
    !selectedProduct.value &&
    orderProduct?.product
  ) {
    setSelectedProduct({
      id: orderProduct.product.id,
      name: orderProduct.product.name,
      description: orderProduct.product_description,
      value: orderProduct.product_value,
    });
  }

  // Função para adicionar um novo produto
  const handleAddNewProduct = useCallback(
    (name: string) => {
      // Verifica se esse produto já existe
      const findProduct = products.find(
        (product) =>
          product.name.toLowerCase().trimStart().trimEnd() ===
          name.toLowerCase().trimStart().trimEnd()
      );

      if (findProduct) {
        // Se um produto foi encontrado então utiliza esse ao invés de adicionar um novo
        setSelectedProduct({
          ...selectedProduct,
          id: findProduct.id,
          name,
        });
      }
      // Se não encontrou um produto vai adicionar um novo mesmo
      else {
        setSelectedProduct({
          ...selectedProduct,
          id: '', // Se um novo produto será criado limpa o existente
          name: name.trimStart().trimEnd(),
        });
      }

      // Define que o banco de dados deve ser atualizado
      setProductUpdated(true);
    },
    [products, selectedProduct]
  );
  // Função para lidar com o fechamento deste component
  const handleCloseWindow = useCallback(() => {
    if (!productUpdated) {
      overlapNewProductOpen(false); // Fecha este component
      setSelectedProduct({} as ProductData); // Limpa o estado
      setSelectedOrderProduct(''); // Limpa o estado
    } else {
      // eslint-disable-next-line no-alert
      const checkBeforeClose = window.confirm(
        'Tem certeza que deseja fechar sem salvar?'
      );
      if (checkBeforeClose) {
        overlapNewProductOpen(false); // Fecha este component
        setSelectedProduct({} as ProductData); // Limpa o estado
        setSelectedOrderProduct(''); // Limpa o estado
      }
    }
  }, [overlapNewProductOpen, productUpdated, setSelectedOrderProduct]);

  // Função para selecionar um product existente
  const handleSelectProduct = useCallback(
    ({ id, name }: InputData) => {
      if (id !== undefined && name !== undefined) {
        setSelectedProduct({
          ...selectedProduct,
          id,
          name,
        });
        // Define que o banco de dados deve ser atualizado
        setProductUpdated(true);
      }
    },
    [selectedProduct]
  );

  // Função para trocar o valor do order_product
  const handleChangeValue = useCallback(
    (value: string) => {
      setSelectedProduct({
        ...selectedProduct,
        value,
      });

      // Define que o banco de dados deve ser atualizado
      setProductUpdated(true);
    },
    [selectedProduct]
  );

  // Função que cria um novo order_product ou atualiza um existente e/ou cria um novo product
  const handleSubmit = useCallback(
    async ({ descriptionData }: InputData) => {
      const clearDescriptionData = descriptionData
        ? descriptionData.trimEnd().trimStart().split(/\s+/).join(' ')
        : '';

      // Verifica se existe orderProduct para atualizar
      if (orderProduct?.product) {
        // Verifica se existe ID de produto selecionado ou se precisa criar um novo
        if (selectedProduct.id) {
          checkToken();
          // Faz a atualização do order_product existente utilizando um product existente
          await api
            .patch<IOrderProduct>(`/orders-products/${orderProduct.id}`, {
              product_id: selectedProduct.id,
              product_description: clearDescriptionData,
              product_value: selectedProduct.value,
            })
            .then((orderProductResponse) => {
              // Envia o response para atualizar os components order e searchResults
              updateOrderProduct(orderProductResponse.data);

              // Define que o banco de dados foi atualizado
              setProductUpdated(false);

              overlapNewProductOpen(false); // Fecha este component
              setSelectedProduct({} as ProductData); // Limpa o estado
              setSelectedOrderProduct(''); // Limpa o estado

              addToast({
                type: 'success',
                description: 'Serviço alterado com sucesso!',
              });
            })
            .catch(() => {
              addToast({
                type: 'error',
                description: '#0130 - Erro ao alterar um serviço existente',
              });
            });
        }
        // Se não existe ID de product indica que é para criar um novo product
        else {
          checkToken();
          // Cria um novo product
          await api
            .post<ProductData>('/products', {
              name: selectedProduct.name,
            })
            .then((productResponse) => {
              // Inclui o ID do novo product no selectedProduct
              setSelectedProduct({
                ...selectedProduct,
                id: productResponse.data.id,
              });

              // Inclui no array de products o novo product adicionado
              setProducts([
                ...products,
                {
                  id: productResponse.data.id, // Utiliza o ID do product recém criado
                  name: selectedProduct.name,
                  value: selectedProduct.value || '',
                },
              ]);

              // Faz a atualização do order_product utilizando um product recém criado
              api
                .patch<IOrderProduct>(`/orders-products/${orderProduct.id}`, {
                  product_id: productResponse.data.id, // Utiliza o ID do product recém criado
                  product_description: clearDescriptionData,
                  product_value: selectedProduct.value,
                })
                .then((orderProductResponse) => {
                  // Envia o response para atualizar os components order e searchResults
                  updateOrderProduct(orderProductResponse.data);

                  // Define que o banco de dados foi atualizado
                  setProductUpdated(false);

                  overlapNewProductOpen(false); // Fecha este component
                  setSelectedProduct({} as ProductData); // Limpa o estado
                  setSelectedOrderProduct(''); // Limpa o estado

                  addToast({
                    type: 'success',
                    description: 'Serviço alterado com sucesso!',
                  });
                })
                .catch(() => {
                  addToast({
                    type: 'error',
                    description: '#0130 - Erro ao alterar um serviço existente',
                  });
                });
            })
            .catch(() => {
              addToast({
                type: 'error',
                description: '#0110 - Erro ao criar um novo serviço',
              });
            });
        }
      }
      // Se não houver orderProduct indica que é para criar um novo order_product
      // Verifica se existe ID de produto selecionado ou se precisa criar um novo
      else if (selectedProduct.id) {
        checkToken();
        // Cria um novo order_product utilizando um product existente
        await api
          .post<IOrderProduct>(`/orders-products/${order_id}`, {
            product_id: selectedProduct.id,
            product_description: clearDescriptionData,
            product_value: selectedProduct.value,
          })
          .then((orderProductResponse) => {
            // Envia o order_product criado para atualizar a order e o searchResults
            addNewOrderProduct(orderProductResponse.data);

            // Define que o banco de dados foi atualizado
            setProductUpdated(false);

            overlapNewProductOpen(false); // Fecha este component
            setSelectedProduct({} as ProductData); // Limpa o estado
            setSelectedOrderProduct(''); // Limpa o estado

            addToast({
              type: 'success',
              description: 'Serviço criado com sucesso!',
            });
          })
          .catch(() => {
            addToast({
              type: 'error',
              description:
                '#0120 - Erro ao adicionar um novo serviço no pedido',
            });
          });
      }
      // Se não existe ID de product indica que é para criar um novo
      else {
        checkToken();
        // Cria um novo product
        await api
          .post<ProductData>('/products', {
            name: selectedProduct.name,
          })
          .then((productResponse) => {
            // Inclui o ID do novo product no selectedProduct
            setSelectedProduct({
              ...selectedProduct,
              id: productResponse.data.id,
            });

            // Inclui no array de products o novo product adicionado
            setProducts([
              ...products,
              {
                id: productResponse.data.id, // Utiliza o ID do product recém criado
                name: selectedProduct.name,
                value: selectedProduct.value || '',
              },
            ]);

            // Cria um novo order_product com o novo product recém criado
            api
              .post<IOrderProduct>(`/orders-products/${order_id}`, {
                product_id: productResponse.data.id, // Utiliza o ID do product recém criado
                // product_id: selectedProduct.id, // Utiliza o ID do product recém criado
                product_description: clearDescriptionData,
                product_value: selectedProduct.value,
              })
              .then((orderProductResponse) => {
                // Envia o order_product criado para atualizar a order e o searchResults
                addNewOrderProduct(orderProductResponse.data);

                // Define que o banco de dados foi atualizado
                setProductUpdated(false);

                overlapNewProductOpen(false); // Fecha este component
                setSelectedProduct({} as ProductData); // Limpa o estado
                setSelectedOrderProduct(''); // Limpa o estado

                addToast({
                  type: 'success',
                  description: 'Serviço criado com sucesso!',
                });
              })
              .catch(() => {
                addToast({
                  type: 'error',
                  description:
                    '#120 - Erro ao adicionar um novo serviço no pedido',
                });
              });
          })
          .catch(() => {
            addToast({
              type: 'error',
              description: '#0110 - Erro ao criar um novo serviço',
            });
          });
      }
    },
    [
      addNewOrderProduct,
      addToast,
      checkToken,
      orderProduct,
      order_id,
      overlapNewProductOpen,
      products,
      selectedProduct,
      setSelectedOrderProduct,
      updateOrderProduct,
    ]
  );

  return (
    <>
      <ThemeProvider theme={newProductMaterialTheme}>
        <ModalContainer>
          <Header color={color}>
            {orderProduct?.product ? (
              <strong>ALTERAR SERVIÇO</strong>
            ) : (
              <strong>ADICIONAR SERVIÇO</strong>
            )}
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
                  id="input-selectedProduct"
                  value={selectedProduct}
                  getOptionSelected={(option, value) =>
                    option.name === value.name
                  }
                  onChange={(event, newProduct) => {
                    if (newProduct?.inputValue) {
                      //
                      handleAddNewProduct(newProduct.inputValue);
                    } else if (newProduct) {
                      // Seleciona um existente
                      handleSelectProduct({
                        id: newProduct.id,
                        name: newProduct.name,
                      });
                    }
                    if (!newProduct) {
                      // Remove o ID do input
                      handleSelectProduct({
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
                    return name || '';
                  }}
                  renderInput={(params) => (
                    <OriginalTextField {...params} autoFocus label="Serviço" />
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
                      onChange={(e) =>
                        handleChangeValue(e.target.value as string)
                      }
                      InputProps={{
                        inputComponent: NumberFormatCustom as any,
                      }}
                    />
                  </Grid>
                  <Grid item>
                    {selectedProduct.value && (
                      <IconButton onClick={() => handleChangeValue('')}>
                        <Close />
                      </IconButton>
                    )}
                  </Grid>
                </Grid>
              </Value>
              {orderProduct?.product ? (
                selectedProduct.name && selectedProduct.value ? (
                  <Button>Atualizar</Button>
                ) : (
                  <DisabledButton>Atualizar</DisabledButton>
                )
              ) : selectedProduct.name && selectedProduct.value ? (
                <Button>Adicionar</Button>
              ) : (
                <DisabledButton>Adicionar</DisabledButton>
              )}
            </Form>
          </Content>
        </ModalContainer>
      </ThemeProvider>
      <Background />
    </>
  );
};

export default NewProduct;
