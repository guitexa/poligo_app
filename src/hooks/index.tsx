import React from 'react';

import { AuthProvider } from './auth';
import { ToastProvider } from './toast';
import { OrdersSearchProvider } from './orders_search';
import { FinancialsSearchProvider } from './financials_search';
import { OverlapProvider } from './overlap';

const AppProvider: React.FC = ({ children }) => {
  return (
    <AuthProvider>
      <OverlapProvider>
        <FinancialsSearchProvider>
          <OrdersSearchProvider>
            <ToastProvider>{children}</ToastProvider>
          </OrdersSearchProvider>
        </FinancialsSearchProvider>
      </OverlapProvider>
    </AuthProvider>
  );
};

export default AppProvider;
