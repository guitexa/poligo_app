import React, { useRef, useEffect, CSSProperties } from 'react';
import { useField } from '@unform/core';
import InputMask, { Props as InputProps } from 'react-input-mask';

import { Container } from './styles';

interface InputAsTextWithMaskProps extends InputProps {
  // Recebe o name do component para ser registrado no useField
  name: string;
  // Recebe opcionalmente um estilo para ser aplicado no component
  styled?: CSSProperties;
}

const InputAsTextWithMask: React.FC<InputAsTextWithMaskProps> = ({
  name,
  styled = {},
  ...rest
}) => {
  const inputRef = useRef(null);

  const { error, fieldName, registerField } = useField(name);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      path: 'value',
      setValue(ref: any, value: string) {
        ref.setInputValue(value);
      },
      clearValue(ref: any) {
        ref.setInputValue('');
      },
    });
  }, [fieldName, registerField]);

  return (
    <Container isErrored={!!error} style={styled}>
      <InputMask ref={inputRef} {...rest} />
    </Container>
  );
};

export default InputAsTextWithMask;
