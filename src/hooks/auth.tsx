import React, { createContext, useCallback, useState, useContext } from 'react';
import decode from 'jwt-decode';
import { fromUnixTime, isAfter } from 'date-fns';

import api from '../services/api';

// Interface do usuário recebido
export interface User {
  id: string;
  name: string;
  email: string;
  permissions: string;
}

// Interface do token recebido
interface TokenDecode {
  exp: number; // Data de expiração
  sub: string; // ID do usuário
}

// Interface do objeto utilizado para realizar o signInMail
interface SignInMailCredencials {
  email: string;
}

// Interface do objeto utilizado para realizar o signInPassword
interface SignInPasswordCredencials {
  email: string;
  password: string;
}

interface AuthContextData {
  user: User;
  token: string;
  signInMail(email: SignInMailCredencials): Promise<void>;
  signInPassword(credentials: SignInPasswordCredencials): Promise<void>;
  signOut(): void;
  checkToken(): void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC = ({ children }) => {
  // Armazena o usuário recebido ao fazer o signInMail
  const [user, setUser] = useState<User>({} as User);

  // Armazena o token recebido ao fazer o signInPassword
  const [token, setToken] = useState(() => {
    // Busca o token armazenado no localStorage
    const getToken = localStorage.getItem('@Poligo:token');

    // Se houver token armazenado armazena no header
    if (getToken) {
      api.defaults.headers.authorization = `Bearer ${getToken}`;

      return getToken;
    }

    return '';
  });

  // Função para realizar a primeira autenticação apenas com o e-mail
  const signInMail = useCallback(async ({ email }) => {
    // Realiza autenticação do usuário na API
    const userResponse = await api.post('/sessions-mail', {
      email,
    });

    // Armazena no estado o usuário recebido
    setUser(userResponse.data);
  }, []);

  // Função para realizar a segunda autenticação com password
  const signInPassword = useCallback(async ({ email, password }) => {
    // Realiza autenticação do usuário na API
    const userWithTokenResponse = await api.post('/sessions-password', {
      email,
      password,
    });

    // Armazena no localStorage o token recebido
    localStorage.setItem('@Poligo:token', userWithTokenResponse.data.token);

    // Armazena no header o token para ser utilizado no restante da aplicação
    api.defaults.headers.authorization = `Bearer ${userWithTokenResponse.data.token}`;

    // Armazena no estado o token recebido
    setToken(userWithTokenResponse.data.token);
  }, []);

  // Função para realizar sair da aplicação
  const signOut = useCallback(() => {
    // Remove o token do localStorage
    localStorage.removeItem('@Poligo:token');

    setToken(''); // Limpa o estado
    setUser({} as User); // Limpa o estado
  }, []);

  // Função para verificar se o token está valido
  const checkToken = useCallback(async () => {
    // Realiza a decodificação do token recebido
    const userToken = decode(token) as TokenDecode;

    // Verifica se o token está dentro da data de validade
    const checkIfTokenIsValid = isAfter(
      fromUnixTime(userToken.exp),
      new Date(Date.now())
    );

    // Se estiver fora da data de validade o usuário será deslogado
    if (!checkIfTokenIsValid) {
      signOut();
    }
    // Se o token estiver dentro da data de validade verifica se existe usuário
    else {
      // Busca na API a lista de usuários cadastrados
      const userResponse = await api.get<User[]>('/users');

      // Busca na lista de usuários o usuário correspondente a este token
      const findUser = userResponse.data.find(
        (userFound) => userFound.id === userToken.sub
      );

      // Armazena o usuário encontrado no estado
      if (findUser) {
        setUser(findUser);
      }
    }
  }, [token, signOut, setUser]);

  // Verifica se não possui o id do usuário e possui token e faz a validação do token
  if (!user.id && !!token) {
    checkToken();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        signInMail,
        signInPassword,
        signOut,
        checkToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  return context;
}
