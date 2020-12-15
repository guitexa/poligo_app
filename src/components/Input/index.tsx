import React, {
  ComponentType,
  InputHTMLAttributes,
  useRef,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { IconBaseProps } from 'react-icons';
import { FiAlertCircle } from 'react-icons/fi';
import { useField } from '@unform/core';

import { Container, Tooltip } from './styles';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  // Recebe o name do component para ser registrado no useField
  name: string;
  // Recebe opcionalmente um ícone do tipo react-icon para ser exibido
  icon?: ComponentType<IconBaseProps>;
}

const Input: React.FC<InputProps> = ({ name, icon: Icon, ...rest }) => {
  // Armazena se o input está com focus
  const [isFocused, setIsFocused] = useState(false);
  // Armazena se o input está preenchido
  const [isFilled, setIsFilled] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const { error, fieldName, registerField } = useField(name);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      path: 'value',
    });
  }, [fieldName, registerField]);

  // Função para quando clica no input
  const handleOnFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  // Função para quando clica fora do input
  const handleOnBlur = useCallback(() => {
    setIsFocused(false);
    // Define se está preenchido se houver valor digitado
    setIsFilled(!!inputRef.current?.value);
  }, []);

  return (
    <Container isErrored={!!error} isFocused={isFocused} isFilled={isFilled}>
      {/* Se houver Icon este será renderizado desta forma */}
      {Icon && <Icon size={18} />}
      <input
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
        ref={inputRef}
        {...rest}
      />
      {/* Se houver erro no input será renderizado um tooltip de alerta */}
      {error && (
        <Tooltip title={error} placement="top">
          <FiAlertCircle size={20} />
        </Tooltip>
      )}
    </Container>
  );
};

export default Input;
