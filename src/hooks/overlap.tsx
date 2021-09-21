import React, { createContext, useCallback, useContext, useState } from 'react';

interface OverlapContextProps {
  orderOpen: boolean;
  newOrderOpen: boolean;
  newProductOpen: boolean;
  productViewOpen: boolean;
  splitPaymentWayOpen: boolean;
  splitPaymentWayViewOpen: boolean;
  overlapOrderOpen(state: boolean): void;
  overlapNewOrderOpen(state: boolean): void;
  overlapNewProductOpen(state: boolean): void;
  overlapProductViewOpen(state: boolean): void;
  overlapSplitPaymentWayOpen(state: boolean): void;
  overlapSplitPaymentWayViewOpen(state: boolean): void;
  closeAllOverlaps(): void;
}

const OverlapContext = createContext<OverlapContextProps>(
  {} as OverlapContextProps
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
  // Armazena se o component SplitPaymentWay está aberto
  const [splitPaymentWayOpen, setSplitPaymentWayOpen] = useState(false);
  // Armazena se o component SplitPaymentWayView está aberto
  const [splitPaymentWayViewOpen, setSplitPaymentWayViewOpen] = useState(false);

  // Função para fechar todos os overlaps
  const closeAllOverlaps = useCallback(() => {
    setOrderOpen(false);
    setNewOrderOpen(false);
    setNewProductOpen(false);
    setProductViewOpen(false);
    setSplitPaymentWayOpen(false);
  }, []);

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

  // Função para alterar o estado do component SplitPaymentWay
  const overlapSplitPaymentWayOpen = useCallback(() => {
    setSplitPaymentWayOpen(!splitPaymentWayOpen);
  }, [splitPaymentWayOpen]);

  // Função para alterar o estado do component SplitPaymentWayView
  const overlapSplitPaymentWayViewOpen = useCallback(() => {
    setSplitPaymentWayViewOpen(!splitPaymentWayViewOpen);
  }, [splitPaymentWayViewOpen]);

  return (
    <OverlapContext.Provider
      value={{
        orderOpen,
        newOrderOpen,
        newProductOpen,
        productViewOpen,
        splitPaymentWayOpen,
        splitPaymentWayViewOpen,
        overlapOrderOpen,
        overlapNewOrderOpen,
        overlapNewProductOpen,
        overlapProductViewOpen,
        overlapSplitPaymentWayOpen,
        overlapSplitPaymentWayViewOpen,
        closeAllOverlaps,
      }}
    >
      {children}
    </OverlapContext.Provider>
  );
};

export function useOverlap(): OverlapContextProps {
  const context = useContext(OverlapContext);

  return context;
}
