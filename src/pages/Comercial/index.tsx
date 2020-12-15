import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import ContractIcon from '../../assets/icons/icon-contract.svg';
import Header from '../../components/Header';
import HeaderButton from '../../components/HeaderButton';
import SearchBar from '../../components/SearchBar';
import NewOrder from '../../components/NewOrder';
import SearchResults from '../../components/SearchResults';

import { useOverlap } from '../../hooks/overlap';
import { useAuth } from '../../hooks/auth';
import { useSearch } from '../../hooks/search';

import { NewOrderOverlap, Container } from './styles';

const Comercial: React.FC = () => {
  const {
    orderOpen,
    newOrderOpen,
    overlapNewOrderOpen,
    overlapOrderOpen,
  } = useOverlap();
  const { push } = useHistory();
  const { user, checkToken } = useAuth();
  const {
    approved_at,
    created_at,
    delivery_date,
    client_name,
    seller,
    products,
    status_billing,
    status_delivery,
    status_order,
    technical,
    total_value,
    clearAllResults,
  } = useSearch();

  // Função executada ao abrir a página
  useEffect(() => {
    // Verifica se existe um token válido
    checkToken();

    // Verifica as permissões do usuário que está tentando acessar esta página
    if (user.permissions !== 'Comercial' && user.permissions !== 'Admin') {
      push('/Loading');
    }

    // Remove qualquer valor de pesquisa existente
    if (
      approved_at ||
      created_at ||
      delivery_date ||
      client_name ||
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
  const color = '#004A82';

  return (
    <>
      {newOrderOpen && (
        <NewOrderOverlap>
          <NewOrder color={color} from="Comercial" />
        </NewOrderOverlap>
      )}
      <Container>
        <Header title="Comercial" color={color}>
          <HeaderButton
            add
            show={!newOrderOpen && !orderOpen}
            handleClick={(e) => overlapNewOrderOpen(!!e)}
            type="button"
            icon={ContractIcon}
            color={color}
          />
        </Header>
        <SearchBar color={color} from="Comercial" />
        <SearchResults color={color} from="Comercial" />
      </Container>
    </>
  );
};

export default Comercial;
