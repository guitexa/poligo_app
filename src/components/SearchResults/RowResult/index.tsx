import React, { useCallback, memo } from 'react';
import { IconBaseProps } from 'react-icons';
import {
  FaCheckCircle,
  FaRegCheckCircle,
  FaRegClock,
  FaTimes,
  FaCalendarAlt,
} from 'react-icons/fa';
import { BiCalendarX } from 'react-icons/bi';
import { GoAlert } from 'react-icons/go';
import { IoMdThumbsDown } from 'react-icons/io';
import { HiOutlineRefresh } from 'react-icons/hi';
import { RiDraftFill } from 'react-icons/ri';
import { isToday, parseISO, isBefore, isAfter } from 'date-fns';

import {
  Container,
  DateField,
  TextFlex,
  TextWidth,
  Value,
  Status,
} from './styles';

interface RowResultProps {
  from: string;
  color: string;
  isCanceled?: boolean;
  handleClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
  dueDate?: string | false | undefined;
  date?: string | null;
  products?: string[];
  seller?: string | false;
  technical?: string | false;
  value?: string | false | number;
  deliveryDate?: string | null;
  status?: string | undefined | unknown;
  replanDate?: string | false | undefined;
  grossValue?: string | false | number;
  netValue?: string | false | number;
  paidDate?: string | false | undefined;
  paidValue?: string | false | number;
  companyName?: string;
  bankAccount?: string;
  category?: string;
}

interface financialStatusReturnProps {
  due_date: string;
  paid_date: string | unknown;
  financial_category: string;
}

const RowResult: React.FC<RowResultProps> = ({
  from,
  color,
  isCanceled,
  handleClick,
  dueDate,
  date,
  companyName,
  products,
  seller,
  technical,
  value,
  deliveryDate,
  status,
  replanDate,
  grossValue,
  netValue,
  paidDate,
  paidValue,
  bankAccount,
  category,
}) => {
  // Função para exibir os ícones de status conforme valor recebido
  const formatOrderStatus = useCallback((val: string | unknown):
    | IconBaseProps
    | undefined => {
    if (val === 'Rascunho') {
      return <RiDraftFill className="riDraftFill" />;
    }
    if (val === 'Aguardando') {
      return <FaRegClock className="faRegClock" />;
    }
    if (val === 'Agendado') {
      return <FaCalendarAlt className="faCalendarAlt" />;
    }
    if (val === 'Execução') {
      return <HiOutlineRefresh className="hiRefresh" />;
    }
    if (val === 'Reprovado') {
      return <IoMdThumbsDown className="ioThumbsDown" />;
    }
    if (val === 'Concluído') {
      return <FaRegCheckCircle className="faGrayCheck" />;
    }
    if (
      val === 'Aprovado' ||
      val === 'Pago' ||
      val === 'Entregue' ||
      val === 'Faturado'
    ) {
      return <FaCheckCircle className="faGreenCheck" />;
    }
    if (val === 'Pendência') {
      return <GoAlert className="goAlert" />;
    }
    if (val === 'Cancelado') {
      return <FaTimes className="faTimes" />;
    }
    return undefined;
  }, []);

  const financialStatusReturn = useCallback(
    ({
      due_date,
      paid_date,
      financial_category,
    }: financialStatusReturnProps): IconBaseProps | undefined => {
      if (isToday(parseISO(due_date)) && !paid_date) {
        // Hoje
        return <GoAlert className="goAlert" />;
      }
      if (paid_date) {
        // Pago
        return <FaCheckCircle className="faGreenCheck" />;
      }
      if (
        isBefore(parseISO(due_date), new Date()) &&
        !paid_date &&
        financial_category !== 'Protesto'
      ) {
        // Vencido
        return <BiCalendarX className="biCalendarX" />;
      }
      if (isAfter(parseISO(due_date), new Date()) && !paid_date) {
        // Agendado
        return <FaCalendarAlt className="faCalendarAlt" />;
      }
      if (
        isBefore(parseISO(due_date), new Date()) &&
        !paid_date &&
        financial_category === 'Protesto'
      ) {
        // Cancelado
        return <FaTimes className="faTimes" />;
      }
      return undefined;
    },
    []
  );

  return (
    <>
      {/* Verifica se a origem é Comercial */}
      {from === 'Comercial' && (
        <Container
          type="button"
          color={color}
          isCanceled={isCanceled || false}
          onClick={handleClick}
          dueDate={dueDate}
        >
          <DateField>{date}</DateField>
          <TextFlex flex="0.8">{companyName}</TextFlex>
          <TextFlex flex="1">{products}</TextFlex>
          <TextWidth>{seller}</TextWidth>
          {value && value !== '0,00' ? (
            <Value>
              R$
              <div>{value}</div>
            </Value>
          ) : (
            <Value />
          )}
          <Status isCanceled={isCanceled || false}>
            {formatOrderStatus(status) || ''}
          </Status>
        </Container>
      )}
      {/* Verifica se a origem é TechnicalArea */}
      {from === 'TechnicalArea' && (
        <Container
          type="button"
          color={color}
          isCanceled={isCanceled || false}
          onClick={handleClick}
          dueDate={dueDate}
        >
          <DateField>{date}</DateField>
          <TextFlex flex="0.8">{companyName}</TextFlex>
          <TextFlex flex="1">{products}</TextFlex>
          <TextWidth>{technical}</TextWidth>
          <DateField>{deliveryDate}</DateField>
          <Status isCanceled={isCanceled || false}>
            {formatOrderStatus(status) || ''}
          </Status>
        </Container>
      )}
      {/* Verifica se a origem é Billing */}
      {from === 'Billing' && (
        <Container
          type="button"
          color={color}
          isCanceled={isCanceled || false}
          onClick={handleClick}
          dueDate={dueDate}
        >
          <DateField>{date}</DateField>
          <TextFlex flex="0.8">{companyName}</TextFlex>
          <TextFlex flex="1">{products}</TextFlex>
          <TextWidth>{seller}</TextWidth>
          {value && value !== '0,00' ? (
            <Value>
              R$
              <div>{value}</div>
            </Value>
          ) : (
            <Value />
          )}
          <Status isCanceled={isCanceled || false}>
            {formatOrderStatus(status) || ''}
          </Status>
        </Container>
      )}
      {/* Verifica se a origem é Financial */}
      {from === 'Financial' && (
        <Container type="button" color={color} onClick={handleClick}>
          <DateField>{dueDate}</DateField>
          <DateField>{replanDate}</DateField>
          {grossValue && grossValue !== '0,00' ? (
            <Value width="9.9%" negative={grossValue < 0}>
              R$
              <div>{grossValue}</div>
            </Value>
          ) : (
            <Value />
          )}
          {netValue && netValue !== '0,00' ? (
            <Value width="9.9%" negative={netValue < 0}>
              R$
              <div>{netValue}</div>
            </Value>
          ) : (
            <Value />
          )}
          <DateField>{paidDate}</DateField>
          {paidValue && paidValue !== '0,00' ? (
            <Value width="9.9%" negative={paidValue < 0}>
              R$
              <div>{paidValue}</div>
            </Value>
          ) : (
            <Value />
          )}
          <TextFlex flex="1">{companyName}</TextFlex>
          <TextWidth width="9%">{bankAccount}</TextWidth>
          <Status>
            {financialStatusReturn({
              due_date: dueDate || '',
              paid_date: paidDate,
              financial_category: category || '',
            })}
          </Status>
        </Container>
      )}
    </>
  );
};

export default memo(RowResult);
