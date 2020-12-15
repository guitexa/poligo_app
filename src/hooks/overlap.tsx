import React, { createContext, useCallback, useContext, useState } from 'react';

interface OverlapContextData {
  orderOpen: boolean;
  newOrderOpen: boolean;
  newProductOpen: boolean;
  productViewOpen: boolean;
  overlapOrderOpen(state: boolean): void;
  overlapNewOrderOpen(state: boolean): void;
  overlapNewProductOpen(state: boolean): void;
  overlapProductViewOpen(state: boolean): void;
}

const OverlapContext = createContext<OverlapContextData>(
  {} as OverlapContextData
);

export const OverlapProvider: React.FC = ({ children }) => {
  // Armazena se o component Order está aberto
  const [orderOpen, setOrderOpen] = useState(false);
  // Armazena se o component NewOrder está aberto
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  // Armazena se o component NewProduct está aberto
  const [newProductOpen, setNewProductOpen] = useState(false);
  // Armazena se o component ProductView está aberto
  const [productViewOpen, setProductViewOpen] = useState(false);

  // Função para alterar o estado do component Order
  const overlapOrderOpen = useCallback(() => {
    setOrderOpen(!orderOpen);
  }, [orderOpen]);

  // Função para alterar o estado do component NewOrder
  const overlapNewOrderOpen = useCallback(() => {
    setNewOrderOpen(!newOrderOpen);
  }, [newOrderOpen]);

  // Função para alterar o estado do component NewProduct
  const overlapNewProductOpen = useCallback(() => {
    setNewProductOpen(!newProductOpen);
  }, [newProductOpen]);

  // Função para alterar o estado do component ProductView
  const overlapProductViewOpen = useCallback(() => {
    setProductViewOpen(!productViewOpen);
  }, [productViewOpen]);

  return (
    <OverlapContext.Provider
      value={{
        orderOpen,
        newOrderOpen,
        newProductOpen,
        productViewOpen,
        overlapOrderOpen,
        overlapNewOrderOpen,
        overlapNewProductOpen,
        overlapProductViewOpen,
      }}
    >
      {children}
    </OverlapContext.Provider>
  );
};

export function useOverlap(): OverlapContextData {
  const context = useContext(OverlapContext);

  return context;
}
