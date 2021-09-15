import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Search from '@material-ui/icons/Search';
import Close from '@material-ui/icons/Close';

import { Container } from './styles';

interface NumberProps {
  color: string;
  label: string;
  value: string;
  onChange(e: string): void;
  width?: string;
}

const Number: React.FC<NumberProps> = ({
  color,
  label,
  value,
  onChange,
  width,
}) => {
  return (
    <Container color={color} width={width}>
      <Grid container spacing={1} alignItems="flex-end">
        <Grid item>
          <TextField
            label={label}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            name="formattedValue"
          />
        </Grid>
        <Grid item>
          {value ? (
            <IconButton onClick={() => onChange('')}>
              <Close />
            </IconButton>
          ) : (
            <Search />
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Number;
