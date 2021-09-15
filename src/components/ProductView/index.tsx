import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { useOverlap } from '../../hooks/overlap';
import { formatValueCurrency } from '../../utils';

import { IOrderProduct } from '../../interfaces';

import { ModalContainer, Header, Content, Background } from './styles';

interface ProductViewProps {
  // Recebe a cor do módulo a partir de qual módulo este component está sendo executado
  color: string;
  // Recebe as informações para serem exibidas
  orderProduct: IOrderProduct;
  // A partir de qual módulo este component está sendo executado
  from: string;
}

const ProductView: React.FC<ProductViewProps> = ({
  color,
  orderProduct,
  from,
}) => {
  const { overlapProductViewOpen } = useOverlap();

  return (
    // Verifica se possui orderProduct para carregar as informações
    orderProduct?.product && (
      <>
        <ModalContainer>
          <Header color={color}>
            <strong>{orderProduct.product.name}</strong>
            <button type="button" onClick={() => overlapProductViewOpen(false)}>
              <FaTimes />
            </button>
          </Header>
          <Content>
            <div>
              <strong>Descrição:</strong>
              <p>{orderProduct.product_description}</p>
            </div>
            {from !== 'TechnicalArea' && (
              <div>
                <strong>Valor:</strong>
                <p>{formatValueCurrency(Number(orderProduct.product_value))}</p>
              </div>
            )}
          </Content>
        </ModalContainer>
        <Background
          type="button"
          onClick={() => overlapProductViewOpen(false)}
        />
      </>
    )
  );
};

export default ProductView;
