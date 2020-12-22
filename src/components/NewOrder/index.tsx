import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Autocomplete, createFilterOptions } from '@material-ui/lab';
import {
  ThemeProvider,
  createMuiTheme,
  TextField as OriginalTextField, // Nome alterado pois foi utilizado o TextField do unform-material-ui também
} from '@material-ui/core';
import { TextField } from 'unform-material-ui';
import { Form } from '@unform/web';
import { FormHandles } from '@unform/core';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { FaTimes } from 'react-icons/fa';
import { FiArrowRight, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import {
  isCNPJ,
  isCPF,
  isPhone,
  formatToCapitalized,
  formatToCNPJ,
  formatToCPF,
  formatToPhone,
} from 'brazilian-values';
import isEmail from 'validator/es/lib/isEmail';
import InputMask, { Props as InputProps } from 'react-input-mask';

import { useToast } from '../../hooks/toast';
import { useAuth } from '../../hooks/auth';
import { useOverlap } from '../../hooks/overlap';

import HeaderButton from '../HeaderButton';
import Order from '../Order';
import Button from '../Button';
import DisabledButton from '../DisabledButton';

import api from '../../services/api';

import {
  OrderOverlap,
  NewOrderOverlap,
  Container,
  Content,
  AskTitle,
  WhatIsClientName,
  WhatIsClientCnpj,
  WhatIsClientCpf,
  WhatIsClientNameContact,
  WhatIsClientEmail,
  WhatIsClientMobilePhone,
  WhatIsClientPhone,
  SubmitQuestionButton,
  Footer,
  Progress,
  ButtonsControl,
  ConfirmData,
  QuestionData,
  QuestionsContainer,
  AnswersContainer,
  SubmitFormButton,
} from './styles';

// Interface do client
interface ClientData {
  id?: string;
  inputValue?: string; // Para adicionar uma empresa nova
  name: string;
  cnpj_cpf: string;
  contact_name: string;
  email?: string;
  phone?: string;
  mobile?: string;
}

// Interface do que é retornado após criar uma order
interface CreateOrderResponse {
  id: string;
  client_id: string;
  seller_id: string;
}

// Interface para referenciar os dados inseridos nos inputs
interface InputData {
  clientCnpjData: string;
  clientCpfData: string;
  clientNameContactData: string;
  clientEmailData: string;
  clientPhoneData: string;
  clientMobilePhoneData: string;
}

interface NewOrderProps {
  // Recebe a cor do módulo a partir de qual módulo este component está sendo executado
  color: string;
  // A partir de qual módulo este component está sendo executado
  from: string;
}

const NewOrder: React.FC<NewOrderProps> = ({ color, from }) => {
  // Armazena o order_id quando uma nova order é criada
  const [orderId, setOrderId] = useState<string | undefined>('');
  // Armazena os clientes cadastrados no banco de dados
  const [clients, setClients] = useState<ClientData[]>([]);
  // Armazena o nome da empresa
  const [clientName, setClientName] = useState<ClientData>({} as ClientData);
  // Armazena o CNPJ da empresa
  const [clientCnpj, setClientCnpj] = useState('');
  // Armazena o CPF da empresa
  const [clientCpf, setClientCpf] = useState('');
  // Armazena o nome do responsável pela empresa
  const [clientNameContact, setClientNameContact] = useState('');
  // Armazena o email da empresa
  const [clientEmail, setClientEmail] = useState<string>('');
  // Armazena o telefone fixo da empresa
  const [clientPhone, setClientPhone] = useState<string>('');
  // Armazena o telefone celular do responsável pela empresa
  const [clientMobilePhone, setClientMobilePhone] = useState('');

  // Armazena se o component está aberto ou não
  const [clientNameOpen, setClientNameOpen] = useState(true);
  const [clientCnpjOpen, setClientCnpjOpen] = useState(false);
  const [clientCpfOpen, setClientCpfOpen] = useState(false);
  const [clientNameContactOpen, setClientNameContactOpen] = useState(false);
  const [clientEmailOpen, setClientEmailOpen] = useState(false);
  const [clientPhoneOpen, setClientPhoneOpen] = useState(false);
  const [clientMobilePhoneOpen, setClientMobilePhoneOpen] = useState(false);
  const [confirmDataOpen, setConfirmDataOpen] = useState(false);
  const [showCreateOrderButton, setShowCreateOrderButton] = useState(false);

  // Armazena as respostas para servir como contador
  const [counterAnswers, setCounterAnswers] = useState<string[]>([]);
  // Armazena se o component <ConfirmData> já foi aberto alguma vez
  const [confirmDataHasOpened, setConfirmDataHasOpened] = useState(false);

  const { addToast } = useToast();
  const { user, checkToken } = useAuth();
  const {
    newOrderOpen,
    overlapNewOrderOpen,
    overlapOrderOpen,
    orderOpen,
  } = useOverlap();

  const clientCnpjRef = useRef<FormHandles>(null);
  const clientCpfRef = useRef<FormHandles>(null);
  const clientNameContactRef = useRef<FormHandles>(null);
  const clientEmailRef = useRef<FormHandles>(null);
  const clientPhoneRef = useRef<FormHandles>(null);
  const clientMobilePhoneRef = useRef<FormHandles>(null);

  const newOrderMaterialTheme = createMuiTheme({
    palette: {
      primary: {
        main: color,
      },
    },
    overrides: {
      MuiAutocomplete: {
        option: {
          '&:hover': {
            backgroundColor: color,
            color: '#fff',
          },
          '&[data-focus="true"]': {
            backgroundColor: color,
            color: '#fff',
            '&:hover': {
              backgroundColor: color,
              color: '#fff',
            },
          },
          '&[aria-selected="true"]': {
            backgroundColor: color,
            color: '#fff',
            '&:hover': {
              backgroundColor: color,
              color: '#fff',
            },
          },
        },
      },
    },
  });

  // Realiza um filtro ao pesquisar pelo nome da empresa
  const filter = createFilterOptions<ClientData>();

  // Busca na API os clientes cadastrados e armazena no estado clients
  useEffect(() => {
    try {
      checkToken();
      api.get<ClientData[]>('/clients').then((response) => {
        setClients(response.data);
      });
    } catch (err) {
      addToast({
        type: 'error',
        description: 'Ocorreu um erro na comunicação com o servidor',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Função para atrasar a exibição do botão de criar pedido
  // O objetivo é fazer com que o usuário realmente confirme os dados antes
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (confirmDataOpen) {
      const timer = setTimeout(() => {
        setShowCreateOrderButton(true);
      }, 3000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [confirmDataOpen]);

  // Função que fecha todos os components e abre a tela de confirmação de dados
  const handleShowData = useCallback(() => {
    setClientNameOpen(false);
    setClientCnpjOpen(false);
    setClientCpfOpen(false);
    setClientNameContactOpen(false);
    setClientEmailOpen(false);
    setClientPhoneOpen(false);
    setClientMobilePhoneOpen(false);
    setConfirmDataOpen(true); // Tela de confirmação de dados
  }, []);

  // Função para lidar com o nome da empresa
  const handleSubmitClientName = useCallback(() => {
    // Verifica se existe o valor recebido pela função
    if (clientName.name) {
      setClientNameOpen(!clientNameOpen); // Fecha o component que está aberto

      // Verifica se já existe CPF digitado
      if (clientCpf && counterAnswers.includes('clientCpf')) {
        // Se existe um CPF já preenchido então abre o CPF
        setClientCpfOpen(!clientCpfOpen); // Abre o próximo component
      } else {
        // Se existe não um CPF preenchido abre o próximo que é o CNPJ
        setClientCnpjOpen(!clientCnpjOpen); // Abre o próximo component
      }

      if (!counterAnswers.find((e) => e === 'clientName')) {
        // Se essa questão já não tiver sido respondida ainda, armazena no estado que agora ela está respondida
        setCounterAnswers((state) => [...state, 'clientName']);
      }
    }

    if (
      confirmDataHasOpened &&
      counterAnswers.includes('clientNameContact') &&
      counterAnswers.includes('clientEmail') &&
      (counterAnswers.includes('clientPhone') ||
        counterAnswers.includes('clientMobilePhone'))
    ) {
      // Se o confirmData já foi aberto e o restante já foi respondido, abre a tela de confirmação
      handleShowData();
    }
  }, [
    clientName.name,
    confirmDataHasOpened,
    counterAnswers,
    clientNameOpen,
    clientCpf,
    clientCpfOpen,
    clientCnpjOpen,
    handleShowData,
  ]);

  // Função para lidar com o CNPJ da empresa
  const handleSubmitClientCnpj = useCallback(
    ({ clientCnpjData }: InputData) => {
      // Verifica se existe o valor recebido pela função
      if (clientCnpjData) {
        // Verifica se o CNPJ é válido
        if (isCNPJ(clientCnpjData)) {
          clientCnpjRef.current?.setErrors({}); // Remove os erros do campo
          setClientCnpjOpen(!clientCnpjOpen); // Fecha o component que está aberto
          setClientNameContactOpen(!clientNameContactOpen); // Abre o próximo component

          setClientCnpj(clientCnpjData); // Armazena o valor recebido no estado

          if (!counterAnswers.find((e) => e === 'clientCnpj')) {
            // Se essa questão já não tiver sido respondida ainda, armazena no estado que agora ela está respondida
            setCounterAnswers((state) => [...state, 'clientCnpj']);
          }

          if (
            confirmDataHasOpened &&
            counterAnswers.includes('clientName') &&
            counterAnswers.includes('clientNameContact') &&
            counterAnswers.includes('clientEmail') &&
            (counterAnswers.includes('clientPhone') ||
              counterAnswers.includes('clientMobilePhone'))
          ) {
            // Se o confirmData já foi aberto e o restante já foi respondido, abre a tela de confirmação
            handleShowData();
          }
        } else {
          // Se o CNPJ não é válido, então define um erro para o campo
          clientCnpjRef.current?.setErrors({
            clientCnpjData: 'CNPJ inválido',
          });
        }
      }
      // Se o usuário não informar um CNPJ ele será questionado para inserir um CPF
      else {
        setClientCnpjOpen(!clientCnpjOpen); // Fecha o component que está aberto
        setClientCpfOpen(!clientCpfOpen); // Fecha o component que está aberto

        setClientCnpj(''); // Limpa o estado

        clientCnpjRef.current?.setErrors({}); // Remove os erros do campo

        // Remove esse item na contagem de respostas
        setCounterAnswers((state) => state.filter((e) => e !== 'clientCnpj'));
      }
    },
    [
      clientCnpjOpen,
      clientCpfOpen,
      clientNameContactOpen,
      confirmDataHasOpened,
      counterAnswers,
      handleShowData,
    ]
  );

  // Função para lidar com o CPF da empresa
  const handleSubmitClientCpf = useCallback(
    ({ clientCpfData }: InputData) => {
      // Verifica se existe o valor recebido pela função
      if (clientCpfData) {
        // Verifica se o CPF é válido
        if (isCPF(clientCpfData)) {
          clientCpfRef.current?.setErrors({}); // Remove os erros do campo
          setClientCpfOpen(!clientCpfOpen); // Fecha o component que está aberto
          setClientNameContactOpen(!clientNameContactOpen); // Abre o próximo component

          setClientCpf(clientCpfData); // Armazena o valor recebido no estado

          if (!counterAnswers.find((e) => e === 'clientCpf')) {
            // Se essa questão já não tiver sido respondida ainda, armazena no estado que agora ela está respondida
            setCounterAnswers((state) => [...state, 'clientCpf']);
          }

          if (
            confirmDataHasOpened &&
            counterAnswers.includes('clientName') &&
            counterAnswers.includes('clientNameContact') &&
            counterAnswers.includes('clientEmail') &&
            (counterAnswers.includes('clientPhone') ||
              counterAnswers.includes('clientMobilePhone'))
          ) {
            // Se o confirmData já foi aberto e o restante já foi respondido, abre a tela de confirmação
            handleShowData();
          }
        }
        // Se o CPF não é válido, então define um erro para o campo
        else {
          clientCpfRef.current?.setErrors({
            clientCpfData: 'CPF inválido',
          });
        }
      }
      // Se o usuário não informar um CPF, pode continuar
      else {
        setClientCpfOpen(!clientCpfOpen); // Fecha o component que está aberto
        setClientNameContactOpen(!clientNameContactOpen); // Abre o próximo component

        setClientCpf(''); // Limpa o estado

        clientCpfRef.current?.setErrors({}); // Remove os erros do campo

        // Remove esse item na contagem de respostas
        setCounterAnswers((state) => state.filter((e) => e !== 'clientCpf'));
      }
    },
    [
      clientCpfOpen,
      clientNameContactOpen,
      confirmDataHasOpened,
      counterAnswers,
      handleShowData,
    ]
  );

  // Função para lidar com o nome do responsável pela empresa
  const handleSubmitClientNameContact = useCallback(
    ({ clientNameContactData }: InputData) => {
      // Verifica se existe o valor recebido pela função
      if (clientNameContactData) {
        clientNameContactRef.current?.setErrors({}); // Remove os erros do campo
        setClientNameContactOpen(!clientNameContactOpen); // Fecha o component que está aberto
        setClientEmailOpen(!clientEmailOpen); // Abre o próximo component

        // Armazena o valor recebido no estado
        setClientNameContact(
          // Formata o valor recebido ao armazenar no estado
          formatToCapitalized(clientNameContactData, {
            trimTrailingWhiteSpaces: false,
          })
        );

        if (!counterAnswers.find((e) => e === 'clientNameContact')) {
          // Se essa questão já não tiver sido respondida ainda, armazena no estado que agora ela está respondida
          setCounterAnswers((state) => [...state, 'clientNameContact']);
        }

        if (
          confirmDataHasOpened &&
          counterAnswers.includes('clientName') &&
          counterAnswers.includes('clientEmail') &&
          (counterAnswers.includes('clientPhone') ||
            counterAnswers.includes('clientMobilePhone'))
        ) {
          // Se o confirmData já foi aberto e o restante já foi respondido, abre a tela de confirmação
          handleShowData();
        }
      }
      // Se o usuário não informar um nome de responsável, então define um erro para o campo
      else {
        clientNameContactRef.current?.setErrors({
          clientNameContactData: 'Favor preencher um nome',
        });
      }
    },
    [
      clientNameContactOpen,
      clientEmailOpen,
      counterAnswers,
      confirmDataHasOpened,
      handleShowData,
    ]
  );

  // Função para lidar com o email da empresa
  const handleSubmitClientEmail = useCallback(
    ({ clientEmailData }: InputData) => {
      // Verifica se existe o valor recebido pela função
      if (clientEmailData) {
        // Verifica se o email é válido
        if (isEmail(clientEmailData.toLocaleLowerCase())) {
          clientEmailRef.current?.setErrors({}); // Remove os erros do campo
          setClientEmailOpen(!clientEmailOpen); // Fecha o component que está aberto
          setClientPhoneOpen(!clientPhoneOpen); // Abre o próximo component

          setClientEmail(clientEmailData.toLocaleLowerCase()); // Armazena o valor recebido no estado

          if (!counterAnswers.find((e) => e === 'clientEmail')) {
            // Se essa questão já não tiver sido respondida ainda, armazena no estado que agora ela está respondida
            setCounterAnswers((state) => [...state, 'clientEmail']);
          }

          if (
            confirmDataHasOpened &&
            counterAnswers.includes('clientName') &&
            counterAnswers.includes('clientNameContact') &&
            (counterAnswers.includes('clientPhone') ||
              counterAnswers.includes('clientMobilePhone'))
          ) {
            // Se o confirmData já foi aberto e o restante já foi respondido, abre a tela de confirmação
            handleShowData();
          }
        }
        // Se o email não é válido, então define um erro para o campo
        else {
          clientEmailRef.current?.setErrors({
            clientEmailData: 'Favor preencher um e-mail válido',
          });
        }
      }
      // Se o usuário não informar um email, então define um erro para o campo
      else {
        clientEmailRef.current?.setErrors({
          clientEmailData: 'Favor preencher um e-mail',
        });
      }
    },
    [
      clientEmailOpen,
      clientPhoneOpen,
      counterAnswers,
      confirmDataHasOpened,
      handleShowData,
    ]
  );

  // Função para lidar com o telefone fixo da empresa
  const handleSubmitClientPhone = useCallback(
    ({ clientPhoneData }: InputData) => {
      // Verifica se existe o length do valor recebido pela função é > 1
      // Essa validação é necessária devido ao parentese que existe no primeiro caractere da máscara
      if (clientPhoneData.length > 1) {
        if (isPhone(clientPhoneData)) {
          // Verifica se o telefone é válido
          clientPhoneRef.current?.setErrors({}); // Remove os erros do campo
          setClientPhoneOpen(!clientPhoneOpen); // Fecha o component que está aberto
          setClientMobilePhoneOpen(!clientMobilePhoneOpen); // Abre o próximo component

          setClientPhone(clientPhoneData); // Armazena o valor recebido no estado

          if (!counterAnswers.find((e) => e === 'clientPhone')) {
            // Se essa questão já não tiver sido respondida ainda, armazena no estado que agora ela está respondida
            setCounterAnswers((state) => [...state, 'clientPhone']);
          }

          if (
            confirmDataHasOpened &&
            counterAnswers.includes('clientName') &&
            counterAnswers.includes('clientNameContact') &&
            counterAnswers.includes('clientEmail')
          ) {
            // Se o confirmData já foi aberto e o restante já foi respondido, abre a tela de confirmação
            handleShowData();
          }
        }
        // Se o telefone não é válido, então define um erro para o campo
        else {
          clientPhoneRef.current?.setErrors({
            clientPhoneData: 'Favor preencher um telefone fixo válido',
          });
        }
      }
      // Se o usuário não informar um telefone fixo, verifica se ele já informou um telefone celular
      else if (clientMobilePhone) {
        // Se um telefone celular já foi informado pode continuar
        setClientPhone(''); // Limpa o estado
        // Remove esse item na contagem de respostas
        setCounterAnswers((state) => state.filter((e) => e !== 'clientPhone'));

        clientPhoneRef.current?.setErrors({}); // Remove os erros do campo
        setClientPhoneOpen(!clientPhoneOpen); // Fecha o component que está aberto
        setClientMobilePhoneOpen(!clientMobilePhoneOpen); // Abre o próximo component

        if (
          confirmDataHasOpened &&
          counterAnswers.includes('clientName') &&
          counterAnswers.includes('clientNameContact') &&
          counterAnswers.includes('clientEmail')
        ) {
          // Se o confirmData já foi aberto e o restante já foi respondido, abre a tela de confirmação
          handleShowData();
        }
      }
      // Se não possui telefone fixo nem celular, o usuário será questionado para inserir um telefone celular
      else {
        setClientPhoneOpen(!clientPhoneOpen); // Fecha o component que está aberto
        setClientMobilePhoneOpen(!clientMobilePhoneOpen); // Abre o próximo component

        setClientPhone(''); // Limpa o estado
        // Remove esse item na contagem de respostas
        setCounterAnswers((state) => state.filter((e) => e !== 'clientPhone'));
      }
    },
    [
      clientMobilePhone,
      clientPhoneOpen,
      clientMobilePhoneOpen,
      counterAnswers,
      confirmDataHasOpened,
      handleShowData,
    ]
  );

  // Função para lidar com o telefone celular do responsável pela empresa
  const handleSubmitClientMobilePhone = useCallback(
    ({ clientMobilePhoneData }: InputData) => {
      // Verifica se existe o length do valor recebido pela função é > 1
      // Essa validação é necessária devido ao parentese que existe no primeiro caractere da máscara
      if (clientMobilePhoneData.length > 1) {
        if (isPhone(clientMobilePhoneData)) {
          // Verifica se o telefone é válido
          clientMobilePhoneRef.current?.setErrors({}); // Remove os erros do campo
          setClientMobilePhoneOpen(!clientMobilePhoneOpen); // Fecha o component que está aberto
          setConfirmDataOpen(!confirmDataOpen); // Abre o próximo component

          setConfirmDataHasOpened(true); // Define que o component confirmData foi aberto uma vez

          setClientMobilePhone(clientMobilePhoneData); // Armazena o valor recebido no estado

          if (!counterAnswers.find((e) => e === 'clientMobilePhone')) {
            // Se essa questão já não tiver sido respondida ainda, armazena no estado que agora ela está respondida
            setCounterAnswers((state) => [...state, 'clientMobilePhone']);
          }

          if (
            confirmDataHasOpened &&
            counterAnswers.includes('clientName') &&
            counterAnswers.includes('clientNameContact') &&
            counterAnswers.includes('clientEmail')
          ) {
            // Se o confirmData já foi aberto e o restante já foi respondido, abre a tela de confirmação
            handleShowData();
          }
        }
        // Se o telefone não é válido, então define um erro para o campo
        else {
          clientMobilePhoneRef.current?.setErrors({
            clientMobilePhoneData: 'Favor preencher um telefone celular válido',
          });
        }
      }
      // Se o usuário não informar um telefone celular, verifica se ele já informou um telefone fixo
      else if (clientPhone) {
        // Se um telefone fixo já foi informado pode continuar
        setClientMobilePhone(''); // Limpa o estado
        // Remove esse item na contagem de respostas
        setCounterAnswers((state) =>
          state.filter((e) => e !== 'clientMobilePhone')
        );

        clientMobilePhoneRef.current?.setErrors({}); // Remove os erros do campo
        setClientMobilePhoneOpen(!clientMobilePhoneOpen); // Fecha o component que está aberto
        setConfirmDataOpen(!confirmDataOpen); // Abre o próximo component

        setConfirmDataHasOpened(true); // Define que o component confirmData foi aberto uma vez

        if (
          confirmDataHasOpened &&
          counterAnswers.includes('clientName') &&
          counterAnswers.includes('clientNameContact') &&
          counterAnswers.includes('clientEmail')
        ) {
          // Se o confirmData já foi aberto e o restante já foi respondido, abre a tela de confirmação
          handleShowData();
        }
      }
      // Se não possui telefone fixo nem celular, então define um erro para o campo
      // Ou ele informa um telefone celular ou volta e informa um telefone fixo
      else {
        clientMobilePhoneRef.current?.setErrors({
          clientMobilePhoneData:
            'Favor preencher um telefone celular. Ou volte e informe um telefone fixo.',
        });
        setClientMobilePhone(''); // Limpa o estado
        // Remove esse item na contagem de respostas
        setCounterAnswers((state) =>
          state.filter((e) => e !== 'clientMobilePhone')
        );
      }
    },
    [
      clientPhone,
      clientMobilePhoneOpen,
      confirmDataOpen,
      counterAnswers,
      confirmDataHasOpened,
      handleShowData,
    ]
  );

  // Função que preenche o formulário quando seleciona uma empresa existente
  const handleFinishForm = useCallback(
    (selectedClientName: ClientData) => {
      // Limpa todo preenchimento existente
      setClientName({} as ClientData);
      setClientCnpj('');
      setClientCpf('');
      setClientNameContact('');
      setClientEmail('');
      setClientPhone('');
      setClientMobilePhone('');
      setCounterAnswers([]);

      setClientName(selectedClientName); // Armazena o valor recebido no estado

      // Armazena no estado que agora está questão está respondida
      setCounterAnswers((state) => [...state, 'clientName']);

      // Procura este client no array de clients cadastrados
      const findClient = clients.find(
        (client) => client.name === selectedClientName.name
      );

      if (findClient) {
        // Se o client existir, então procura o restante das informações
        // Verifica que se o client possui CNPJ ou CPF
        if (findClient.cnpj_cpf.length > 11) {
          setClientCnpj(formatToCNPJ(findClient.cnpj_cpf)); // Armazena o valor encontrado
          // Armazena no estado que agora está questão está respondida
          setCounterAnswers((state) => [...state, 'clientCnpj']);
        } else if (findClient.cnpj_cpf.length > 0) {
          setClientCpf(formatToCPF(findClient.cnpj_cpf)); // Armazena o valor encontrado
          // Armazena no estado que agora está questão está respondida
          setCounterAnswers((state) => [...state, 'clientCpf']);
        }

        // Verifica se o client possui nome de responsável
        if (findClient.contact_name) {
          setClientNameContact(findClient.contact_name); // Armazena o valor encontrado
          // Armazena no estado que agora está questão está respondida
          setCounterAnswers((state) => [...state, 'clientNameContact']);
        }

        // Verifica se o client possui email
        if (findClient.email) {
          setClientEmail(findClient.email); // Armazena o valor encontrado
          // Armazena no estado que agora está questão está respondida
          setCounterAnswers((state) => [...state, 'clientEmail']);
        }

        // Verifica se o client possui telefone fixo
        if (findClient.phone) {
          setClientPhone(formatToPhone(findClient.phone)); // Armazena o valor encontrado
          // Armazena no estado que agora está questão está respondida
          setCounterAnswers((state) => [...state, 'clientPhone']);
        }

        // Verifica se o client possui telefone celular
        if (findClient.mobile) {
          setClientMobilePhone(formatToPhone(findClient.mobile)); // Armazena o valor encontrado
          // Armazena no estado que agora está questão está respondida
          setCounterAnswers((state) => [...state, 'clientMobilePhone']);
        }

        handleShowData(); // Abre a tela de confirmação

        setConfirmDataHasOpened(true); // Define que o component confirmData foi aberto uma vez
      }
    },
    [clients, handleShowData]
  );

  // Função que envia o formulário para ser cadastrado na API
  const handleSubmitForm = useCallback(async () => {
    try {
      // Remove os caracteres especiais das variáveis para salvar no banco
      const formattedClientCnpj = clientCnpj.replace(/[^\w\s]/gi, '');
      const formattedClientCpf = clientCpf.replace(/[^\w\s]/gi, '');
      const formattedClientPhone = clientPhone.replace(/[^\w]/gi, '');
      const formattedClientMobilePhone = clientMobilePhone.replace(
        /[^\w]/gi,
        ''
      );

      // Verifica no array de clients cadastrados se existe um client com o mesmo nome
      const findClient = clients.find(
        (client) => client.name === clientName.name
      );

      if (!findClient) {
        // Se o client não existe ele será cadastrado
        const client = await api.post<ClientData>('/clients', {
          name: clientName.name,
          cnpj_cpf:
            (clientCnpj && formattedClientCnpj) ||
            (clientCpf && formattedClientCpf),
          contact_name: clientNameContact,
          email: clientEmail,
          phone: formattedClientPhone,
          mobile: formattedClientMobilePhone,
        });

        // Após o cadastro do novo client, cria uma nova order
        const order = await api.post<CreateOrderResponse>('/orders', {
          client_id: client.data.id,
          seller_id: user.id,
        });

        setOrderId(order.data.id); // Armazena a order_id recém criada
      } else {
        // Se o client existe ele será atualizado
        await api.patch<ClientData>(`/clients/${findClient.id}`, {
          cnpj_cpf:
            (clientCnpj && formattedClientCnpj) ||
            (clientCpf && formattedClientCpf),
          contact_name: clientNameContact,
          email: clientEmail,
          phone: formattedClientPhone,
          mobile: formattedClientMobilePhone,
        });

        // Após atualizar o cadastro do client, cria uma nova order
        const order = await api.post<CreateOrderResponse>('/orders', {
          client_id: findClient.id,
          seller_id: user.id,
        });

        setOrderId(order.data.id); // Armazena a order_id recém criada
      }

      addToast({
        type: 'success',
        description: 'Pedido criado com sucesso!',
      });
      setConfirmDataOpen(false); // Fecha o component de confirmação
      overlapOrderOpen(true); // Abre a order criada
    } catch (err) {
      addToast({
        type: 'error',
        description: 'Ocorreu um erro ao criar o pedido',
      });
    }
  }, [
    addToast,
    clientCnpj,
    clientCpf,
    clientEmail,
    clientMobilePhone,
    clientName.name,
    clientNameContact,
    clientPhone,
    clients,
    overlapOrderOpen,
    user.id,
  ]);

  // Função para transitar entre as questões com PageUp
  const handleChangeToPreviousQuestion = useCallback(() => {
    if (
      clientNameOpen &&
      clientName.name &&
      clientNameContact &&
      clientEmail &&
      (clientPhone || clientMobilePhone)
    ) {
      setClientNameOpen(!clientNameOpen); // Fecha o component que está aberto
      setConfirmDataOpen(!confirmDataOpen); // Abre o component anterior
    }
    if (clientCnpjOpen) {
      setClientCnpjOpen(!clientCnpjOpen); // Fecha o component que está aberto
      setClientNameOpen(!clientNameOpen); // Abre o component anterior
    }
    if (clientCpfOpen && !clientCpf) {
      setClientCpfOpen(!clientCpfOpen); // Fecha o component que está aberto
      setClientCnpjOpen(!clientCnpjOpen); // Abre o component anterior
    }
    if (clientCpfOpen && clientCpf) {
      setClientCpfOpen(!clientCpfOpen); // Fecha o component que está aberto
      setClientNameOpen(!clientNameOpen); // Abre o component anterior
    }
    if (clientNameContactOpen && !clientCnpj && !clientCpf) {
      setClientNameContactOpen(!clientNameContactOpen); // Fecha o component que está aberto
      setClientCnpjOpen(!clientCnpjOpen); // Abre o component anterior
    }
    if (clientNameContactOpen && clientCnpj) {
      setClientNameContactOpen(!clientNameContactOpen); // Fecha o component que está aberto
      setClientCnpjOpen(!clientCnpjOpen); // Abre o component anterior
    }
    if (clientNameContactOpen && clientCpf) {
      setClientNameContactOpen(!clientNameContactOpen); // Fecha o component que está aberto
      setClientCpfOpen(!clientCpfOpen); // Abre o component anterior
    }
    if (clientEmailOpen) {
      setClientEmailOpen(!clientEmailOpen); // Fecha o component que está aberto
      setClientNameContactOpen(!clientNameContactOpen); // Abre o component anterior
    }
    if (clientPhoneOpen) {
      setClientPhoneOpen(!clientPhoneOpen); // Fecha o component que está aberto
      setClientEmailOpen(!clientEmailOpen); // Abre o component anterior
    }
    if (clientMobilePhoneOpen) {
      setClientMobilePhoneOpen(!clientMobilePhoneOpen); // Fecha o component que está aberto
      setClientPhoneOpen(!clientPhoneOpen); // Abre o component anterior
    }
    if (confirmDataOpen) {
      setConfirmDataOpen(!confirmDataOpen); // Fecha o component que está aberto
      setClientMobilePhoneOpen(!clientMobilePhoneOpen); // Abre o component anterior
    }
  }, [
    clientNameOpen,
    clientName.name,
    clientCnpj,
    clientCpf,
    clientNameContact,
    clientEmail,
    clientPhone,
    clientMobilePhone,
    clientCnpjOpen,
    clientCpfOpen,
    clientNameContactOpen,
    clientEmailOpen,
    clientPhoneOpen,
    clientMobilePhoneOpen,
    confirmDataOpen,
  ]);

  // Função para transitar entre as questões com PageDown
  const handleChangeToNextQuestion = useCallback(() => {
    if (clientNameOpen && clientName.name && clientCnpj) {
      setClientNameOpen(!clientNameOpen); // Fecha o component que está aberto
      setClientCnpjOpen(!clientCnpjOpen); // Abre o próximo component
    }
    if (clientNameOpen && clientName.name && clientCpf) {
      setClientNameOpen(!clientNameOpen); // Fecha o component que está aberto
      setClientCpfOpen(!clientCpfOpen); // Abre o próximo component
    }
    if (
      clientNameOpen &&
      clientName.name &&
      !clientCpf &&
      !clientCnpj &&
      clientNameContact
    ) {
      setClientNameOpen(!clientNameOpen); // Fecha o component que está aberto
      setClientNameContactOpen(!clientNameContactOpen); // Abre o próximo component
    }
    if (clientCnpjOpen && !clientCnpj) {
      setClientCnpjOpen(!clientCnpjOpen); // Fecha o component que está aberto
      setClientCpfOpen(!clientCpfOpen); // Abre o próximo component
    }
    if (clientCnpjOpen && clientCnpj) {
      setClientCnpjOpen(!clientCnpjOpen); // Fecha o component que está aberto
      setClientNameContactOpen(!clientNameContactOpen); // Abre o próximo component
    }
    if (clientCpfOpen && clientCpf) {
      setClientCpfOpen(!clientCpfOpen); // Fecha o component que está aberto
      setClientNameContactOpen(!clientNameContactOpen); // Abre o próximo component
    }
    if (clientNameContactOpen && clientNameContact) {
      setClientNameContactOpen(!clientNameContactOpen); // Fecha o component que está aberto
      setClientEmailOpen(!clientEmailOpen); // Abre o próximo component
    }
    if (clientEmailOpen && clientEmail) {
      setClientEmailOpen(!clientEmailOpen); // Fecha o component que está aberto
      setClientPhoneOpen(!clientPhoneOpen); // Abre o próximo component
    }
    if (clientPhoneOpen && clientMobilePhone) {
      setClientPhoneOpen(!clientPhoneOpen); // Fecha o component que está aberto
      setClientMobilePhoneOpen(!clientMobilePhoneOpen); // Abre o próximo component
    }
    if (clientPhoneOpen && !clientMobilePhone) {
      setClientPhoneOpen(!clientPhoneOpen); // Fecha o component que está aberto
      setConfirmDataOpen(!confirmDataOpen); // Abre o próximo component
    }
    if (clientMobilePhoneOpen && (clientMobilePhone || clientPhoneOpen)) {
      setClientMobilePhoneOpen(!clientMobilePhoneOpen); // Fecha o component que está aberto
      setConfirmDataOpen(!confirmDataOpen); // Abre o próximo component
    }
    if (confirmDataOpen) {
      setConfirmDataOpen(!confirmDataOpen); // Fecha o component que está aberto
      setClientNameOpen(!clientNameOpen); // Abre o próximo component
    }
  }, [
    clientNameOpen,
    clientName.name,
    clientCnpjOpen,
    clientCpfOpen,
    clientCpf,
    clientCnpj,
    clientNameContactOpen,
    clientNameContact,
    clientEmailOpen,
    clientEmail,
    clientPhoneOpen,
    clientMobilePhoneOpen,
    clientMobilePhone,
    confirmDataOpen,
  ]);

  // Função para monitorar os eventos do teclado
  document.onkeydown = useCallback(
    (event: KeyboardEvent): void => {
      if (event.key === 'PageUp') {
        handleChangeToPreviousQuestion();
      }
      if (event.key === 'PageDown') {
        handleChangeToNextQuestion();
      }
      if (event.key === 'Enter' && confirmDataOpen && showCreateOrderButton) {
        addToast({
          type: 'info',
          description: 'Para confirmar clique no botão criar pedido',
        });
      }
    },
    [
      addToast,
      confirmDataOpen,
      handleChangeToNextQuestion,
      handleChangeToPreviousQuestion,
      showCreateOrderButton,
    ]
  );

  // Função para criar máscara no input
  const InputWithCNPJMask = useCallback((props: InputProps): JSX.Element => {
    return (
      <InputMask
        {...props}
        mask="99.999.999/9999-99"
        maskChar={null}
        style={{ border: 'none' }}
      />
    );
  }, []);

  // Função para criar máscara no input
  const InputWithCPFMask = useCallback((props: InputProps): JSX.Element => {
    return (
      <InputMask
        {...props}
        mask="999.999.999-99"
        maskChar={null}
        style={{ border: 'none' }}
      />
    );
  }, []);

  // Função para criar máscara no input
  const InputWithPhoneMask = useCallback((props: InputProps): JSX.Element => {
    return (
      <InputMask
        {...props}
        mask="(99) 9999-9999"
        maskChar={null}
        style={{ border: 'none' }}
      />
    );
  }, []);

  // Função para criar máscara no input
  const InputWithMobilePhoneMask = useCallback(
    (props: InputProps): JSX.Element => {
      return (
        <InputMask
          {...props}
          mask="(99) 9 9999-9999"
          maskChar={null}
          style={{ border: 'none' }}
        />
      );
    },
    []
  );

  return (
    <>
      {orderOpen && orderId && (
        <OrderOverlap>
          <Order color={color} order_id={orderId} from={from} />
        </OrderOverlap>
      )}
      <NewOrderOverlap>
        <HeaderButton
          show={newOrderOpen && !orderOpen}
          handleClick={(e) => overlapNewOrderOpen(!e)}
          type="button"
          icon={FaTimes}
          color={color}
        />
        <ThemeProvider theme={newOrderMaterialTheme}>
          <Container>
            <Content color={color}>
              {clientNameOpen && clients && (
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="individual-form"
                >
                  <WhatIsClientName clientNameOpen={clientNameOpen}>
                    <AskTitle>
                      <div>
                        <span>1</span>
                        <FiArrowRight />
                      </div>
                      <div>
                        Qual a <strong>razão social</strong> do cliente?
                      </div>
                    </AskTitle>
                    <Autocomplete
                      openText=""
                      clearText=""
                      clearOnBlur={false}
                      handleHomeEndKeys={false}
                      value={clientName}
                      onChange={(event, newClientName) => {
                        if (newClientName?.inputValue) {
                          // Adiciona uma empresa nova
                          setClientName({
                            ...newClientName,
                            name: newClientName.inputValue,
                          });
                        } else if (newClientName) {
                          // Seleciona um existente e encerra o formulário
                          handleFinishForm(newClientName);
                        }
                        if (!newClientName) {
                          // Limpou o input
                          setClientName({} as ClientData);
                          setCounterAnswers((state) =>
                            state.filter((e) => e !== 'clientName')
                          );
                        }
                      }}
                      filterOptions={(options, params) => {
                        const filtered = filter(
                          options,
                          params
                        ) as ClientData[];

                        if (params.inputValue !== '') {
                          filtered.push({
                            inputValue: params.inputValue,
                            name: `Adicionar ${params.inputValue}`,
                            cnpj_cpf: '',
                            contact_name: '',
                            phone: '',
                          });
                        }

                        return filtered;
                      }}
                      options={clients}
                      noOptionsText=""
                      getOptionLabel={({ name, inputValue }) => {
                        if (inputValue) {
                          return inputValue;
                        }
                        return name;
                      }}
                      renderInput={(params) => (
                        <OriginalTextField
                          name="clientName"
                          autoFocus
                          autoComplete="off"
                          placeholder="Escreva ou selecione uma opção"
                          helperText=" "
                          {...params}
                        />
                      )}
                      renderOption={({ name }, { inputValue }) => {
                        const matches = match(name, inputValue);
                        const parts = parse(name, matches);

                        return (
                          <div>
                            {parts.map(({ highlight, text }) => (
                              <span
                                key={text}
                                style={{ fontWeight: highlight ? 700 : 400 }}
                              >
                                {text}
                              </span>
                            ))}
                          </div>
                        );
                      }}
                    />
                    {clientName.name ? (
                      <SubmitQuestionButton>
                        <Button onClick={handleSubmitClientName}>
                          Continuar
                        </Button>
                        <div>
                          <span>
                            pressione <strong>ENTER</strong>
                          </span>
                          <span>↵</span>
                        </div>
                      </SubmitQuestionButton>
                    ) : (
                      <DisabledButton>Continuar</DisabledButton>
                    )}
                  </WhatIsClientName>
                </form>
              )}
              {clientCnpjOpen && (
                <Form
                  ref={clientCnpjRef}
                  className="individual-form"
                  onSubmit={handleSubmitClientCnpj}
                >
                  <WhatIsClientCnpj clientCnpjOpen={clientCnpjOpen}>
                    <AskTitle>
                      <div>
                        <span>2</span>
                        <FiArrowRight />
                      </div>
                      <div>
                        Qual o <strong>CNPJ</strong> do cliente?
                      </div>
                    </AskTitle>
                    <TextField
                      id="clientCnpj-input"
                      name="clientCnpjData"
                      autoFocus
                      autoComplete="off"
                      placeholder="Digite aqui"
                      defaultValue={clientCnpj}
                      InputProps={{
                        inputComponent: InputWithCNPJMask as any,
                      }}
                      helperText=" "
                    />
                    <SubmitQuestionButton>
                      <Button>Continuar</Button>
                      <div>
                        <span>
                          pressione <strong>ENTER</strong>
                        </span>
                        <span>↵</span>
                      </div>
                    </SubmitQuestionButton>
                  </WhatIsClientCnpj>
                </Form>
              )}
              {clientCpfOpen && (
                <Form
                  ref={clientCpfRef}
                  className="individual-form"
                  onSubmit={handleSubmitClientCpf}
                >
                  <WhatIsClientCpf clientCpfOpen={clientCpfOpen}>
                    <AskTitle>
                      <div>
                        <span>2</span>
                        <FiArrowRight />
                      </div>
                      <div>
                        Qual o <strong>CPF</strong> do cliente?
                      </div>
                    </AskTitle>
                    <TextField
                      id="clientCpf-input"
                      name="clientCpfData"
                      autoFocus
                      autoComplete="off"
                      placeholder="Digite aqui"
                      defaultValue={clientCpf}
                      InputProps={{
                        inputComponent: InputWithCPFMask as any,
                      }}
                      helperText=" "
                    />
                    <SubmitQuestionButton>
                      <Button>Continuar</Button>
                      <div>
                        <span>
                          pressione <strong>ENTER</strong>
                        </span>
                        <span>↵</span>
                      </div>
                    </SubmitQuestionButton>
                  </WhatIsClientCpf>
                </Form>
              )}
              {clientNameContactOpen && (
                <Form
                  ref={clientNameContactRef}
                  onSubmit={handleSubmitClientNameContact}
                  className="individual-form"
                >
                  <WhatIsClientNameContact
                    clientNameContactOpen={clientNameContactOpen}
                  >
                    <AskTitle>
                      <div>
                        <span>3</span>
                        <FiArrowRight />
                      </div>
                      <div>
                        Qual o <strong>nome</strong> do responsável?
                      </div>
                    </AskTitle>
                    <TextField
                      id="clientNameContact-input"
                      name="clientNameContactData"
                      autoFocus
                      autoComplete="off"
                      placeholder="Digite aqui"
                      defaultValue={clientNameContact}
                      helperText=" "
                    />
                    <SubmitQuestionButton>
                      <Button>Continuar</Button>
                      <div>
                        <span>
                          pressione <strong>ENTER</strong>
                        </span>
                        <span>↵</span>
                      </div>
                    </SubmitQuestionButton>
                  </WhatIsClientNameContact>
                </Form>
              )}
              {clientEmailOpen && (
                <Form
                  ref={clientEmailRef}
                  onSubmit={handleSubmitClientEmail}
                  className="individual-form"
                >
                  <WhatIsClientEmail clientEmailOpen={clientEmailOpen}>
                    <AskTitle>
                      <div>
                        <span>4</span>
                        <FiArrowRight />
                      </div>
                      <div>
                        Qual o <strong>e-mail</strong> do cliente?
                      </div>
                    </AskTitle>
                    <TextField
                      id="clientEmail-input"
                      name="clientEmailData"
                      autoFocus
                      autoComplete="off"
                      placeholder="Digite aqui"
                      defaultValue={clientEmail}
                      helperText=" "
                    />
                    <SubmitQuestionButton>
                      <Button>Continuar</Button>
                      <div>
                        <span>
                          pressione <strong>ENTER</strong>
                        </span>
                        <span>↵</span>
                      </div>
                    </SubmitQuestionButton>
                  </WhatIsClientEmail>
                </Form>
              )}
              {clientPhoneOpen && (
                <Form
                  ref={clientPhoneRef}
                  onSubmit={handleSubmitClientPhone}
                  className="individual-form"
                >
                  <WhatIsClientPhone clientPhoneOpen={clientPhoneOpen}>
                    <AskTitle>
                      <div>
                        <span>5</span>
                        <FiArrowRight />
                      </div>
                      <div>
                        Qual o <strong>telefone fixo</strong> do cliente?
                      </div>
                    </AskTitle>
                    <TextField
                      id="clientPhone-input"
                      name="clientPhoneData"
                      autoFocus
                      autoComplete="off"
                      placeholder="Digite aqui"
                      defaultValue={clientPhone}
                      InputProps={{
                        inputComponent: InputWithPhoneMask as any,
                      }}
                      helperText=" "
                    />
                    <SubmitQuestionButton>
                      <Button>Continuar</Button>
                      <div>
                        <span>
                          pressione <strong>ENTER</strong>
                        </span>
                        <span>↵</span>
                      </div>
                    </SubmitQuestionButton>
                  </WhatIsClientPhone>
                </Form>
              )}
              {clientMobilePhoneOpen && (
                <Form
                  ref={clientMobilePhoneRef}
                  onSubmit={handleSubmitClientMobilePhone}
                  className="individual-form"
                >
                  <WhatIsClientMobilePhone
                    clientMobilePhoneOpen={clientMobilePhoneOpen}
                  >
                    <AskTitle>
                      <div>
                        <span>6</span>
                        <FiArrowRight />
                      </div>
                      <div>
                        Qual o <strong>telefone celular</strong> do responsável?
                      </div>
                    </AskTitle>
                    <TextField
                      id="clientMobilePhone-input"
                      name="clientMobilePhoneData"
                      autoFocus
                      autoComplete="off"
                      placeholder="Digite aqui"
                      defaultValue={clientMobilePhone}
                      InputProps={{
                        inputComponent: InputWithMobilePhoneMask as any,
                      }}
                      helperText=" "
                    />
                    <SubmitQuestionButton>
                      <Button>Continuar</Button>
                      <div>
                        <span>
                          pressione <strong>ENTER</strong>
                        </span>
                        <span>↵</span>
                      </div>
                    </SubmitQuestionButton>
                  </WhatIsClientMobilePhone>
                </Form>
              )}
            </Content>
            <Footer>
              <Progress color={color} counterAnswers={counterAnswers.length}>
                <span>{counterAnswers.length} de 6 respondidas</span>
                <div className="progress-bar" />
                <div className="bg-progress-bar" />
              </Progress>
              <ButtonsControl color={color}>
                <button type="button" onClick={handleChangeToPreviousQuestion}>
                  <FiChevronUp />
                </button>
                <button type="button" onClick={handleChangeToNextQuestion}>
                  <FiChevronDown />
                </button>
              </ButtonsControl>
            </Footer>
            {confirmDataOpen && (
              <ConfirmData confirmDataOpen={confirmDataOpen} color={color}>
                <QuestionData>
                  <QuestionsContainer>
                    <p>Razão Social: </p>
                    {clientCnpj && <p>CNPJ: </p>}
                    {clientCpf && <p>CPF: </p>}
                    <p>Nome do responsável: </p>
                    <p>E-mail do responsável: </p>
                    {clientPhone && <p>Telefone da empresa: </p>}
                    {clientMobilePhone && <p>Telefone do responsável: </p>}
                  </QuestionsContainer>
                  <AnswersContainer>
                    <p>{clientName.name}</p>
                    {clientCnpj && <p>{clientCnpj}</p>}
                    {clientCpf && <p>{clientCpf}</p>}
                    <p>{clientNameContact}</p>
                    <p>{clientEmail}</p>
                    {clientPhone && <p>{clientPhone}</p>}
                    {clientMobilePhone && <p>{clientMobilePhone}</p>}
                  </AnswersContainer>
                </QuestionData>
                <SubmitFormButton>
                  {showCreateOrderButton ? (
                    <Button onClick={handleSubmitForm}>Criar pedido</Button>
                  ) : (
                    <DisabledButton>Criar pedido</DisabledButton>
                  )}
                </SubmitFormButton>
              </ConfirmData>
            )}
          </Container>
        </ThemeProvider>
      </NewOrderOverlap>
    </>
  );
};

export default NewOrder;
