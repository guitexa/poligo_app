import React, { useEffect, useState } from 'react';
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
  FaCheckCircle,
  FaRegCheckCircle,
  FaRegClock,
  FaTimes,
  FaCalendarAlt,
} from 'react-icons/fa';
import { BiCalendarX } from 'react-icons/bi';
import { GoAlert } from 'react-icons/go';
import { HiOutlineRefresh } from 'react-icons/hi';
import { RiDraftFill } from 'react-icons/ri';
import { IoMdThumbsDown } from 'react-icons/io';

import api from '../../services/api';
import { useOrdersSearch } from '../../hooks/orders_search';
import { useFinancialsSearch } from '../../hooks/financials_search';
import { useAuth } from '../../hooks/auth';
import { useToast } from '../../hooks/toast';

import { IOrder, IUser, IBankAccount, IFinancial } from '../../interfaces';

import Date from './Date';
import Text from './Text';
import AutoComplete from './AutoComplete';
import Number from './Number';

import { Container, Status } from './styles';

interface SearchBarProps {
  // Recebe a cor do módulo a partir de qual módulo este component está sendo executado
  color: string;
  // A partir de qual módulo este component está sendo executado
  from: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ color, from }) => {
  // Armazena os vendedores cadastrados no banco de dados
  const [sellers, setSellers] = useState<IUser[]>([]);
  // Armazena os técnicos cadastrados no banco de dados
  const [technicals, setTechnicals] = useState<(IUser | null | undefined)[]>(
    []
  );
  // Armazena as contas bancárias cadastrados no banco de dados
  const [bankAccounts, setBankAccounts] = useState<
    (IBankAccount | null | undefined)[]
  >([]);

  const ordersSearch = useOrdersSearch();
  const financialsSearch = useFinancialsSearch();
  const { addToast } = useToast();
  const { checkToken } = useAuth();

  // Busca na API, vendedores, técnicos e contas bancárias
  useEffect(() => {
    checkToken();
    if (from === 'Comercial' || from === 'Billing') {
      api
        .get<IOrder[]>('/orders/')
        .then((response) => {
          setSellers(
            response.data
              .map((e) => e.seller)
              .filter(
                (value, index, self) =>
                  value !== null &&
                  index === self.findIndex((t) => t.name === value.name)
              )
          );
        })
        .catch(() => {
          addToast({
            type: 'error',
            description: '#0230 - Erro ao carregar informações',
          });
        });
    } else if (from === 'TechnicalArea') {
      api
        .get<IOrder[]>('/orders/')
        .then((response) => {
          setTechnicals(
            response.data
              .map((e) => e.technical)
              .filter(
                (value, index, self) =>
                  value !== null &&
                  index === self.findIndex((t) => t?.name === value?.name)
              )
          );
        })
        .catch(() => {
          addToast({
            type: 'error',
            description: '#0230 - Erro ao carregar informações',
          });
        });
    } else if (from === 'Financial') {
      api
        .get<IFinancial[]>('/financials/')
        .then((response) => {
          setBankAccounts(
            response.data
              .map((e) => e.bank_account)
              .filter(
                (value, index, self) =>
                  value !== null &&
                  index === self.findIndex((t) => t?.name === value?.name)
              )
          );
        })
        .catch(() => {
          addToast({
            type: 'error',
            description: '#0230 - Erro ao carregar informações',
          });
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchBarMaterialTheme = createTheme({
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
      faGrayCheck: {
        color: '#555',
      },
      faGreenCheck: {
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
        fontSize: '17px',
      },
      faCalendarAlt: {
        color: '#19518A',
      },
      biCalendarX: {
        color: '#c00000',
        fontSize: '17px',
      },
      ioThumbsDown: {
        color: '#c00000',
      },
      goAlert: {
        color: '#FFA602',
      },
      hiRefresh: {
        color: '#000',
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
    biCalendarX,
    faCalendarAlt,
    goAlert,
    ioThumbsDown,
    hiRefresh,
  } = useStyles();

  return (
    <>
      {/* Verifica se a origem é Comercial */}
      {from === 'Comercial' && (
        <>
          <Container color={color}>
            <ThemeProvider theme={searchBarMaterialTheme}>
              <Date
                isFilled={!!ordersSearch.created_at}
                color={color}
                label="Data"
                value={ordersSearch.created_at}
                onChange={ordersSearch.searchCreatedAt}
              />
              <Text
                color={color}
                label="Razão Social"
                value={ordersSearch.company_name}
                onChange={ordersSearch.searchCompanyName}
                flex="0.8"
              />
              <Text
                color={color}
                label="Serviço"
                value={ordersSearch.products}
                onChange={ordersSearch.searchProducts}
                flex="1"
              />
              <AutoComplete
                color={color}
                label="Vendedor"
                value={ordersSearch.seller}
                options={sellers}
                onChange={ordersSearch.searchSeller}
              />
              <Number
                color={color}
                label="Valor"
                value={ordersSearch.total_value}
                onChange={ordersSearch.searchTotalValue}
              />
              <Status value={!!ordersSearch.status_order}>
                <FormControl className={formControl}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={ordersSearch.status_order}
                    onChange={(e) =>
                      ordersSearch.searchStatusOrder(e.target.value as string)
                    }
                  >
                    <MenuItem value="">&nbsp;</MenuItem>
                    <MenuItem
                      value="Rascunho"
                      style={{ justifyContent: 'center' }}
                    >
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
                    <MenuItem
                      value="Aprovado"
                      style={{ justifyContent: 'center' }}
                    >
                      <FaCheckCircle className={faGreenCheck} />
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
            </ThemeProvider>
          </Container>
        </>
      )}
      {/* Verifica se a origem é TechnicalArea */}
      {from === 'TechnicalArea' && (
        <>
          <Container color={color}>
            <ThemeProvider theme={searchBarMaterialTheme}>
              <Date
                isFilled={!!ordersSearch.approved_at}
                color={color}
                label="Data"
                value={ordersSearch.approved_at}
                onChange={ordersSearch.searchApprovedAt}
              />
              <Text
                color={color}
                label="Razão Social"
                value={ordersSearch.company_name}
                onChange={ordersSearch.searchCompanyName}
                flex="0.8"
              />
              <Text
                color={color}
                label="Serviço"
                value={ordersSearch.products}
                onChange={ordersSearch.searchProducts}
                flex="1"
              />
              <AutoComplete
                color={color}
                label="Executante"
                value={ordersSearch.technical}
                options={technicals}
                onChange={ordersSearch.searchTechnical}
              />
              <Date
                isFilled={!!ordersSearch.delivery_date}
                color={color}
                label="Entrega"
                value={ordersSearch.delivery_date}
                onChange={ordersSearch.searchDeliveryDate}
              />
              <Status value={!!ordersSearch.status_delivery}>
                <FormControl className={formControl}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={ordersSearch.status_delivery}
                    onChange={(e) => {
                      ordersSearch.searchStatusDelivery(
                        e.target.value as string
                      );
                    }}
                  >
                    <MenuItem value="">&nbsp;</MenuItem>
                    <MenuItem
                      value="Aguardando"
                      style={{ justifyContent: 'center' }}
                    >
                      <FaRegClock className={faRegClock} />
                    </MenuItem>
                    <MenuItem
                      value="Agendado"
                      style={{ justifyContent: 'center' }}
                    >
                      <FaCalendarAlt className={faCalendarAlt} />
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
                      <FaRegCheckCircle className={faGrayCheck} />
                    </MenuItem>
                    <MenuItem
                      value="Entregue"
                      style={{ justifyContent: 'center' }}
                    >
                      <FaCheckCircle className={faGreenCheck} />
                    </MenuItem>
                    <MenuItem
                      value="Pendência"
                      style={{ justifyContent: 'center' }}
                    >
                      <GoAlert className={goAlert} />
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
            </ThemeProvider>
          </Container>
        </>
      )}
      {/* Verifica se a origem é Billing */}
      {from === 'Billing' && (
        <>
          <Container color={color}>
            <ThemeProvider theme={searchBarMaterialTheme}>
              <Date
                isFilled={!!ordersSearch.created_at}
                color={color}
                label="Data"
                value={ordersSearch.created_at}
                onChange={ordersSearch.searchCreatedAt}
              />
              <Text
                color={color}
                label="Razão Social"
                value={ordersSearch.company_name}
                onChange={ordersSearch.searchCompanyName}
                flex="0.8"
              />
              <Text
                color={color}
                label="Serviço"
                value={ordersSearch.products}
                onChange={ordersSearch.searchProducts}
                flex="1"
              />
              <AutoComplete
                color={color}
                label="Vendedor"
                value={ordersSearch.seller}
                options={sellers}
                onChange={ordersSearch.searchSeller}
              />
              <Number
                color={color}
                label="Valor"
                value={ordersSearch.total_value}
                onChange={ordersSearch.searchTotalValue}
              />
              <Status value={!!ordersSearch.status_billing}>
                <FormControl className={formControl}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={ordersSearch.status_billing}
                    onChange={(e) =>
                      ordersSearch.searchStatusBilling(e.target.value as string)
                    }
                  >
                    <MenuItem value="">&nbsp;</MenuItem>
                    <MenuItem
                      value="Aguardando"
                      style={{ justifyContent: 'center' }}
                    >
                      <FaRegClock className={faRegClock} />
                    </MenuItem>
                    <MenuItem
                      value="Faturado"
                      style={{ justifyContent: 'center' }}
                    >
                      <FaCheckCircle className={faGreenCheck} />
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
            </ThemeProvider>
          </Container>
        </>
      )}
      {/* Verifica se a origem é Financial */}
      {from === 'Financial' && (
        <>
          <Container color={color}>
            <ThemeProvider theme={searchBarMaterialTheme}>
              <Date
                isFilled={!!financialsSearch.due_date}
                color={color}
                label="Vencimento"
                value={financialsSearch.due_date}
                onChange={financialsSearch.searchDueDate}
              />
              <Date
                isFilled={!!financialsSearch.replan_date}
                color={color}
                label="Replan."
                value={financialsSearch.replan_date}
                onChange={financialsSearch.searchReplanDate}
              />
              <Number
                color={color}
                label="Bruto"
                value={financialsSearch.gross_value}
                onChange={financialsSearch.searchGrossValue}
                width="10%"
              />
              <Number
                color={color}
                label="Líquido"
                value={financialsSearch.net_value}
                onChange={financialsSearch.searchNetValue}
                width="10%"
              />
              <Date
                isFilled={!!financialsSearch.paid_date}
                color={color}
                label="Data Real."
                value={financialsSearch.paid_date}
                onChange={financialsSearch.searchPaidDate}
              />
              <Number
                color={color}
                label="Líquido Real."
                value={financialsSearch.paid_value}
                onChange={financialsSearch.searchPaidValue}
                width="10%"
              />
              <Text
                color={color}
                label="Cliente/Fornecedor"
                value={financialsSearch.company_name}
                onChange={financialsSearch.searchCompanyName}
                flex="1"
              />
              <AutoComplete
                color={color}
                label="Conta"
                value={financialsSearch.bank_account}
                options={bankAccounts}
                onChange={financialsSearch.searchBankAccount}
                width="9%"
              />
              <Status value={!!financialsSearch.status_financial}>
                <FormControl className={formControl}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={financialsSearch.status_financial}
                    onChange={(e) =>
                      financialsSearch.searchStatusFinancial(
                        e.target.value as string
                      )
                    }
                  >
                    <MenuItem value="">&nbsp;</MenuItem>
                    <MenuItem value="Hoje" style={{ justifyContent: 'center' }}>
                      <GoAlert className={goAlert} />
                    </MenuItem>
                    <MenuItem value="Pago" style={{ justifyContent: 'center' }}>
                      <FaCheckCircle className={faGreenCheck} />
                    </MenuItem>
                    <MenuItem
                      value="Vencido"
                      style={{ justifyContent: 'center' }}
                    >
                      <BiCalendarX className={biCalendarX} />
                    </MenuItem>
                    <MenuItem
                      value="Agendado"
                      style={{ justifyContent: 'center' }}
                    >
                      <FaCalendarAlt className={faCalendarAlt} />
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
            </ThemeProvider>
          </Container>
        </>
      )}
    </>
  );
};

export default SearchBar;
