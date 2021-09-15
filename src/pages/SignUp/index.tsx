import React, { useRef, useCallback, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiArrowLeft } from 'react-icons/fi';
import { Form } from '@unform/web';
import { FormHandles } from '@unform/core';
import * as Yup from 'yup';
import { ThemeProvider, createTheme } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import { Select } from 'unform-material-ui';

import { useToast } from '../../hooks/toast';
import api from '../../services/api';
import { getValidationErrors } from '../../utils';

import Logo from '../../assets/logo.svg';

import Input from '../../components/Input';
import Button from '../../components/Button';

import { Container, Content } from './styles';
import { useAuth } from '../../hooks/auth';

interface DataForm {
  name: string;
  email: string;
  password: string;
  permissions: 'TechnicalArea' | 'Billing' | 'Comercial' | 'Admin';
}

const SignUp: React.FC = () => {
  const { push } = useHistory();

  const [permission, setPermission] = useState('');

  const formRef = useRef<FormHandles>(null);

  const { checkToken } = useAuth();

  const { addToast } = useToast();

  const signUpMaterialTheme = createTheme({
    palette: {
      primary: {
        main: '#222',
      },
    },
    overrides: {
      MuiFormControl: {
        root: {
          width: '100%',
        },
      },
      MuiMenuItem: {
        root: {
          '&:hover': {
            backgroundColor: '#222',
            color: '#fff',
          },
          '&&[aria-disabled="true"]': {
            backgroundColor: '#fff',
            color: '#aaa',
          },
          '&$selected': {
            backgroundColor: '#222',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#222',
              color: '#fff',
            },
          },
        },
      },
    },
  });

  const handleSubmit = useCallback(
    async (data: DataForm) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          name: Yup.string().required('Nome obrigatório'),
          email: Yup.string()
            .required('Email obrigatório')
            .email('Digite um e-mail válido'),
          password: Yup.string().min(6, 'Senha deve ter no mínimo 6 dígitos'),
          permissions: Yup.string().required(),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        checkToken();

        await api.post('/users', {
          name: data.name,
          email: data.email,
          password: data.password,
          permissions: data.permissions,
        });

        addToast({
          type: 'success',
          description: 'Usuário cadastrado com sucesso!',
        });

        push('/');
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);

          if (!permission) {
            addToast({
              type: 'error',
              description: 'Selecione uma permissão de acesso.',
            });
          }

          return;
        }

        addToast({
          type: 'error',
          description: 'Verifique as informações digitadas e tente novamente',
        });
      }
    },
    [addToast, checkToken, permission, push]
  );

  return (
    <Container>
      <Content isSelected={!!permission}>
        <div>
          <img src={Logo} alt="Logo Poligo" />
          <Form ref={formRef} onSubmit={handleSubmit}>
            <Input name="name" icon={FiUser} autoFocus placeholder="Nome" />
            <Input name="email" icon={FiMail} placeholder="E-mail" />
            <Input
              name="password"
              icon={FiLock}
              type="password"
              placeholder="Senha"
            />
            <ThemeProvider theme={signUpMaterialTheme}>
              <Select
                name="permissions"
                variant="outlined"
                displayEmpty
                value={permission}
                onChange={(e) => setPermission(e.target.value as string)}
              >
                <MenuItem value="" disabled>
                  Permissão de acesso
                </MenuItem>
                <MenuItem value="TechnicalArea">Área Técnica</MenuItem>
                <MenuItem value="Billing">Faturamento</MenuItem>
                <MenuItem value="Comercial">Comercial</MenuItem>
                <MenuItem value="Financial">Financeiro</MenuItem>
                <MenuItem value="Reception">Atendimento</MenuItem>
                <MenuItem value="Admin">Administrativo</MenuItem>
              </Select>
            </ThemeProvider>
            <Button>Cadastrar</Button>
          </Form>
        </div>
        <Link to="/">
          <FiArrowLeft size={20} />
          Voltar
        </Link>
      </Content>
    </Container>
  );
};

export default SignUp;
