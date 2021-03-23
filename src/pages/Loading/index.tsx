import React from 'react';
import { useHistory } from 'react-router-dom';

import { useAuth } from '../../hooks/auth';

import Logotipo from '../../assets/logotipo.svg';

import { Container } from './styles';

const Loading: React.FC = () => {
  const { push } = useHistory();
  const { user } = useAuth();

  if (user.permissions === 'Admin') {
    push('/Comercial');
  }

  if (user.permissions === 'Comercial') {
    push('/Comercial');
  }

  if (user.permissions === 'TechnicalArea') {
    push('/TechnicalArea');
  }

  if (user.permissions === 'Billing') {
    push('/Billing');
  }

  if (user.permissions === 'Financial') {
    push('/Financial');
  }

  if (user.permissions === 'Reception') {
    push('/Reception');
  }

  return (
    <Container>
      <img src={Logotipo} alt="" />
      <div id="shadow" />
    </Container>
  );
};

export default Loading;
