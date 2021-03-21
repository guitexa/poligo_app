import React from 'react';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import { IconButton, Grid } from '@material-ui/core';
import { Close } from '@material-ui/icons';

import { Container } from './styles';

interface DateProps {
  isFilled: boolean;
  color: string;
  label: string;
  value: Date | null;
  onChange(e: Date | null): void;
}

const Date: React.FC<DateProps> = ({
  color,
  isFilled,
  label,
  value,
  onChange,
}) => {
  return (
    <Container color={color} isFilled={isFilled}>
      <Grid container alignItems="flex-end">
        <Grid item>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              disableToolbar
              variant="inline"
              autoOk
              helperText=""
              label={label}
              format="dd/MM/yyyy"
              value={value}
              onChange={(e) => onChange(e)}
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
            />
          </MuiPickersUtilsProvider>
        </Grid>
        <Grid item>
          {value && (
            <IconButton className="close-button" onClick={() => onChange(null)}>
              <Close />
            </IconButton>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Date;
