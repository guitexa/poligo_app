import styled from 'styled-components';

interface ContainerProps {
  color: string;
  width?: string;
}

export const Container = styled.div<ContainerProps>`
  .MuiInput-underline::after,
  .MuiInput-underline:hover:not(.Mui-disabled)::before {
    border-color: ${({ color }) => color};
  }

  width: ${({ width }) => width || '14%'};
  max-width: 200px;

  .MuiAutocomplete-root {
    width: 100%;
  }

  .MuiInput-underline::after {
    border-color: ${({ color }) => color};
  }

  .MuiFormLabel-root.Mui-focused {
    color: ${({ color }) => color};
  }

  label {
    line-height: 0px;
    margin-left: 2px;
    font-size: 12px;
  }

  .MuiInputLabel-formControl {
    transform: translate(0, 28px) scale(1.1);
  }
  .MuiInputLabel-shrink {
    transform: translate(0px, 12px) scale(0.9);
  }

  .MuiAutocomplete-endAdornment {
    top: calc(50% - 15px);
    margin-right: 2px;
  }

  .MuiInputBase-input {
    font-size: 0.8rem;
    height: 1.95em;
    padding: 0px 30px 0 3px;
  }

  .MuiAutocomplete-inputRoot[class*='MuiInput-root']
    .MuiAutocomplete-input:first-child {
    padding: 0 0 0 4px;
    margin-bottom: -1.5px;
  }
`;
