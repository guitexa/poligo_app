import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { MdSettings } from 'react-icons/md';

import IconTechnicalArea from '../../assets/icons/icon-technical-area.svg';
import IconComercial from '../../assets/icons/icon-comercial.svg';
import IconBilling from '../../assets/icons/icon-billing.svg';
import IconExit from '../../assets/icons/icon-exit.svg';

import { useAuth } from '../../hooks/auth';

import { Container, Menu, Title, Cover } from './styles';

interface HeaderProps {
  // Recebe uma string para ser utilizada como título do header
  title: string;
  // Recebe a cor do módulo a partir de qual módulo este component está sendo executado
  color: string;
}

const Header: React.FC<HeaderProps> = ({ title, color, children }) => {
  const { user, signOut } = useAuth();

  // Armazena se o menu está aberto ou fechado
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  return (
    <>
      {/* Div com logotipo que ao passar o mouse abre ou fecha o menu */}
      <Menu menuIsOpen={menuIsOpen} onClick={() => setMenuIsOpen(!menuIsOpen)}>
        {/* Div com os itens do menu */}
        <div id="sub-menu">
          {(user.permissions === 'Comercial' ||
            user.permissions === 'Admin') && (
            <Link id="comercial" to="/Comercial">
              <img src={IconComercial} alt="" />
              <div>
                <p className="title">Comercial</p>
                <p className="text">Gerencie as propostas</p>
                <p className="text">enviadas, e serviços</p>
                <p className="text">vendidos</p>
              </div>
            </Link>
          )}
          {(user.permissions === 'TechnicalArea' ||
            user.permissions === 'Admin') && (
            <Link id="technical-area" to="/TechnicalArea">
              <img src={IconTechnicalArea} alt="" />
              <div>
                <p className="title">Área Técnica</p>
                <p className="text">Controle os serviços</p>
                <p className="text">pendentes e realizados</p>
                <p className="text">da área técnica.</p>
              </div>
            </Link>
          )}
          {(user.permissions === 'Billing' || user.permissions === 'Admin') && (
            <Link id="billing" to="/Billing">
              <img src={IconBilling} alt="" />
              <div>
                <p className="title">Faturamento</p>
                <p className="text">Gerencie o</p>
                <p className="text">faturamento dos</p>
                <p className="text">pedidos do comercial</p>
              </div>
            </Link>
          )}
          {user.permissions === 'Admin' && (
            <Link id="settings" to="/SignUp">
              <MdSettings size={40} color="#fff" />
              <div>
                <p className="title">Configurações</p>
                <p className="text">Configure o sistema de</p>
                <p className="text">forma que melhor atenda</p>
                <p className="text">suas necessidades</p>
              </div>
            </Link>
          )}
          <button type="button" id="exit" onClick={signOut}>
            <img src={IconExit} alt="" />
            <p className="title">Sair</p>
          </button>
        </div>
      </Menu>
      {/* Topo que abriga o menu e o título da página */}
      <Container color={color}>
        <Title>{title}</Title>
        {children}
      </Container>
      {/* Background que escurece quando o menu está aberto */}
      <Cover
        menuIsOpen={menuIsOpen}
        type="button"
        onClick={() => setMenuIsOpen(!menuIsOpen)}
      />
    </>
  );
};

export default Header;
