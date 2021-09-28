import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Autocomplete, createFilterOptions } from '@material-ui/lab';
import { ThemeProvider, createTheme } from '@material-ui/core/styles';
import { TextField as OriginalTextField } from '@material-ui/core'; // Nome alterado pois foi utilizado o TextField do unform-material-ui também
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
import { useOrdersSearch } from '../../hooks/orders_search';

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
  WhatIsCompanyName,
  WhatIsCompanyCnpj,
  WhatIsCompanyCpf,
  WhatIsCompanyNameContact,
  WhatIsCompanyEmail,
  WhatIsCompanyMobilePhone,
  WhatIsCompanyPhone,
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

// Interface do company
interface CompanyData {
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
  company_id: string;
  seller_id: string;
}

// Interface para referenciar os dados inseridos nos inputs
interface InputData {
  companyCnpjData: string;
  companyCpfData: string;
  companyNameContactData: string;
  companyEmailData: string;
  companyPhoneData: string;
  companyMobilePhoneData: string;
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
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  // Armazena o nome da empresa
  const [companyName, setCompanyName] = useState<CompanyData>(
    {} as CompanyData
  );
  // Armazena o CNPJ da empresa
  const [companyCnpj, setCompanyCnpj] = useState('');
  // Armazena o CPF da empresa
  const [companyCpf, setCompanyCpf] = useState('');
  // Armazena o nome do responsável pela empresa
  const [companyNameContact, setCompanyNameContact] = useState('');
  // Armazena o email da empresa
  const [companyEmail, setCompanyEmail] = useState<string>('');
  // Armazena o telefone fixo da empresa
  const [companyPhone, setCompanyPhone] = useState<string>('');
  // Armazena o telefone celular do responsável pela empresa
  const [companyMobilePhone, setCompanyMobilePhone] = useState('');

  // Armazena se o component está aberto ou não
  const [companyNameOpen, setCompanyNameOpen] = useState(true);
  const [companyCnpjOpen, setCompanyCnpjOpen] = useState(false);
  const [companyCpfOpen, setCompanyCpfOpen] = useState(false);
  const [companyNameContactOpen, setCompanyNameContactOpen] = useState(false);
  const [companyEmailOpen, setCompanyEmailOpen] = useState(false);
  const [companyPhoneOpen, setCompanyPhoneOpen] = useState(false);
  const [companyMobilePhoneOpen, setCompanyMobilePhoneOpen] = useState(false);
  const [confirmDataOpen, setConfirmDataOpen] = useState(false);
  const [showCreateOrderButton, setShowCreateOrderButton] = useState(false);

  // Armazena as respostas para servir como contador
  const [counterAnswers, setCounterAnswers] = useState<string[]>([]);
  // Armazena se o component <ConfirmData> já foi aberto alguma vez
  const [confirmDataHasOpened, setConfirmDataHasOpened] = useState(false);

  const { addToast } = useToast();
  const { user } = useAuth();
  const { newOrderOpen, overlapNewOrderOpen, overlapOrderOpen, orderOpen } =
    useOverlap();
  const { toUpdateSearchResults } = useOrdersSearch();

  const companyCnpjRef = useRef<FormHandles>(null);
  const companyCpfRef = useRef<FormHandles>(null);
  const companyNameContactRef = useRef<FormHandles>(null);
  const companyEmailRef = useRef<FormHandles>(null);
  const companyPhoneRef = useRef<FormHandles>(null);
  const companyMobilePhoneRef = useRef<FormHandles>(null);

  const newOrderMaterialTheme = createTheme({
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
  const filter = createFilterOptions<CompanyData>();

  // Busca na API os clientes cadastrados e armazena no estado companies
  useEffect(() => {
    api
      .get<CompanyData[]>('/companies')
      .then((response) => {
        setCompanies(response.data);
      })
      .catch(() => {
        addToast({
          type: 'error',
          description: '#0140 - Erro ao carregar as empresas cadastradas',
        });
      });
  }, [addToast]);

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
    setCompanyNameOpen(false);
    setCompanyCnpjOpen(false);
    setCompanyCpfOpen(false);
    setCompanyNameContactOpen(false);
    setCompanyEmailOpen(false);
    setCompanyPhoneOpen(false);
    setCompanyMobilePhoneOpen(false);
    setConfirmDataOpen(true); // Tela de confirmação de dados
  }, []);

  // Função para lidar com o nome da empresa
  const handleSubmitCompanyName = useCallback(() => {
    // Verifica se existe o valor recebido pela função
    if (companyName.name) {
      setCompanyNameOpen(!companyNameOpen); // Fecha o component que está aberto

      // Verifica se já existe CPF digitado
      if (companyCpf && counterAnswers.includes('companyCpf')) {
        // Se existe um CPF já preenchido então abre o CPF
        setCompanyCpfOpen(!companyCpfOpen); // Abre o próximo component
      } else {
        // Se existe não um CPF preenchido abre o próximo que é o CNPJ
        setCompanyCnpjOpen(!companyCnpjOpen); // Abre o próximo component
      }

      if (!counterAnswers.find((e) => e === 'companyName')) {
        // Se essa questão já não tiver sido respondida ainda, armazena no estado que agora ela está respondida
        setCounterAnswers((state) => [...state, 'companyName']);
      }
    }

    if (
      confirmDataHasOpened &&
      counterAnswers.includes('companyNameContact') &&
      counterAnswers.includes('companyEmail') &&
      (counterAnswers.includes('companyPhone') ||
        counterAnswers.includes('companyMobilePhone'))
    ) {
      // Se o confirmData já foi aberto e o restante já foi respondido, abre a tela de confirmação
      handleShowData();
    }
  }, [
    companyName.name,
    confirmDataHasOpened,
    counterAnswers,
    companyNameOpen,
    companyCpf,
    companyCpfOpen,
    companyCnpjOpen,
    handleShowData,
  ]);

