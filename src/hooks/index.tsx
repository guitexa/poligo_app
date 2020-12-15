import React from 'react';

import { AuthProvider } from './auth';
import { ToastProvider } from './toast';
import { SearchProvider } from './search';
import { OverlapProvider } from './overlap';

const AppProvider: React.FC = ({ children }) => {
  return (
    <AuthProvider>
      <OverlapProvider>
        <SearchProvider>
          <ToastProvider>{children}</ToastProvider>
        </SearchProvider>
      </OverlapProvider>
    </AuthProvider>
  );
};

export default AppProvider;
