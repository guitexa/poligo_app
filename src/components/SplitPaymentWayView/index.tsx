import React, { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';

import { formatToDate } from 'brazilian-values';
import { parseISO } from 'date-fns';
import api from '../../services/api';

import { useToast } from '../../hooks/toast';
import { useOverlap } from '../../hooks/overlap';

import { formatValueCurrency } from '../../utils';

import { ISplitPaymentWay, ISplitsPaymentWay } from '../../interfaces';

import {
  ModalContainer,
  Header,
  Content,
  Background,
  EnterPayment,
  DividedPayment,
  TotalValue,
} from './styles';

interface SplitPaymentWayViewProps {
  // Recebe a cor do módulo a partir de qual módulo este component está sendo executado
  color: string;
  // Recebe o order_id
  order_id: string;
  // Recebe o valor do pedido
  order_total_value: number;
}

const SplitPaymentWayView: React.FC<SplitPaymentWayViewProps> = ({
  color,
  order_id,
  order_total_value,
}) => {
  // Armazena os splitsPaymentWay cadastrados no banco de dados
  const [splitsPaymentWay, setSplitsPaymentWay] = useState<ISplitsPaymentWay>(
    {} as ISplitsPaymentWay
  );

  const { addToast } = useToast();
  const { overlapSplitPaymentWayViewOpen } = useOverlap();

  // Função para buscar na API os dados deste parcelamento
  useEffect(() => {
    api
      .get<ISplitPaymentWay[]>(`/splits-payment-way/${order_id}`)
      .then((response) => {
        if (response.data.length > 0) {
          // Verifica se é 'Com entrada' ou 'Sem entrada'
          if (
            response.data[0].payment_way === 'Com entrada' ||
            response.data[0].payment_way === 'Sem entrada'
          ) {
            // Busca a entrada
            const enter_payment = response.data.find(
              (i) => i.split_number === '0'
            );

            // Buscar as parcelas
            const splits = response.data
              .filter((i) => i.split_number !== '0')
              ?.sort((a, b) => {
                if (
                  a.split_number &&
                  b.split_number &&
                  a.split_number < b.split_number
                )
                  return -1;
                if (
                  a.split_number &&
                  b.split_number &&
                  a.split_number > b.split_number
                )
                  return 1;
                return 0;
              });

            const firstSplit = splits[0];

            // Define no estado os valores encontrados na API
            setSplitsPaymentWay({
              payment_way: firstSplit.payment_way || '',
              splits,
              enter_due_date: String(enter_payment?.split_due_date),
              formatted_enter_due_date: enter_payment?.split_due_date
                ? formatToDate(parseISO(enter_payment.split_due_date))
                : undefined,
              enter_value: enter_payment
                ? formatValueCurrency(enter_payment.split_value)
                : undefined,
              enter_payment_method: enter_payment?.payment_method,
              splits_quantity: splits.length,
              split_due_date: String(firstSplit.split_due_date),
              formatted_split_due_date: firstSplit.split_due_date
                ? formatToDate(parseISO(firstSplit.split_due_date))
                : undefined,
              split_value: firstSplit.split_value,
              formatted_split_value: formatValueCurrency(
                firstSplit.split_value
              ),
              split_payment_method: firstSplit.payment_method,
            });
          }
        }
      })
      .catch(() => {
        addToast({
          type: 'error',
          description: '#0270 - Erro ao carregar o parcelamento cadastrado',
        });
      });
  }, [addToast, order_id]);

  return (
    // Verifica se possui orderProduct para carregar as informações
    <>
      <ModalContainer>
        <Header color={color}>
          {splitsPaymentWay.payment_way === 'Com entrada' ? (
            <strong>COM ENTRADA</strong>
          ) : (
            <strong>SEM ENTRADA</strong>
          )}
          <button
            type="button"
            onClick={() => overlapSplitPaymentWayViewOpen(false)}
          >
            <FaTimes />
          </button>
        </Header>
        <Content>
          {splitsPaymentWay.payment_way === 'Com entrada' && (
            <EnterPayment>
              <div>
                <div>
                  <strong>Meio de pagamento:</strong>
                  <p>
                    {splitsPaymentWay.enter_payment_method &&
                      (splitsPaymentWay.enter_payment_method.name as string)}
                  </p>
                </div>
              </div>
              <div>
                <div>
                  <strong>Valor entrada:</strong>
                  <p>
                    {splitsPaymentWay.enter_value &&
                      splitsPaymentWay.enter_value}
                  </p>
                </div>
                <div>
                  <strong>Vencimento:</strong>
                  <p>
                    {splitsPaymentWay.formatted_enter_due_date &&
                      splitsPaymentWay.formatted_enter_due_date}
                  </p>
                </div>
              </div>
            </EnterPayment>
          )}
          {(splitsPaymentWay.payment_way === 'Com entrada' ||
            splitsPaymentWay.payment_way === 'Sem entrada') && (
            <DividedPayment>
              <div>
                <div>
                  <strong>Meio de pagamento:</strong>
                  <p>
                    {splitsPaymentWay.split_payment_method &&
                      (splitsPaymentWay.split_payment_method.name as string)}
                  </p>
                </div>
                <div>
                  <strong>Parcelas:</strong>
                  <p>{splitsPaymentWay.splits_quantity}</p>
                </div>
              </div>
              <div>
                <div>
                  <strong>Valor parcela:</strong>
                  <p>{splitsPaymentWay.formatted_split_value}</p>
                </div>
                <div>
                  <strong>1º vencimento:</strong>
                  <p>{splitsPaymentWay.formatted_split_due_date}</p>
                </div>
              </div>
            </DividedPayment>
          )}
        </Content>
        <TotalValue color={color}>
          <div>
            <p>Valor total</p>
            <p>{formatValueCurrency(order_total_value)}</p>
          </div>
        </TotalValue>
      </ModalContainer>
      <Background
        type="button"
        onClick={() => overlapSplitPaymentWayViewOpen(false)}
      />
    </>
  );
};

export default SplitPaymentWayView;
