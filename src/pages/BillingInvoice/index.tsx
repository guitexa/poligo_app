import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { useAuth } from '../../hooks/auth';
import { useOverlap } from '../../hooks/overlap';
import { useOrdersSearch } from '../../hooks/orders_search';
import IconBilling from '../../assets/icons/icon-billing.svg';
import IconBillingInvoice from '../../assets/icons/icon-billing-invoice.svg';

import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import SearchResults from '../../components/SearchResults';
import HeaderButton from '../../components/HeaderButton';

import { Container } from './styles';

const BillingInvoice: React.FC = () => {
  const { push } = useHistory();
  const { user, checkToken } = useAuth();
  const { orderOpen, overlapOrderOpen } = useOverlap();
  const {
    approved_at,
    created_at,
    delivery_date,
    company_name,
    seller,
    products,
    status_billing,
    status_delivery,
    status_order,
    technical,
    total_value,
    clearAllResults,
  } = useOrdersSearch();

  // Função executada ao abrir a página
  useEffect(() => {
    // Verifica se existe um token válido
    checkToken();

    // Verifica as permissões do usuário que está tentando acessar esta página
    if (
      user.permissions !== 'Billing' &&
      user.permissions !== 'Financial' &&
      user.permissions !== 'Admin'
    ) {
      push('/Loading');
    }

    // Remove qualquer valor de pesquisa existente
    if (
      approved_at ||
      created_at ||
      delivery_date ||
      company_name ||
      seller ||
      products ||
      status_billing ||
      status_delivery ||
      status_order ||
      technical ||
      total_value
    ) {
      clearAllResults();
    }

    // Verifica se o component Order está aberto e fecha
    if (orderOpen) {
      overlapOrderOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Define a cor tema desta página
  const color = '#c9a100';

  return (
    <Container>
      <Header title="Faturamento Consolidado" color={color}>
        <HeaderButton
          show
          inUse
          handleClick={() => {}}
          type="button"
          icon={IconBillingInvoice}
          color={color}
          size="19px"
        />
        <HeaderButton
          show
          handleClick={() => push('/Billing')}
          type="button"
          icon={IconBilling}
          color={color}
        />
      </Header>
      <SearchBar color={color} from="BillingInvoice" />
      <SearchResults color={color} from="BillingInvoice" />
    </Container>
  );
};

export default BillingInvoice;