  // Função para lidar com o CNPJ da empresa
  const handleSubmitCompanyCnpj = useCallback(
    ({ companyCnpjData }: InputData) => {
      // Verifica se existe o valor recebido pela função
      if (companyCnpjData) {
        // Verifica se o CNPJ é válido
        if (isCNPJ(companyCnpjData)) {
          companyCnpjRef.current?.setErrors({}); // Remove os erros do campo
          setCompanyCnpjOpen(!companyCnpjOpen); // Fecha o component que está aberto
          setCompanyNameContactOpen(!companyNameContactOpen); // Abre o próximo component

          setCompanyCnpj(companyCnpjData); // Armazena o valor recebido no estado

          if (!counterAnswers.find((e) => e === 'companyCnpj')) {
            // Se essa questão já não tiver sido respondida ainda, armazena no estado que agora ela está respondida
            setCounterAnswers((state) => [...state, 'companyCnpj']);
          }

          if (
            confirmDataHasOpened &&
            counterAnswers.includes('companyName') &&
            counterAnswers.includes('companyNameContact') &&
            counterAnswers.includes('companyEmail') &&
            (counterAnswers.includes('companyPhone') ||
              counterAnswers.includes('companyMobilePhone'))
          ) {
            // Se o confirmData já foi aberto e o restante já foi respondido, abre a tela de confirmação
            handleShowData();
          }
        } else {
          // Se o CNPJ não é válido, então define um erro para o campo
          companyCnpjRef.current?.setErrors({
            companyCnpjData: 'CNPJ inválido',
          });
        }
      }
      // Se o usuário não informar um CNPJ ele será questionado para inserir um CPF
      else {
        setCompanyCnpjOpen(!companyCnpjOpen); // Fecha o component que está aberto
        setCompanyCpfOpen(!companyCpfOpen); // Fecha o component que está aberto

        setCompanyCnpj(''); // Limpa o estado

        companyCnpjRef.current?.setErrors({}); // Remove os erros do campo

        // Remove esse item na contagem de respostas
        setCounterAnswers((state) => state.filter((e) => e !== 'companyCnpj'));
      }
    },
    [
      companyCnpjOpen,
      companyCpfOpen,
      companyNameContactOpen,
      confirmDataHasOpened,
      counterAnswers,
      handleShowData,
    ]
  );

  // Função para lidar com o CPF da empresa
  const handleSubmitCompanyCpf = useCallback(
    ({ companyCpfData }: InputData) => {
      // Verifica se existe o valor recebido pela função
      if (companyCpfData) {
        // Verifica se o CPF é válido
        if (isCPF(companyCpfData)) {
          companyCpfRef.current?.setErrors({}); // Remove os erros do campo
          setCompanyCpfOpen(!companyCpfOpen); // Fecha o component que está aberto
          setCompanyNameContactOpen(!companyNameContactOpen); // Abre o próximo component

          setCompanyCpf(companyCpfData); // Armazena o valor recebido no estado

          if (!counterAnswers.find((e) => e === 'companyCpf')) {
            // Se essa questão já não tiver sido respondida ainda, armazena no estado que agora ela está respondida
            setCounterAnswers((state) => [...state, 'companyCpf']);
          }

          if (
            confirmDataHasOpened &&
            counterAnswers.includes('companyName') &&
            counterAnswers.includes('companyNameContact') &&
            counterAnswers.includes('companyEmail') &&
            (counterAnswers.includes('companyPhone') ||
              counterAnswers.includes('companyMobilePhone'))
          ) {
            // Se o confirmData já foi aberto e o restante já foi respondido, abre a tela de confirmação
            handleShowData();
          }
        }
        // Se o CPF não é válido, então define um erro para o campo
        else {
          companyCpfRef.current?.setErrors({
            companyCpfData: 'CPF inválido',
          });
        }
      }
      // Se o usuário não informar um CPF, pode continuar
      else {
        setCompanyCpfOpen(!companyCpfOpen); // Fecha o component que está aberto
        setCompanyNameContactOpen(!companyNameContactOpen); // Abre o próximo component

        setCompanyCpf(''); // Limpa o estado

        companyCpfRef.current?.setErrors({}); // Remove os erros do campo

        // Remove esse item na contagem de respostas
        setCounterAnswers((state) => state.filter((e) => e !== 'companyCpf'));
      }
    },
    [
      companyCpfOpen,
      companyNameContactOpen,
      confirmDataHasOpened,
      counterAnswers,
      handleShowData,
    ]
  );

