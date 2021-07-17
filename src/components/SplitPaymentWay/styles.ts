import styled from 'styled-components';

interface ContentProps {
  color: string;
}

interface HeaderProps {
  color: string;
}

export const Background = styled.div`
  position: absolute;
  display: flex;
  top: 50px;
  right: 0;
  left: 0;
  width: 100vw;
  bottom: 0;
  overflow: hidden;
  z-index: 100;
  background: #000;
  opacity: 0.7;
`;

export const ModalContainer = styled.div`
  position: absolute;
  background: #ffffff;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  padding: 10px 20px 20px 20px;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 200;
`;

export const Header = styled.div<HeaderProps>`
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;

  strong {
    font-size: 20px;
    padding-top: 10px;
  }

  button {
    position: absolute;
    top: -8px;
    right: -18px;
    background: transparent;
    border: none;
    outline: none;
    width: 38px;
    height: 38px;

    &:hover {
      svg {
        opacity: 1;
      }
    }

    svg {
      color: ${({ color }) => color};
      width: 38px;
      height: 38px;
      padding: 8px;
      opacity: 0.4;
      transition: 0.2s all;
    }
  }
`;

export const Content = styled.div<ContentProps>`
  width: 100%;

  form {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
  }

  .MuiInput-underline:hover:not(.Mui-disabled)::before {
    border-color: ${({ color }) => color};
  }
`;

export const Value = styled.div`
  width: 25%;
  min-width: 100px;
  margin: 10px 0 20px 0;
  max-width: 150px;

  .MuiFormControl-root {
    width: 100%;
  }

  label {
    line-height: 0px;
    margin-left: 2px;
    font-size: 1rem;
  }

  .MuiInputLabel-formControl {
    transform: translate(1px, 17.5px) scale(1);
  }
  .MuiInputLabel-shrink {
    transform: translate(0px, 0px) scale(0.7);
  }

  #date-picker-dialog-helper-text,
  #date-picker-inline-helper-text {
    display: none;
  }

  .MuiInputBase-input {
    font-size: 1rem;
    height: 1.9em;
    padding: 0px 30px 0 3px;
    margin-bottom: -2px;
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
    margin: 0 0px 1px 2px;
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
