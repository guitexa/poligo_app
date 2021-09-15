import styled from 'styled-components';

interface ContainerProps {
  color: string;
}

interface StatusProps {
  value: boolean;
}

export const Container = styled.div<ContainerProps>`
  width: 100%;
  height: 45px;
  position: fixed;
  top: 50px;
  right: 0;
  left: 0;
  padding: 0 15px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  z-index: 0;
  overflow: hidden;
  background: #fff;

  .MuiInput-underline::after,
  .MuiInput-underline:hover:not(.Mui-disabled)::before {
    border-color: ${({ color }) => color};
  }

  > div {
    & + div {
      margin-left: 10px;
    }
  }
`;

export const Status = styled.div<StatusProps>`
  width: 8%;
  max-width: 80px;

  .MuiListItem-root.Mui-selected,
  .MuiListItem-root.Mui-selected:hover {
    background: #222;
  }

  .MuiFormControl-root {
    width: 100%;
    margin: 0;
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

  .MuiInputBase-input {
    font-size: 0.9rem;
    height: 1.6em;
    padding: 0px 30px 0 4px;
    margin-bottom: -3px;
    display: flex;
    justify-content: center;
  }

  .MuiInputLabel-formControl {
    transform: translate(1px, 24px) scale(1.1);
  }

  .MuiInputLabel-shrink {
    transform: ${({ value }) =>
      value
        ? 'translate(0.5px, 8px) scale(0.9)'
        : 'translate(1px, 24px) scale(1.1)'};
  }

  .MuiSelect-icon {
    top: calc(50% - 15px);
    margin-right: 2px;
  }

  .MuiSelect-select:focus {
    background: transparent;
  }
`;