  // Função para lidar com o nome do responsável pela empresa
  const handleSubmitCompanyNameContact = useCallback(
    ({ companyNameContactData }: InputData) => {
      // Verifica se existe o valor recebido pela função
      if (companyNameContactData) {
        companyNameContactRef.current?.setErrors({}); // Remove os erros do campo
        setCompanyNameContactOpen(!companyNameContactOpen); // Fecha o component que está aberto
        setCompanyEmailOpen(!companyEmailOpen); // Abre o próximo component

        // Armazena o valor recebido no estado
        setCompanyNameContact(
          // Formata o valor recebido ao armazenar no estado
          formatToCapitalized(companyNameContactData, {
            trimTrailingWhiteSpaces: false,
          })
        );

        if (!counterAnswers.find((e) => e === 'companyNameContact')) {
          // Se essa questão já não tiver sido respondida ainda, armazena no estado que agora ela está respondida
          setCounterAnswers((state) => [...state, 'companyNameContact']);
        }

        if (
          confirmDataHasOpened &&
          counterAnswers.includes('companyName') &&
          counterAnswers.includes('companyEmail') &&
          (counterAnswers.includes('companyPhone') ||
            counterAnswers.includes('companyMobilePhone'))
        ) {
          // Se o confirmData já foi aberto e o restante já foi respondido, abre a tela de confirmação
          handleShowData();
        }
      }
      // Se o usuário não informar um nome de responsável, então define um erro para o campo
      else {
        companyNameContactRef.current?.setErrors({
          companyNameContactData: 'Favor preencher um nome',
        });
      }
    },
    [
      companyNameContactOpen,
      companyEmailOpen,
      counterAnswers,
      confirmDataHasOpened,
      handleShowData,
    ]
  );

  // Função para lidar com o email da empresa
  const handleSubmitCompanyEmail = useCallback(
    ({ companyEmailData }: InputData) => {
      // Verifica se existe o valor recebido pela função
      if (companyEmailData) {
        // Verifica se o email é válido
        if (isEmail(companyEmailData.toLocaleLowerCase())) {
          companyEmailRef.current?.setErrors({}); // Remove os erros do campo
          setCompanyEmailOpen(!companyEmailOpen); // Fecha o component que está aberto
          setCompanyPhoneOpen(!companyPhoneOpen); // Abre o próximo component

          setCompanyEmail(companyEmailData.toLocaleLowerCase()); // Armazena o valor recebido no estado

          if (!counterAnswers.find((e) => e === 'companyEmail')) {
            // Se essa questão já não tiver sido respondida ainda, armazena no estado que agora ela está respondida
            setCounterAnswers((state) => [...state, 'companyEmail']);
          }

          if (
            confirmDataHasOpened &&
            counterAnswers.includes('companyName') &&
            counterAnswers.includes('companyNameContact') &&
            (counterAnswers.includes('companyPhone') ||
              counterAnswers.includes('companyMobilePhone'))
          ) {
            // Se o confirmData já foi aberto e o restante já foi respondido, abre a tela de confirmação
            handleShowData();
          }
        }
        // Se o email não é válido, então define um erro para o campo
        else {
          companyEmailRef.current?.setErrors({
            companyEmailData: 'Favor preencher um e-mail válido',
          });
        }
      }
      // Se o usuário não informar um email, então define um erro para o campo
      else {
        companyEmailRef.current?.setErrors({
          companyEmailData: 'Favor preencher um e-mail',
        });
      }
    },
    [
      companyEmailOpen,
      companyPhoneOpen,
      counterAnswers,
      confirmDataHasOpened,
      handleShowData,
    ]
  );

  // Função para lidar com o telefone fixo da empresa
  const handleSubmitCompanyPhone = useCallback(
    ({ companyPhoneData }: InputData) => {
      // Verifica se existe o length do valor recebido pela função é > 1
      // Essa validação é necessária devido ao parentese que existe no primeiro caractere da máscara
      if (companyPhoneData.length > 1) {
        if (isPhone(companyPhoneData)) {
          // Verifica se o telefone é válido
          companyPhoneRef.current?.setErrors({}); // Remove os erros do campo
          setCompanyPhoneOpen(!companyPhoneOpen); // Fecha o component que está aberto
          setCompanyMobilePhoneOpen(!companyMobilePhoneOpen); // Abre o próximo component

          setCompanyPhone(companyPhoneData); // Armazena o valor recebido no estado

          if (!counterAnswers.find((e) => e === 'companyPhone')) {
            // Se essa questão já não tiver sido respondida ainda, armazena no estado que agora ela está respondida
            setCounterAnswers((state) => [...state, 'companyPhone']);
          }

          if (
            confirmDataHasOpened &&
            counterAnswers.includes('companyName') &&
            counterAnswers.includes('companyNameContact') &&
            counterAnswers.includes('companyEmail')
          ) {
            // Se o confirmData já foi aberto e o restante já foi respondido, abre a tela de confirmação
            handleShowData();
          }
        }
        // Se o telefone não é válido, então define um erro para o campo
        else {
          companyPhoneRef.current?.setErrors({
            companyPhoneData: 'Favor preencher um telefone fixo válido',
          });
        }
      }
      // Se o usuário não informar um telefone fixo, verifica se ele já informou um telefone celular
      else if (companyMobilePhone) {
        // Se um telefone celular já foi informado pode continuar
        setCompanyPhone(''); // Limpa o estado
        // Remove esse item na contagem de respostas
        setCounterAnswers((state) => state.filter((e) => e !== 'companyPhone'));

        companyPhoneRef.current?.setErrors({}); // Remove os erros do campo
        setCompanyPhoneOpen(!companyPhoneOpen); // Fecha o component que está aberto
        setCompanyMobilePhoneOpen(!companyMobilePhoneOpen); // Abre o próximo component

        if (
          confirmDataHasOpened &&
          counterAnswers.includes('companyName') &&
          counterAnswers.includes('companyNameContact') &&
          counterAnswers.includes('companyEmail')
        ) {
          // Se o confirmData já foi aberto e o restante já foi respondido, abre a tela de confirmação
          handleShowData();
        }
      }
      // Se não possui telefone fixo nem celular, o usuário será questionado para inserir um telefone celular
      else {
        setCompanyPhoneOpen(!companyPhoneOpen); // Fecha o component que está aberto
        setCompanyMobilePhoneOpen(!companyMobilePhoneOpen); // Abre o próximo component

        setCompanyPhone(''); // Limpa o estado
        // Remove esse item na contagem de respostas
        setCounterAnswers((state) => state.filter((e) => e !== 'companyPhone'));
      }
    },
    [
      companyMobilePhone,
      companyPhoneOpen,
      companyMobilePhoneOpen,
      counterAnswers,
      confirmDataHasOpened,
      handleShowData,
    ]
  );

