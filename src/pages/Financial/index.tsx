import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { useAuth } from '../../hooks/auth';
// import { useOverlap } from '../../hooks/overlap';
import { useFinancialsSearch } from '../../hooks/financials_search';

import IconFinancial from '../../assets/icons/icon-financial.svg';
import IconVault from '../../assets/icons/icon-vault.svg';
import IconInvoice from '../../assets/icons/icon-invoice.svg';
import Header from '../../components/Header';
import HeaderButton from '../../components/HeaderButton';
import SearchBar from '../../components/SearchBar';
import SearchResults from '../../components/SearchResults';

import { Container } from './styles';

const Financial: React.FC = () => {
  const { push } = useHistory();
  const { user, checkToken } = useAuth();
  // const { orderOpen, overlapOrderOpen } = useOverlap();
  const {
    due_date,
    replan_date,
    gross_value,
    net_value,
    paid_date,
    paid_value,
    company_name,
    bank_account,
    status_financial,
    clearAllResults,
  } = useFinancialsSearch();

  const history = useHistory();

  // Função executada ao abrir a página
  useEffect(() => {
    // Verifica se existe um token válido
    checkToken();
    // Verifica as permissões do usuário que está tentando acessar esta página
    if (user.permissions !== 'Financial' && user.permissions !== 'Admin') {
      push('/Loading');
    }

    // Remove qualquer valor de pesquisa existente
    if (
      due_date ||
      replan_date ||
      gross_value ||
      net_value ||
      paid_date ||
      paid_value ||
      company_name ||
      bank_account ||
      status_financial
    ) {
      clearAllResults();
    }

    // Verifica se o component Order está aberto e fecha
    // if (orderOpen) {
    //   overlapOrderOpen(false);
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Define a cor tema desta página
  const color = '#851800';

  return (
    <Container>
      <Header title="Financeiro" color={color}>
        <HeaderButton
          show
          handleClick={() => history.push('/Vault')}
          type="button"
          icon={IconVault}
          color={color}
        />
        <HeaderButton
          show
          handleClick={() => history.push('/Invoice')}
          type="button"
          icon={IconInvoice}
          color={color}
        />
        <HeaderButton
          add
          show
          handleClick={() => {}} /* <-- MODAL */
          type="button"
          icon={IconFinancial}
          color={color}
        />
      </Header>
      <SearchBar color={color} from="Financial" />
      <SearchResults color={color} from="Financial" />
    </Container>
  );
};

export default Financial;
