import styled from 'styled-components';

interface ContainerProps {
  color: string;
  isFilled: boolean;
}

export const Container = styled.div<ContainerProps>`
  .MuiInput-underline::after,
  .MuiInput-underline:hover:not(.Mui-disabled)::before {
    border-color: ${({ color }) => color};
  }

  width: 9.5%;
  max-width: 100px;

  label {
    line-height: 0px;
    margin-left: 2px;
    font-size: 12px;
  }

  .MuiInputLabel-formControl {
    transform: translate(0, 16px) scale(1.1);
  }
  .MuiInputLabel-shrink {
    transform: translate(0.5px, 1.5px) scale(0.9);
  }

  #date-picker-dialog-helper-text,
  #date-picker-inline-helper-text {
    display: none;
  }

  .MuiGrid-container {
    flex-wrap: inherit;
  }

  .MuiInputBase-input {
    font-size: 0.8rem;
    height: 1.8em;
    padding: 0px 0 0 4px;
    margin-right: -10px;
  }

  .MuiIconButton-root {
    padding: ${({ isFilled }) => (isFilled ? '3px' : '6px')};
    margin: ${({ isFilled }) => (isFilled ? '0 0 -1px -25px' : '0 -2px 1px 0')};
    display: ${({ isFilled }) => (isFilled ? 'none' : 'flex')};
  }

  .close-button {
    display: ${({ isFilled }) => (isFilled ? 'flex' : 'none')};
  }

  .MuiSvgIcon-root {
    font-size: ${({ isFilled }) => (isFilled ? '1.23rem' : '1rem')};
    margin-top: '2px';
  }

  .MuiInputBase-root {
    margin-top: 4.5px;
  }
`;