  // Função para lidar com o telefone celular do responsável pela empresa
  const handleSubmitCompanyMobilePhone = useCallback(
    ({ companyMobilePhoneData }: InputData) => {
      // Verifica se existe o length do valor recebido pela função é > 1
      // Essa validação é necessária devido ao parentese que existe no primeiro caractere da máscara
      if (companyMobilePhoneData.length > 1) {
        if (isPhone(companyMobilePhoneData)) {
          // Verifica se o telefone é válido
          companyMobilePhoneRef.current?.setErrors({}); // Remove os erros do campo
          setCompanyMobilePhoneOpen(!companyMobilePhoneOpen); // Fecha o component que está aberto
          setConfirmDataOpen(!confirmDataOpen); // Abre o próximo component

          setConfirmDataHasOpened(true); // Define que o component confirmData foi aberto uma vez

          setCompanyMobilePhone(companyMobilePhoneData); // Armazena o valor recebido no estado

          if (!counterAnswers.find((e) => e === 'companyMobilePhone')) {
            // Se essa questão já não tiver sido respondida ainda, armazena no estado que agora ela está respondida
            setCounterAnswers((state) => [...state, 'companyMobilePhone']);
          }

          if (
            confirmDataHasOpened &&
            counterAnswers.includes('companyName') &&
            counterAnswers.includes('companyNameContact') &&
            counterAnswers.includes('companyEmail')
          ) {
            // Se o confirmData já foi aberto e o restante já foi respondido, abre a tela de confirmação
            handleShowData();
          }
        }
        // Se o telefone não é válido, então define um erro para o campo
        else {
          companyMobilePhoneRef.current?.setErrors({
            companyMobilePhoneData:
              'Favor preencher um telefone celular válido',
          });
        }
      }
      // Se o usuário não informar um telefone celular, verifica se ele já informou um telefone fixo
      else if (companyPhone) {
        // Se um telefone fixo já foi informado pode continuar
        setCompanyMobilePhone(''); // Limpa o estado
        // Remove esse item na contagem de respostas
        setCounterAnswers((state) =>
          state.filter((e) => e !== 'companyMobilePhone')
        );

        companyMobilePhoneRef.current?.setErrors({}); // Remove os erros do campo
        setCompanyMobilePhoneOpen(!companyMobilePhoneOpen); // Fecha o component que está aberto
        setConfirmDataOpen(!confirmDataOpen); // Abre o próximo component

        setConfirmDataHasOpened(true); // Define que o component confirmData foi aberto uma vez

        if (
          confirmDataHasOpened &&
          counterAnswers.includes('companyName') &&
          counterAnswers.includes('companyNameContact') &&
          counterAnswers.includes('companyEmail')
        ) {
          // Se o confirmData já foi aberto e o restante já foi respondido, abre a tela de confirmação
          handleShowData();
        }
      }
      // Se não possui telefone fixo nem celular, então define um erro para o campo
      // Ou ele informa um telefone celular ou volta e informa um telefone fixo
      else {
        companyMobilePhoneRef.current?.setErrors({
          companyMobilePhoneData:
            'Favor preencher um telefone celular. Ou volte e informe um telefone fixo.',
        });
        setCompanyMobilePhone(''); // Limpa o estado
        // Remove esse item na contagem de respostas
        setCounterAnswers((state) =>
          state.filter((e) => e !== 'companyMobilePhone')
        );
      }
    },
    [
      companyPhone,
      companyMobilePhoneOpen,
      confirmDataOpen,
      counterAnswers,
      confirmDataHasOpened,
      handleShowData,
    ]
  );

