import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { useAuth } from '../../hooks/auth';
import { useOverlap } from '../../hooks/overlap';
import { useSearch } from '../../hooks/search';

import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import SearchResults from '../../components/SearchResults';

import { Container } from './styles';

const TechnicalArea: React.FC = () => {
  const { push } = useHistory();
  const { user, checkToken } = useAuth();
  const { orderOpen, overlapOrderOpen } = useOverlap();
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
    if (user.permissions !== 'TechnicalArea' && user.permissions !== 'Admin') {
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
  const color = '#1C8F07';

  return (
    <Container>
      <Header title="Área Técnica" color={color} />
      <SearchBar color={color} from="TechnicalArea" />
      <SearchResults color={color} from="TechnicalArea" />
    </Container>
  );
};

export default TechnicalArea;
