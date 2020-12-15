import React, {
  InputHTMLAttributes,
  useRef,
  useEffect,
  CSSProperties,
} from 'react';
import { useField } from '@unform/core';

import { Container } from './styles';

interface InputAsTextProps extends InputHTMLAttributes<HTMLInputElement> {
  // Recebe o name do component para ser registrado no useField
  name: string;
  // Recebe opcionalmente um estilo para ser aplicado no component
  styled?: CSSProperties;
}

const InputAsText: React.FC<InputAsTextProps> = ({
  name,
  styled = {},
  ...rest
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const { error, fieldName, registerField } = useField(name);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      path: 'value',
    });
  }, [fieldName, registerField]);

  return (
    <Container isErrored={!!error} style={styled}>
      <input ref={inputRef} {...rest} />
    </Container>
  );
};

export default InputAsText;