  // Função que preenche o formulário quando seleciona uma empresa existente
  const handleFinishForm = useCallback(
    (selectedCompanyName: CompanyData) => {
      // Limpa todo preenchimento existente
      setCompanyName({} as CompanyData);
      setCompanyCnpj('');
      setCompanyCpf('');
      setCompanyNameContact('');
      setCompanyEmail('');
      setCompanyPhone('');
      setCompanyMobilePhone('');
      setCounterAnswers([]);

      setCompanyName(selectedCompanyName); // Armazena o valor recebido no estado

      // Armazena no estado que agora está questão está respondida
      setCounterAnswers((state) => [...state, 'companyName']);

      // Procura este company no array de companies cadastrados
      const findCompany = companies.find(
        (company) => company.name === selectedCompanyName.name
      );

      if (findCompany) {
        // Se o company existir, então procura o restante das informações
        // Verifica que se o company possui CNPJ ou CPF
        if (findCompany.cnpj_cpf.length > 11) {
          setCompanyCnpj(formatToCNPJ(findCompany.cnpj_cpf)); // Armazena o valor encontrado
          // Armazena no estado que agora está questão está respondida
          setCounterAnswers((state) => [...state, 'companyCnpj']);
        } else if (findCompany.cnpj_cpf.length > 0) {
          setCompanyCpf(formatToCPF(findCompany.cnpj_cpf)); // Armazena o valor encontrado
          // Armazena no estado que agora está questão está respondida
          setCounterAnswers((state) => [...state, 'companyCpf']);
        }

        // Verifica se o company possui nome de responsável
        if (findCompany.contact_name) {
          setCompanyNameContact(findCompany.contact_name); // Armazena o valor encontrado
          // Armazena no estado que agora está questão está respondida
          setCounterAnswers((state) => [...state, 'companyNameContact']);
        }

        // Verifica se o company possui email
        if (findCompany.email) {
          setCompanyEmail(findCompany.email); // Armazena o valor encontrado
          // Armazena no estado que agora está questão está respondida
          setCounterAnswers((state) => [...state, 'companyEmail']);
        }

        // Verifica se o company possui telefone fixo
        if (findCompany.phone) {
          setCompanyPhone(formatToPhone(findCompany.phone)); // Armazena o valor encontrado
          // Armazena no estado que agora está questão está respondida
          setCounterAnswers((state) => [...state, 'companyPhone']);
        }

        // Verifica se o company possui telefone celular
        if (findCompany.mobile) {
          setCompanyMobilePhone(formatToPhone(findCompany.mobile)); // Armazena o valor encontrado
          // Armazena no estado que agora está questão está respondida
          setCounterAnswers((state) => [...state, 'companyMobilePhone']);
        }

        handleShowData(); // Abre a tela de confirmação

        setConfirmDataHasOpened(true); // Define que o component confirmData foi aberto uma vez
      }
    },
    [companies, handleShowData]
  );

  // Função que envia o formulário para ser cadastrado na API
  const handleSubmitForm = useCallback(async () => {
    // Remove os caracteres especiais das variáveis para salvar no banco
    const clearCompanyCnpj = companyCnpj
      .replace(/[^\w\s]/gi, '')
      .trimEnd()
      .trimStart();
    const clearCompanyCpf = companyCpf
      .replace(/[^\w\s]/gi, '')
      .trimEnd()
      .trimStart();
    const clearCompanyNameContact = companyNameContact
      .trimEnd()
      .trimStart()
      .split(/\s+/)
      .join(' ');
    const clearCompanyPhone = companyPhone
      .replace(/[^\w]/gi, '')
      .trimEnd()
      .trimStart();
    const clearCompanyMobilePhone = companyMobilePhone
      .replace(/[^\w]/gi, '')
      .trimEnd()
      .trimStart();

    // Verifica no array de companies cadastrados se existe um company com o mesmo nome
    const findCompany = companies.find(
      (company) =>
        company.name
          .toLocaleLowerCase()
          .trimEnd()
          .trimStart()
          .split(/\s+/)
          .join(' ') ===
        companyName.name
          .toLocaleLowerCase()
          .trimEnd()
          .trimStart()
          .split(/\s+/)
          .join(' ')
    );

    if (!findCompany) {
      // Se o company não existe ele será cadastrado
      await api
        .post<CompanyData>('/companies', {
          name: companyName.name,
          cnpj_cpf:
            (companyCnpj && clearCompanyCnpj) ||
            (companyCpf && clearCompanyCpf),
          contact_name: clearCompanyNameContact,
          email: companyEmail,
          phone: clearCompanyPhone,
          mobile: clearCompanyMobilePhone,
        })
        .then((companyResponse) => {
          // Após o cadastro do novo company, cria uma nova order
          api
            .post<CreateOrderResponse>('/orders', {
              company_id: companyResponse.data.id,
              seller_id: user.id,
            })
            .then((orderResponse) => {
              setOrderId(orderResponse.data.id); // Armazena a order_id recém criada

              addToast({
                type: 'success',
                description: 'Pedido criado com sucesso!',
              });

              setConfirmDataOpen(false); // Fecha o component de confirmação
              overlapOrderOpen(true); // Abre a order criada

              toUpdateSearchResults({
                order_id: orderResponse.data.id,
                update_database: true,
              });
            })
            .catch(() => {
              addToast({
                type: 'error',
                description: '#0160 - Erro ao criar um novo pedido',
              });
            });
        })
        .catch(() => {
          addToast({
            type: 'error',
            description: '#0150 - Erro ao cadastrar um novo cliente',
          });
        });
    }
    // Se o company existe ele será atualizado
    else {
      await api
        .patch<CompanyData>(`/companies/${findCompany.id}`, {
          cnpj_cpf:
            (companyCnpj && clearCompanyCnpj) ||
            (companyCpf && clearCompanyCpf),
          contact_name: clearCompanyNameContact,
          email: companyEmail,
          phone: clearCompanyPhone,
          mobile: clearCompanyMobilePhone,
        })
        .then(() => {
          // Após atualizar o cadastro do company, cria uma nova order
          api
            .post<CreateOrderResponse>('/orders', {
              company_id: findCompany.id,
              seller_id: user.id,
            })
            .then((orderResponse) => {
              setOrderId(orderResponse.data.id); // Armazena a order_id recém criada

              addToast({
                type: 'success',
                description: 'Pedido criado com sucesso!',
              });

              setConfirmDataOpen(false); // Fecha o component de confirmação
              overlapOrderOpen(true); // Abre a order criada

              toUpdateSearchResults({
                order_id: orderResponse.data.id,
                update_database: true,
              });
            })
            .catch(() => {
              addToast({
                type: 'error',
                description: '#0160 - Erro ao criar um novo pedido',
              });
            });
        })
        .catch(() => {
          addToast({
            type: 'error',
            description: '#0220 - Erro ao atualizar o cadastro do cliente',
          });
        });
    }
  }, [
    companyCnpj,
    companyCpf,
    companyNameContact,
    companyPhone,
    companyMobilePhone,
    companies,
    companyName.name,
    companyEmail,
    user.id,
    addToast,
    overlapOrderOpen,
    toUpdateSearchResults,
  ]);

