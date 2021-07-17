import React, { useCallback, ChangeEvent } from 'react';
import { FaTimes } from 'react-icons/fa';
import {
  createMuiTheme,
  Grid,
  IconButton,
  TextField as OriginalTextField,
} from '@material-ui/core';
import NumberFormat from 'react-number-format';
import { Close } from '@material-ui/icons';
import { ThemeProvider } from '@material-ui/styles';
import { Form } from '@unform/web';
import { FormHandles } from '@unform/core';

import api from '../../services/api';

import { useToast } from '../../hooks/toast';
import { useAuth } from '../../hooks/auth';

import { ModalContainer, Header, Content, Value, Background } from './styles';
import { useOverlap } from '../../hooks/overlap';
import Button from '../Button';

// Interface da função de máscara do input Value
interface NumberFormatCustomProps {
  inputRef: (instance: NumberFormat | null) => void;
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

// Função que cria uma máscara no input Value
function NumberFormatCustom(props: NumberFormatCustomProps): JSX.Element {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(value) => {
        onChange({
          target: {
            name: props.name,
            value: value.value,
          },
        });
      }}
      thousandSeparator="."
      decimalSeparator=","
      isNumericString
      fixedDecimalScale
      prefix="R$ "
      decimalScale={2}
    />
  );
}

interface SplitPaymentWayProps {
  // Recebe a cor do módulo a partir de qual módulo este component está sendo executado
  color: string;
  // Recebe o order_id
  order_id: string;
}

const SplitPaymentWay: React.FC<SplitPaymentWayProps> = ({
  color,
  order_id,
}) => {
  // Armazena os products cadastrados no banco de dados

  const { addToast } = useToast();
  const { checkToken } = useAuth();
  const { overlapSplitPaymentWayOpen } = useOverlap();

  const splitPaymentWayMaterialTheme = createMuiTheme({
    palette: {
      primary: {
        main: color,
      },
    },
  });

  // Função para buscar na API os dados deste parcelamento

  // Função para verificar se já existe parcelamento

  // Função para lidar com o fechamento deste component
  const handleCloseWindow = useCallback(() => {
    overlapSplitPaymentWayOpen(false); // Fecha este component
  }, [overlapSplitPaymentWayOpen]);

  // Criar uma função para salvar o parcelamento

  return (
    <>
      <ThemeProvider theme={splitPaymentWayMaterialTheme}>
        <ModalContainer>
          <Header color={color}>
            <strong>PARCELAMENTO</strong>
            <button type="button" onClick={() => handleCloseWindow()}>
              <FaTimes />
            </button>
          </Header>
          <Content color={color}>
            <Form onSubmit={() => {}}>
              <Value>
                <Grid container spacing={1} alignItems="flex-end">
                  <Grid item>
                    <OriginalTextField
                      label="Valor"
                      value=""
                      onChange={() => {}}
                      InputProps={{
                        inputComponent: NumberFormatCustom as any,
                      }}
                    />
                  </Grid>
                  <Grid item>
                    {/* { Só aparece o X se tiver valor } */}
                    <IconButton onClick={() => {}}>
                      <Close />
                    </IconButton>
                  </Grid>
                </Grid>
              </Value>
              <Button>Adicionar parcela</Button>
            </Form>
          </Content>
        </ModalContainer>
      </ThemeProvider>
      <Background />
    </>
  );
};

export default SplitPaymentWay;
