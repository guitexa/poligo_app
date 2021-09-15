import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';

import { IUser, IBankAccount } from '../../../interfaces';
import { Container } from './styles';

type GenericType = IUser | IBankAccount;

interface AutoCompleteProps {
  color: string;
  label: string;
  value: string;
  options: (GenericType | null | undefined)[];
  onChange(e: string): void;
  width?: string;
}

const AutoComplete: React.FC<AutoCompleteProps> = ({
  color,
  label,
  value,
  options,
  onChange,
  width,
}) => {
  return (
    <Container color={color} width={width}>
      <Autocomplete
        openText=""
        clearText=""
        clearOnBlur={false}
        options={options || []}
        getOptionLabel={(e) => e?.name || ''}
        onChange={(event, selectedValue) => {
          onChange(selectedValue?.name || '');
        }}
        noOptionsText=""
        renderInput={(params) => (
          <TextField {...params} label={label} value={value} />
        )}
        renderOption={(val, { inputValue }) => {
          const matches = match(val?.name || '', inputValue);
          const parts = parse(val?.name || '', matches);

          return (
            <div>
              {parts.map(({ highlight, text }) => (
                <span
                  key={text}
                  style={{
                    fontWeight: highlight ? 700 : 400,
                  }}
                >
                  {text}
                </span>
              ))}
            </div>
          );
        }}
      />
    </Container>
  );
};

export default AutoComplete;