  // Função para transitar entre as questões com PageUp
  const handleChangeToPreviousQuestion = useCallback(() => {
    if (
      companyNameOpen &&
      companyName.name &&
      companyNameContact &&
      companyEmail &&
      (companyPhone || companyMobilePhone)
    ) {
      setCompanyNameOpen(!companyNameOpen); // Fecha o component que está aberto
      setConfirmDataOpen(!confirmDataOpen); // Abre o component anterior
    }
    if (companyCnpjOpen) {
      setCompanyCnpjOpen(!companyCnpjOpen); // Fecha o component que está aberto
      setCompanyNameOpen(!companyNameOpen); // Abre o component anterior
    }
    if (companyCpfOpen && !companyCpf) {
      setCompanyCpfOpen(!companyCpfOpen); // Fecha o component que está aberto
      setCompanyCnpjOpen(!companyCnpjOpen); // Abre o component anterior
    }
    if (companyCpfOpen && companyCpf) {
      setCompanyCpfOpen(!companyCpfOpen); // Fecha o component que está aberto
      setCompanyNameOpen(!companyNameOpen); // Abre o component anterior
    }
    if (companyNameContactOpen && !companyCnpj && !companyCpf) {
      setCompanyNameContactOpen(!companyNameContactOpen); // Fecha o component que está aberto
      setCompanyCnpjOpen(!companyCnpjOpen); // Abre o component anterior
    }
    if (companyNameContactOpen && companyCnpj) {
      setCompanyNameContactOpen(!companyNameContactOpen); // Fecha o component que está aberto
      setCompanyCnpjOpen(!companyCnpjOpen); // Abre o component anterior
    }
    if (companyNameContactOpen && companyCpf) {
      setCompanyNameContactOpen(!companyNameContactOpen); // Fecha o component que está aberto
      setCompanyCpfOpen(!companyCpfOpen); // Abre o component anterior
    }
    if (companyEmailOpen) {
      setCompanyEmailOpen(!companyEmailOpen); // Fecha o component que está aberto
      setCompanyNameContactOpen(!companyNameContactOpen); // Abre o component anterior
    }
    if (companyPhoneOpen) {
      setCompanyPhoneOpen(!companyPhoneOpen); // Fecha o component que está aberto
      setCompanyEmailOpen(!companyEmailOpen); // Abre o component anterior
    }
    if (companyMobilePhoneOpen) {
      setCompanyMobilePhoneOpen(!companyMobilePhoneOpen); // Fecha o component que está aberto
      setCompanyPhoneOpen(!companyPhoneOpen); // Abre o component anterior
    }
    if (confirmDataOpen) {
      setConfirmDataOpen(!confirmDataOpen); // Fecha o component que está aberto
      setCompanyMobilePhoneOpen(!companyMobilePhoneOpen); // Abre o component anterior
    }
  }, [
    companyNameOpen,
    companyName.name,
    companyCnpj,
    companyCpf,
    companyNameContact,
    companyEmail,
    companyPhone,
    companyMobilePhone,
    companyCnpjOpen,
    companyCpfOpen,
    companyNameContactOpen,
    companyEmailOpen,
    companyPhoneOpen,
    companyMobilePhoneOpen,
    confirmDataOpen,
  ]);

