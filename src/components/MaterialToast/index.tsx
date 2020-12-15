import React, { forwardRef } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';

import { useToast } from '../../hooks/toast';

interface ToastContent {
  // Controla se o component é exibido ou não
  open: boolean;
  // Determina o conteúdo do toast
  toastContent: {
    type: 'success' | 'info' | 'warning' | 'error';
    description: string;
  };
}

const Alert = forwardRef((props: AlertProps, ref) => (
  <MuiAlert elevation={0} variant="filled" {...props} ref={ref} />
));

function SlideTransition(props: TransitionProps): JSX.Element {
  return <Slide {...props} direction="down" />;
}

const MaterialToast: React.FC<ToastContent> = ({ open, toastContent }) => {
  const { handleClose } = useToast();

  return (
    <>
      <Snackbar
        style={{ zIndex: 99999 }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        open={open}
        autoHideDuration={2000}
        onClose={() => setTimeout(handleClose, 2000)}
        TransitionComponent={SlideTransition}
      >
        <Alert severity={toastContent.type}>{toastContent.description}</Alert>
      </Snackbar>
    </>
  );
};

export default MaterialToast;
