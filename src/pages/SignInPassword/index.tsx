import React, { useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiLock, FiArrowLeft } from 'react-icons/fi';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';

import { useToast } from '../../hooks/toast';
import { useAuth } from '../../hooks/auth';
import { getValidationErrors } from '../../utils';

import Logo from '../../assets/logo.svg';

import Input from '../../components/Input';
import Button from '../../components/Button';

import { Container, Content } from './styles';

interface SignInFormData {
  password: string;
}

const SignInPassword: React.FC = () => {
  const formRef = useRef<FormHandles>(null);

  const { addToast } = useToast();
  const { user, signInPassword, signOut } = useAuth();

  const handleSubmit = useCallback(
    async (data: SignInFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          password: Yup.string().required('Senha obrigatória'),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        await signInPassword({
          email: user.email,
          password: data.password,
        });

        addToast({
          type: 'success',
          description: 'Usuário logado com sucesso!',
        });
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);

          return;
        }

        addToast({
          type: 'error',
          description: 'Verifique as informações digitadas e tente novamente',
        });
      }
    },
    [signInPassword, user.email, addToast]
  );

  return (
    <Container>
      <Content>
        <div>
          <img src={Logo} alt="Logo Poligo" />
          <Form ref={formRef} onSubmit={handleSubmit}>
            {user && <span>{user.email}</span>}
            <Input
              name="password"
              icon={FiLock}
              autoFocus
              type="password"
              placeholder="Digite sua senha"
            />
            <a href="/">Esqueceu sua senha?</a>
            <Button>Entrar</Button>
          </Form>
        </div>
        <Link to="/" onClick={signOut}>
          <FiArrowLeft size={20} />
          Voltar
        </Link>
      </Content>
    </Container>
  );
};

export default SignInPassword;