  // Função para transitar entre as questões com PageDown
  const handleChangeToNextQuestion = useCallback(() => {
    if (companyNameOpen && companyName.name && companyCnpj) {
      setCompanyNameOpen(!companyNameOpen); // Fecha o component que está aberto
      setCompanyCnpjOpen(!companyCnpjOpen); // Abre o próximo component
    }
    if (companyNameOpen && companyName.name && companyCpf) {
      setCompanyNameOpen(!companyNameOpen); // Fecha o component que está aberto
      setCompanyCpfOpen(!companyCpfOpen); // Abre o próximo component
    }
    if (
      companyNameOpen &&
      companyName.name &&
      !companyCpf &&
      !companyCnpj &&
      companyNameContact
    ) {
      setCompanyNameOpen(!companyNameOpen); // Fecha o component que está aberto
      setCompanyNameContactOpen(!companyNameContactOpen); // Abre o próximo component
    }
    if (companyCnpjOpen && !companyCnpj) {
      setCompanyCnpjOpen(!companyCnpjOpen); // Fecha o component que está aberto
      setCompanyCpfOpen(!companyCpfOpen); // Abre o próximo component
    }
    if (companyCnpjOpen && companyCnpj) {
      setCompanyCnpjOpen(!companyCnpjOpen); // Fecha o component que está aberto
      setCompanyNameContactOpen(!companyNameContactOpen); // Abre o próximo component
    }
    if (companyCpfOpen && companyCpf) {
      setCompanyCpfOpen(!companyCpfOpen); // Fecha o component que está aberto
      setCompanyNameContactOpen(!companyNameContactOpen); // Abre o próximo component
    }
    if (companyNameContactOpen && companyNameContact) {
      setCompanyNameContactOpen(!companyNameContactOpen); // Fecha o component que está aberto
      setCompanyEmailOpen(!companyEmailOpen); // Abre o próximo component
    }
    if (companyEmailOpen && companyEmail) {
      setCompanyEmailOpen(!companyEmailOpen); // Fecha o component que está aberto
      setCompanyPhoneOpen(!companyPhoneOpen); // Abre o próximo component
    }
    if (companyPhoneOpen && companyMobilePhone) {
      setCompanyPhoneOpen(!companyPhoneOpen); // Fecha o component que está aberto
      setCompanyMobilePhoneOpen(!companyMobilePhoneOpen); // Abre o próximo component
    }
    if (companyPhoneOpen && !companyMobilePhone) {
      setCompanyPhoneOpen(!companyPhoneOpen); // Fecha o component que está aberto
      setConfirmDataOpen(!confirmDataOpen); // Abre o próximo component
    }
    if (companyMobilePhoneOpen && (companyMobilePhone || companyPhoneOpen)) {
      setCompanyMobilePhoneOpen(!companyMobilePhoneOpen); // Fecha o component que está aberto
      setConfirmDataOpen(!confirmDataOpen); // Abre o próximo component
    }
    if (confirmDataOpen) {
      setConfirmDataOpen(!confirmDataOpen); // Fecha o component que está aberto
      setCompanyNameOpen(!companyNameOpen); // Abre o próximo component
    }
  }, [
    companyNameOpen,
    companyName.name,
    companyCnpjOpen,
    companyCpfOpen,
    companyCpf,
    companyCnpj,
    companyNameContactOpen,
    companyNameContact,
    companyEmailOpen,
    companyEmail,
    companyPhoneOpen,
    companyMobilePhoneOpen,
    companyMobilePhone,
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

  // Função para lidar com o fechamento deste component
  const handleCloseWindow = useCallback(() => {
    if (
      !companyName.name &&
      !companyCnpj &&
      !companyCpf &&
      !companyNameContact &&
      !companyEmail &&
      !companyPhone &&
      !companyMobilePhone
    ) {
      overlapNewOrderOpen(false); // Fecha este component
    } else {
      // eslint-disable-next-line no-alert
      const checkBeforeClose = window.confirm(
        'Tem certeza que deseja fechar sem salvar?'
      );
      if (checkBeforeClose) {
        overlapNewOrderOpen(false); // Fecha este component
      }
    }
  }, [
    companyCnpj,
    companyCpf,
    companyEmail,
    companyMobilePhone,
    companyName.name,
    companyNameContact,
    companyPhone,
    overlapNewOrderOpen,
  ]);

  // Impede o usuário de fechar/atualizar o navegador sem salvar as informações
  window.onbeforeunload = () => {
    return companyName.name ||
      companyCnpj ||
      companyCpf ||
      companyNameContact ||
      companyEmail ||
      companyPhone ||
      companyMobilePhone
      ? 'Se você sair desta página você irá perder suas alterações.'
      : null;
  };

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
          handleClick={() => handleCloseWindow()}
          type="button"
          icon={FaTimes}
          color={color}
        />
        <ThemeProvider theme={newOrderMaterialTheme}>
          <Container>
            <Content color={color}>
              {companyNameOpen && companies && (
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="individual-form"
                >
                  <WhatIsCompanyName companyNameOpen={companyNameOpen}>
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
                      value={companyName}
                      onChange={(event, newCompanyName) => {
                        if (newCompanyName?.inputValue) {
                          // Adiciona uma empresa nova
                          setCompanyName({
                            ...newCompanyName,
                            name: newCompanyName.inputValue
                              .trimEnd()
                              .trimStart()
                              .split(/\s+/)
                              .join(' '),
                          });
                        } else if (newCompanyName) {
                          // Seleciona um existente e encerra o formulário
                          handleFinishForm(newCompanyName);
                        }
                        if (!newCompanyName) {
                          // Limpou o input
                          setCompanyName({} as CompanyData);
                          setCounterAnswers((state) =>
                            state.filter((e) => e !== 'companyName')
                          );
                        }
                      }}
                      filterOptions={(options, params) => {
                        const filtered = filter(
                          options,
                          params
                        ) as CompanyData[];

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
                      options={companies}
                      noOptionsText=""
                      getOptionLabel={({ name, inputValue }) => {
                        if (inputValue) {
                          return inputValue;
                        }
                        return name;
                      }}
                      renderInput={(params) => (
                        <OriginalTextField
                          name="companyName"
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
                    {companyName.name ? (
                      <SubmitQuestionButton>
                        <Button onClick={handleSubmitCompanyName}>
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
                  </WhatIsCompanyName>
                </form>
              )}
              {companyCnpjOpen && (
                <Form
                  ref={companyCnpjRef}
                  className="individual-form"
                  onSubmit={handleSubmitCompanyCnpj}
                >
                  <WhatIsCompanyCnpj companyCnpjOpen={companyCnpjOpen}>
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
                      id="companyCnpj-input"
                      name="companyCnpjData"
                      autoFocus
                      autoComplete="off"
                      placeholder="Digite aqui"
                      defaultValue={companyCnpj}
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
                  </WhatIsCompanyCnpj>
                </Form>
              )}
              {companyCpfOpen && (
                <Form
                  ref={companyCpfRef}
                  className="individual-form"
                  onSubmit={handleSubmitCompanyCpf}
                >
                  <WhatIsCompanyCpf companyCpfOpen={companyCpfOpen}>
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
                      id="companyCpf-input"
                      name="companyCpfData"
                      autoFocus
                      autoComplete="off"
                      placeholder="Digite aqui"
                      defaultValue={companyCpf}
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
                  </WhatIsCompanyCpf>
                </Form>
              )}
              {companyNameContactOpen && (
                <Form
                  ref={companyNameContactRef}
                  onSubmit={handleSubmitCompanyNameContact}
                  className="individual-form"
                >
                  <WhatIsCompanyNameContact
                    companyNameContactOpen={companyNameContactOpen}
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
                      id="companyNameContact-input"
                      name="companyNameContactData"
                      autoFocus
                      autoComplete="off"
                      placeholder="Digite aqui"
                      defaultValue={companyNameContact}
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
                  </WhatIsCompanyNameContact>
                </Form>
              )}
              {companyEmailOpen && (
                <Form
                  ref={companyEmailRef}
                  onSubmit={handleSubmitCompanyEmail}
                  className="individual-form"
                >
                  <WhatIsCompanyEmail companyEmailOpen={companyEmailOpen}>
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
                      id="companyEmail-input"
                      name="companyEmailData"
                      autoFocus
                      autoComplete="off"
                      placeholder="Digite aqui"
                      defaultValue={companyEmail}
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
                  </WhatIsCompanyEmail>
                </Form>
              )}
              {companyPhoneOpen && (
                <Form
                  ref={companyPhoneRef}
                  onSubmit={handleSubmitCompanyPhone}
                  className="individual-form"
                >
                  <WhatIsCompanyPhone companyPhoneOpen={companyPhoneOpen}>
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
                      id="companyPhone-input"
                      name="companyPhoneData"
                      autoFocus
                      autoComplete="off"
                      placeholder="Digite aqui"
                      defaultValue={companyPhone}
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
                  </WhatIsCompanyPhone>
                </Form>
              )}
              {companyMobilePhoneOpen && (
                <Form
                  ref={companyMobilePhoneRef}
                  onSubmit={handleSubmitCompanyMobilePhone}
                  className="individual-form"
                >
                  <WhatIsCompanyMobilePhone
                    companyMobilePhoneOpen={companyMobilePhoneOpen}
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
                      id="companyMobilePhone-input"
                      name="companyMobilePhoneData"
                      autoFocus
                      autoComplete="off"
                      placeholder="Digite aqui"
                      defaultValue={companyMobilePhone}
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
                  </WhatIsCompanyMobilePhone>
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
                    {companyCnpj && <p>CNPJ: </p>}
                    {companyCpf && <p>CPF: </p>}
                    <p>Nome do responsável: </p>
                    <p>E-mail do responsável: </p>
                    {companyPhone && <p>Telefone da empresa: </p>}
                    {companyMobilePhone && <p>Telefone do responsável: </p>}
                  </QuestionsContainer>
                  <AnswersContainer>
                    <p>{companyName.name}</p>
                    {companyCnpj && <p>{companyCnpj}</p>}
                    {companyCpf && <p>{companyCpf}</p>}
                    <p>{companyNameContact}</p>
                    <p>{companyEmail}</p>
                    {companyPhone && <p>{companyPhone}</p>}
                    {companyMobilePhone && <p>{companyMobilePhone}</p>}
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
