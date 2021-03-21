import React, { ButtonHTMLAttributes } from 'react';
import { IconBaseProps } from 'react-icons';

import { FaPlus } from 'react-icons/fa';

import { Container } from './styles';

interface HeaderButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  // Recebe um ícone para ser exibido, pode ser uma string que indica que é um arquivo local ou pode ser um react-icon
  icon: string | React.ComponentType<IconBaseProps>;
  // Recebe a cor do módulo a partir de qual módulo este component está sendo executado
  color: string;
  // Recebe opcionalmente a propriedade 'add' adiciona um sinal de + no canto
  add?: boolean;
  // Controla se o component é exibido ou não
  show: boolean;
  // Indica que a página que este botão abre está aberta
  inUse?: boolean;
  // Recebe uma função para executar quando o component receber um click
  handleClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

const HeaderButton: React.FC<HeaderButtonProps> = ({
  children,
  icon,
  icon: Icon,
  color,
  add,
  show,
  inUse,
  handleClick,
  ...rest
}) => {
  return (
    <>
      {/* Controla se o component é exibido ou não */}
      {show && (
        <Container
          color={color}
          {...rest}
          onClick={inUse ? () => {} : handleClick}
          inUse={inUse}
        >
          {/* Se o icon recebido for uma imagem renderiza desta forma */}
          {typeof icon === 'string' ? (
            <img src={icon} alt="" />
          ) : (
            // Se o icon recebido for um react-icon renderiza desta forma
            <Icon size={21} />
          )}
          {/* Se receber a propriedade 'add' adiciona um sinal de + no canto */}
          {add && (
            <div>
              <FaPlus size={6} color={color} />
            </div>
          )}
          {children}
        </Container>
      )}
    </>
  );
};

export default HeaderButton;
