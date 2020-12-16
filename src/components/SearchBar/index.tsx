import React, { useEffect, useState } from 'react';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import {
  TextField,
  IconButton,
  Grid,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  createStyles,
  makeStyles,
  Theme,
  createMuiTheme,
  ThemeProvider,
} from '@material-ui/core';
import { Search, Close } from '@material-ui/icons';
import Autocomplete from '@material-ui/lab/Autocomplete';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as themeAugmentation from '@material-ui/lab/themeAugmentation';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { FaCheckCircle, FaRegClock, FaTimes } from 'react-icons/fa';
import { HiOutlineRefresh } from 'react-icons/hi';
import { RiDraftFill } from 'react-icons/ri';
import { IoMdThumbsDown } from 'react-icons/io';

import api from '../../services/api';
import { useSearch } from '../../hooks/search';
import { useAuth, User } from '../../hooks/auth';
import { useToast } from '../../hooks/toast';

import { OrderData } from '../SearchResults';

import {
  Container,
  Date,
  ClientName,
  Product,
  Professional,
  Value,
  Status,
} from './styles';

interface SearchBarProps {
  // Recebe a cor do módulo a partir de qual módulo este component está sendo executado
  color: string;
  // A partir de qual módulo este component está sendo executado
  from: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ color, from }) => {
  // Armazena os vendedores cadastrados no banco de dados
  const [sellers, setSellers] = useState<User[]>([]);
  // Armazena os técnicos cadastrados no banco de dados
  const [technicals, setTechnicals] = useState<(User | null | undefined)[]>([]);

  const {
    approved_at,
    created_at,
    delivery_date,
    client_name,
    products,
    seller,
    technical,
    total_value,
    status_order,
    status_delivery,
    status_billing,
    searchApprovedAt,
    searchCreatedAt,
    searchDeliveryDate,
    searchClientName,
    searchProducts,
    searchSeller,
    searchTechnical,
    searchTotalValue,
    searchStatusOrder,
    searchStatusDelivery,
    searchStatusBilling,
  } = useSearch();

  const { addToast } = useToast();

  const { checkToken } = useAuth();

  // Busca na API os vendedores e técnicos cadastrados nos pedidos
  useEffect(() => {
    try {
      checkToken();
      api.get<OrderData[]>('/orders/').then((response) => {
        setSellers(
          response.data
            .map((e) => e.seller)
            .filter(
              (value, index, self) =>
                value !== null &&
                index === self.findIndex((t) => t.name === value.name)
            )
        );
        setTechnicals(
          response.data
            .map((e) => e.technical)
            .filter(
              (value, index, self) =>
                value !== null &&
                index === self.findIndex((t) => t?.name === value?.name)
            )
        );
      });
    } catch (err) {
      addToast({
        type: 'error',
        description: 'Ocorreu um erro na comunicação com o servidor',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchBarMaterialTheme = createMuiTheme({
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
      },
      MuiMenuItem: {
        root: {
          '&:hover': {
            backgroundColor: color,
            '&& svg': {
              color: '#fff',
            },
          },
          '&$selected': {
            backgroundColor: color,
            '&& svg': {
              color: '#fff',
            },
            '&:hover': {
              backgroundColor: color,
              '&& svg': {
                color: '#fff',
              },
            },
          },
        },
      },
    },
  });

  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      formControl: {
        margin: theme.spacing(1),
      },
      faCheck: {
        color: '#1b914f',
      },
      faRegClock: {
        color: '#555',
      },
      riDraftFill: {
        color: '#999',
      },
      faTimes: {
        color: '#f00',
      },
      ioThumbsDown: {
        color: '#c00000',
      },
      hiRefresh: {
        color: '#000',
      },
    })
  );

  const {
    formControl,
    faCheck,
    faRegClock,
    riDraftFill,
    faTimes,
    ioThumbsDown,
    hiRefresh,
  } = useStyles();

  return (
    <Container color={color}>
      <ThemeProvider theme={searchBarMaterialTheme}>
        {from === 'TechnicalArea' ? (
          <Date isFilled={!!approved_at}>
            <Grid container alignItems="flex-end">
              <Grid item>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    disableToolbar
                    variant="inline"
                    autoOk
                    id="date-picker-inline"
                    label="Data"
                    format="dd/MM/yyyy"
                    value={approved_at}
                    onChange={(e) => searchApprovedAt(e)}
                    KeyboardButtonProps={{
                      'aria-label': 'change date',
                    }}
                  />
                </MuiPickersUtilsProvider>
              </Grid>
              <Grid item>
                {approved_at && (
                  <IconButton
                    className="close-button"
                    onClick={() => searchApprovedAt(null)}
                  >
                    <Close />
                  </IconButton>
                )}
              </Grid>
            </Grid>
          </Date>
        ) : (
          <Date isFilled={!!created_at}>
            <Grid container alignItems="flex-end">
              <Grid item>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    disableToolbar
                    variant="inline"
                    autoOk
                    id="date-picker-inline"
                    label="Data"
                    format="dd/MM/yyyy"
                    value={created_at}
                    onChange={(e) => searchCreatedAt(e)}
                    KeyboardButtonProps={{
                      'aria-label': 'change date',
                    }}
                  />
                </MuiPickersUtilsProvider>
              </Grid>
              <Grid item>
                {created_at && (
                  <IconButton
                    className="close-button"
                    onClick={() => searchCreatedAt(null)}
                  >
                    <Close />
                  </IconButton>
                )}
              </Grid>
            </Grid>
          </Date>
        )}
        <ClientName>
          <Grid container spacing={1} alignItems="flex-end">
            <Grid item>
              <TextField
                id="input-with-icon-grid-client-name"
                label="Razão Social"
                value={client_name}
                onChange={(e) => searchClientName(e.target.value)}
              />
            </Grid>
            <Grid item>
              {client_name ? (
                <IconButton onClick={() => searchClientName('')}>
                  <Close />
                </IconButton>
              ) : (
                <Search />
              )}
            </Grid>
          </Grid>
        </ClientName>
        <Product>
          <Grid container spacing={1} alignItems="flex-end">
            <Grid item>
              <TextField
                id="input-with-icon-grid-product"
                label="Serviço"
                value={products}
                onChange={(e) => searchProducts(e.target.value)}
              />
            </Grid>
            <Grid item>
              {products ? (
                <IconButton onClick={() => searchProducts('')}>
                  <Close />
                </IconButton>
              ) : (
                <Search />
              )}
            </Grid>
          </Grid>
        </Product>
        {(from === 'Comercial' || from === 'Billing') && (
          <>
            <Professional>
              <Autocomplete
                openText=""
                clearText=""
                clearOnBlur={false}
                id="input-sellers"
                options={sellers || []}
                getOptionLabel={({ name }) => name}
                onChange={(event, selectedSeller) => {
                  searchSeller(
                    selectedSeller !== null ? selectedSeller.name : ''
                  );
                }}
                noOptionsText=""
                renderInput={(params) => (
                  <TextField {...params} label="Vendedor" value={seller} />
                )}
                renderOption={({ name }, { inputValue }) => {
                  const matches = match(name, inputValue);
                  const parts = parse(name, matches);

                  return (
                    <div>
                      {parts.map(({ highlight, text }) => (
                        <span
                          key={text}
                          style={{
                            fontWeight: highlight ? 700 : 400,
                          }}
                        >
                          {text}
                        </span>
                      ))}
                    </div>
                  );
                }}
              />
            </Professional>
            <Value>
              <Grid container spacing={1} alignItems="flex-end">
                <Grid item>
                  <TextField
                    label="Valor"
                    value={total_value}
                    onChange={(e) => searchTotalValue(e.target.value)}
                    name="formattedValue"
                    id="formatted-formattedValue-input"
                  />
                </Grid>
                <Grid item>
                  {total_value ? (
                    <IconButton onClick={() => searchTotalValue('')}>
                      <Close />
                    </IconButton>
                  ) : (
                    <Search />
                  )}
                </Grid>
              </Grid>
            </Value>
          </>
        )}
        {from === 'TechnicalArea' && (
          <>
            <Professional>
              <Autocomplete
                openText=""
                clearText=""
                clearOnBlur={false}
                id="input-technical"
                options={technicals || []}
                getOptionLabel={(e) => e?.name || ''}
                onChange={(event, selectedTechnical) => {
                  searchTechnical(selectedTechnical?.name || '');
                }}
                noOptionsText=""
                renderInput={(params) => (
                  <TextField {...params} label="Executante" value={technical} />
                )}
                renderOption={(val, { inputValue }) => {
                  const matches = match(val?.name || '', inputValue);
                  const parts = parse(val?.name || '', matches);

                  return (
                    <div>
                      {parts.map(({ highlight, text }) => (
                        <span
                          key={text}
                          style={{
                            fontWeight: highlight ? 700 : 400,
                          }}
                        >
                          {text}
                        </span>
                      ))}
                    </div>
                  );
                }}
              />
            </Professional>
            <Date isFilled={!!delivery_date}>
              <Grid container alignItems="flex-end">
                <Grid item>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                      disableToolbar
                      variant="inline"
                      autoOk
                      id="date-picker-inline"
                      label="Entrega"
                      format="dd/MM/yyyy"
                      value={delivery_date}
                      onChange={(e) => searchDeliveryDate(e)}
                      KeyboardButtonProps={{
                        'aria-label': 'change date',
                      }}
                    />
                  </MuiPickersUtilsProvider>
                </Grid>
                <Grid item>
                  {delivery_date && (
                    <IconButton
                      className="close-button"
                      onClick={() => searchDeliveryDate(null)}
                    >
                      <Close />
                    </IconButton>
                  )}
                </Grid>
              </Grid>
            </Date>
            <Status value={!!status_delivery}>
              <FormControl className={formControl}>
                <InputLabel id="demo-simple-select-label">Status</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={status_delivery}
                  onChange={(e) => {
                    searchStatusDelivery(e.target.value as string);
                  }}
                >
                  <MenuItem value="">&nbsp;</MenuItem>
                  <MenuItem
                    value="Agendado"
                    style={{ justifyContent: 'center' }}
                  >
                    <FaRegClock className={faRegClock} />
                  </MenuItem>
                  <MenuItem
                    value="Execução"
                    style={{ justifyContent: 'center' }}
                  >
                    <HiOutlineRefresh className={hiRefresh} />
                  </MenuItem>
                  <MenuItem
                    value="Concluído"
                    style={{ justifyContent: 'center' }}
                  >
                    <FaCheckCircle className={faCheck} />
                  </MenuItem>
                  <MenuItem
                    value="Cancelado"
                    style={{ justifyContent: 'center' }}
                  >
                    <FaTimes className={faTimes} />
                  </MenuItem>
                </Select>
              </FormControl>
            </Status>
          </>
        )}
        {from === 'Billing' && (
          <Status value={!!status_billing}>
            <FormControl className={formControl}>
              <InputLabel id="demo-simple-select-label">Status</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={status_billing}
                onChange={(e) => searchStatusBilling(e.target.value as string)}
              >
                <MenuItem value="">&nbsp;</MenuItem>
                <MenuItem
                  value="Aguardando"
                  style={{ justifyContent: 'center' }}
                >
                  <FaRegClock className={faRegClock} />
                </MenuItem>
                <MenuItem value="Faturado" style={{ justifyContent: 'center' }}>
                  <FaCheckCircle className={faCheck} />
                </MenuItem>
                <MenuItem
                  value="Cancelado"
                  style={{ justifyContent: 'center' }}
                >
                  <FaTimes className={faTimes} />
                </MenuItem>
              </Select>
            </FormControl>
          </Status>
        )}
        {from === 'Comercial' && (
          <Status value={!!status_order}>
            <FormControl className={formControl}>
              <InputLabel id="demo-simple-select-label">Status</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={status_order}
                onChange={(e) => searchStatusOrder(e.target.value as string)}
              >
                <MenuItem value="">&nbsp;</MenuItem>
                <MenuItem value="Rascunho" style={{ justifyContent: 'center' }}>
                  <RiDraftFill className={riDraftFill} />
                </MenuItem>
                <MenuItem
                  value="Aguardando"
                  style={{ justifyContent: 'center' }}
                >
                  <FaRegClock className={faRegClock} />
                </MenuItem>
                <MenuItem
                  value="Reprovado"
                  style={{ justifyContent: 'center' }}
                >
                  <IoMdThumbsDown className={ioThumbsDown} />
                </MenuItem>
                <MenuItem value="Aprovado" style={{ justifyContent: 'center' }}>
                  <FaCheckCircle className={faCheck} />
                </MenuItem>
                <MenuItem
                  value="Cancelado"
                  style={{ justifyContent: 'center' }}
                >
                  <FaTimes className={faTimes} />
                </MenuItem>
              </Select>
            </FormControl>
          </Status>
        )}
      </ThemeProvider>
    </Container>
  );
};

export default SearchBar;
