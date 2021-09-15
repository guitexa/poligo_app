import React, { ButtonHTMLAttributes } from 'react';
import { CSSProperties } from 'styled-components';

import { Container } from './styles';

interface DisabledButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  // Recebe opcionalmente um estilo para ser aplicado no component
  styled?: CSSProperties;
}

const DisabledButton: React.FC<DisabledButtonProps> = ({
  children,
  styled,
}) => {
  return (
    <Container className="disabled-button" style={styled}>
      {children}
    </Container>
  );
};

export default DisabledButton;
