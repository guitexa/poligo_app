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

  width: ${({ width }) => width || '11%'};
  max-width: 120px;

  .MuiFormControl-root {
    width: 100%;
  }

  label {
    line-height: 0px;
    margin-left: 2px;
    font-size: 12px;
  }

  .MuiInputLabel-formControl {
    transform: translate(0px, 17px) scale(1.1);
  }
  .MuiInputLabel-shrink {
    transform: translate(1px, 1.5px) scale(0.9);
  }

  #date-picker-dialog-helper-text,
  #date-picker-inline-helper-text {
    display: none;
  }

  .MuiInputBase-input {
    font-size: 0.8rem;
    height: 1.95em;
    padding: 0px 25px 0 4px;
    margin-bottom: -1px;
  }

  .MuiTypography-root {
    margin: 2px 0 1px 2px;
    font-size: 0.75rem;
  }

  .MuiInputBase-root {
    margin-top: 4px;
    width: calc(100% + 28px);
  }

  .MuiIconButton-root {
    padding: 3px;
    margin: 0 0px -1px 2px;
  }

  .MuiSvgIcon-root {
    font-size: 1.23rem;
    color: #0000008a;
  }

  .MuiGrid-container {
    width: 100%;
    margin: 0;

    .MuiGrid-item:nth-child(1) {
      width: calc(100% - 28px);
    }

    .MuiGrid-item {
      padding: 0;

      & > .MuiSvgIcon-root {
        margin: 0 0 -2px 5px;
      }
    }
  }
`;
