import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Close from '@material-ui/icons/Close';
import Search from '@material-ui/icons/Search';

import { Container } from './styles';

interface TextProps {
  color: string;
  label: string;
  value: string;
  onChange(e: string): void;
  flex: string;
}

const Text: React.FC<TextProps> = ({ color, label, value, onChange, flex }) => {
  return (
    <Container color={color} flex={flex}>
      <Grid container spacing={1} alignItems="flex-end">
        <Grid item>
          <TextField
            label={label}
            value={value}
            onChange={(e) => onChange(e.target.value)}
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

export default Text;
