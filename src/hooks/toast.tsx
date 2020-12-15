import React, { createContext, useContext, useState, useCallback } from 'react';

import MaterialToast from '../components/MaterialToast';

export interface ToastContent {
  // Recebe o tipo de toast para definir a cor e o ícone
  type: 'success' | 'info' | 'warning' | 'error';
  // Recebe a descrição em texto que será exibida
  description: string;
}

export interface ToastContextData {
  addToast(content: ToastContent): void;
  handleClose(): void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const ToastProvider: React.FC = ({ children }) => {
  // Armazena se o component está aberto ou fechado
  const [open, setOpen] = useState(false);
  // Armazena o conteúdo do toast
  const [toastContent, setToastContent] = useState<ToastContent>({
    type: 'info',
    description: '',
  });

  // Função para adicionar um novo toast
  const addToast = useCallback(({ type, description }: ToastContent) => {
    // Define os valores recebidos no estado
    setToastContent({
      type,
      description,
    });

    // Define que o component deve ser exibido
    setOpen(true);
  }, []);

  // Função para fechar o component
  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, handleClose }}>
      {children}
      <MaterialToast open={open} toastContent={toastContent} />
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextData {
  const context = useContext(ToastContext);

  return context;
}
