import styled, { keyframes } from 'styled-components';
import { shade } from 'polished';

interface ContentProps {
  color: string;
}

interface ClientNameProps {
  clientNameOpen: boolean;
}

interface ClientCnpjProps {
  clientCnpjOpen: boolean;
}

interface ClientCpfProps {
  clientCpfOpen: boolean;
}

interface ClientNameContactProps {
  clientNameContactOpen: boolean;
}

interface ClientEmailProps {
  clientEmailOpen: boolean;
}

interface ClientPhoneProps {
  clientPhoneOpen: boolean;
}

interface CompMobilePhoneProps {
  clientMobilePhoneOpen: boolean;
}

interface ProgressProps {
  color: string;
  counterAnswers: number;
}

interface ButtonsControlProps {
  color: string;
}

interface ConfirmDataProps {
  confirmDataOpen: boolean;
  color: string;
}

const opacityEffect = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const OrderOverlap = styled.div`
  z-index: 100;
`;

export const NewOrderOverlap = styled.div`
  > button {
    position: absolute;
    top: 8px;
    right: 15px;
  }
`;

export const Container = styled.div`
  position: absolute;
  display: flex;
  top: 50px;
  right: 0;
  left: 0;
  bottom: 0;
  width: 100vw;
  overflow: hidden;
  z-index: -1;
  background: #fff;
`;

export const Content = styled.div<ContentProps>`
  .individual-form {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    width: 100vw;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding-top: 25vh;

    > div {
      width: 50%;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      margin-bottom: 5%;
    }
  }

  .MuiInput-underline:hover:not(.Mui-disabled)::before {
    border-color: ${({ color }) => color};
  }

  .disabled-button {
    margin-top: 15px;
  }
`;

export const AskTitle = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 30px;

  div:nth-child(1) {
    position: absolute;
    top: 0;
    right: 100%;
    color: #999;
    width: 50px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-right: 5px;
    font-size: 17px;

    svg {
      width: 12px;
      height: 12px;
      margin-top: 1px;
      color: #999;
    }
  }
`;

export const SubmitQuestionButton = styled.div`
  margin-top: 15px;
  display: flex;
  justify-content: flex-start;
  align-items: center;

  div {
    display: flex;
    justify-content: flex-start;
    align-items: flex-end;
    margin-left: 20px;

    span:nth-child(1) {
      font-size: 13px;
    }

    span:nth-child(2) {
      margin-left: 5px;
      font-size: 17px;
    }
  }
`;

export const WhatIsClientName = styled.div<ClientNameProps>`
  display: ${({ clientNameOpen }) => (clientNameOpen ? 'flex' : 'none')};

  .MuiAutocomplete-root {
    width: 100%;
  }

  .MuiFormLabel-root.Mui-focused {
    color: ${({ color }) => color};
  }

  .MuiAutocomplete-endAdornment {
    top: calc(50% - 14px);
    margin-right: 2px;
  }

  .MuiInputBase-input {
    font-size: 1rem;
    height: 2em;
    padding: 0px 30px 0 3px;
  }

  .MuiAutocomplete-inputRoot[class*='MuiInput-root'] {
    padding: 0;

    .MuiAutocomplete-input:first-child {
      padding: 0 0 0 4px;
      margin-bottom: -1px;
    }
  }
`;

export const WhatIsClientCnpj = styled.div<ClientCnpjProps>`
  display: ${({ clientCnpjOpen }) => (clientCnpjOpen ? 'flex' : 'none')};

  .MuiFormControl-root {
    width: 100%;
  }

  .MuiInputBase-input {
    font-size: 1rem;
    height: 2em;
    padding: 0px 30px 0px 4px;
    margin-bottom: -1px;
  }

  .MuiInputBase-root {
    width: calc(100% + 28px);
  }

  .MuiIconButton-root {
    padding: 3px;
    margin: 4px 0px 1px 2px;
  }

  .MuiSvgIcon-root {
    font-size: 1.23rem;
    color: #0000008a;
  }
`;

export const WhatIsClientCpf = styled.div<ClientCpfProps>`
  display: ${({ clientCpfOpen }) => (clientCpfOpen ? 'flex' : 'none')};

  .MuiFormControl-root {
    width: 100%;
  }

  .MuiInputBase-input {
    font-size: 1rem;
    height: 2em;
    padding: 0px 30px 0px 4px;
    margin-bottom: -1px;
  }

  .MuiInputBase-root {
    width: calc(100% + 28px);
  }

  .MuiIconButton-root {
    padding: 3px;
    margin: 4px 0px 1px 2px;
  }

  .MuiSvgIcon-root {
    font-size: 1.23rem;
    color: #0000008a;
  }
`;

export const WhatIsClientNameContact = styled.div<ClientNameContactProps>`
  display: ${({ clientNameContactOpen }) =>
    clientNameContactOpen ? 'flex' : 'none'};

  .MuiFormControl-root {
    width: 100%;
  }

  .MuiInputBase-input {
    font-size: 1rem;
    height: 2em;
    padding: 0px 30px 0px 4px;
    margin-bottom: -1px;
  }

  .MuiInputBase-root {
    width: calc(100% + 28px);
  }

  .MuiIconButton-root {
    padding: 3px;
    margin: 4px 0px 1px 2px;
  }

  .MuiSvgIcon-root {
    font-size: 1.23rem;
    color: #0000008a;
  }
`;

export const WhatIsClientEmail = styled.div<ClientEmailProps>`
  display: ${({ clientEmailOpen }) => (clientEmailOpen ? 'flex' : 'none')};

  .MuiFormControl-root {
    width: 100%;
  }

  .MuiInputBase-input {
    font-size: 1rem;
    height: 2em;
    padding: 0px 30px 0px 4px;
    margin-bottom: -1px;
  }

  .MuiInputBase-root {
    width: calc(100% + 28px);
  }

  .MuiIconButton-root {
    padding: 3px;
    margin: 4px 0px 1px 2px;
  }

  .MuiSvgIcon-root {
    font-size: 1.23rem;
    color: #0000008a;
  }
`;

export const WhatIsClientPhone = styled.div<ClientPhoneProps>`
  display: ${({ clientPhoneOpen }) => (clientPhoneOpen ? 'flex' : 'none')};

  .MuiFormControl-root {
    width: 100%;
  }

  .MuiInputBase-input {
    font-size: 1rem;
    height: 2em;
    padding: 0px 30px 0px 4px;
    margin-bottom: -1px;
  }

  .MuiInputBase-root {
    width: calc(100% + 28px);
  }

  .MuiIconButton-root {
    padding: 3px;
    margin: 4px 0px 1px 2px;
  }

  .MuiSvgIcon-root {
    font-size: 1.23rem;
    color: #0000008a;
  }
`;

export const WhatIsClientMobilePhone = styled.div<CompMobilePhoneProps>`
  display: ${({ clientMobilePhoneOpen }) =>
    clientMobilePhoneOpen ? 'flex' : 'none'};

  .MuiFormControl-root {
    width: 100%;
  }

  .MuiInputBase-input {
    font-size: 1rem;
    height: 2em;
    padding: 0px 30px 0px 4px;
    margin-bottom: -1px;
  }

  .MuiInputBase-root {
    width: calc(100% + 28px);
  }

  .MuiIconButton-root {
    padding: 3px;
    margin: 4px 0px 1px 2px;
  }

  .MuiSvgIcon-root {
    font-size: 1.23rem;
    color: #0000008a;
  }
`;

export const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  position: absolute;
  bottom: 15px;
  right: 15px;
  z-index: 30;
`;

export const Progress = styled.div<ProgressProps>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-right: 10px;
  width: 150px;

  span {
    font-size: 12px;
    margin-bottom: 2px;
  }

  .progress-bar {
    width: ${({ counterAnswers }) =>
      counterAnswers === 1
        ? '16%'
        : counterAnswers === 2
        ? '33%'
        : counterAnswers === 3
        ? '50%'
        : counterAnswers === 4
        ? '66%'
        : counterAnswers === 5
        ? '83%'
        : counterAnswers === 6
        ? '100%'
        : 0};
    height: 6px;
    background: ${({ color }) => color};
    border-radius: 3px;
    margin-bottom: -6px;
    z-index: 20;
    transition: 0.2s all;
  }

  .bg-progress-bar {
    width: 100%;
    height: 6px;
    background: #dfdfdf;
    border-radius: 3px;
    z-index: 15;
  }
`;

export const ButtonsControl = styled.div<ButtonsControlProps>`
  display: flex;
  justify-content: space-between;

  button {
    width: 35px;
    height: 35px;
    background: ${({ color }) => color};
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    outline: none;
    transition: 0.2s all;

    &:hover {
      background: ${({ color }) => shade(0.2, color)};
    }

    & + button {
      margin-left: 2px;
    }

    svg {
      color: #fff;
      width: 30px;
      height: 30px;
    }
  }
`;

export const ConfirmData = styled.div<ConfirmDataProps>`
  display: ${({ confirmDataOpen }) => (confirmDataOpen ? 'flex' : 'none')};
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  width: 100vw;
  overflow: auto;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #fff;
  animation: ${opacityEffect} 0.5s;
  z-index: 10;
`;

export const QuestionData = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const QuestionsContainer = styled.div`
  width: 40%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 15px;

  p {
    padding: 10px 0;
    color: #888;
  }
`;

export const AnswersContainer = styled.div`
  width: 60%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: flex-start;

  p {
    padding: 10px 0;
    color: #222;
  }
`;

export const SubmitFormButton = styled.div`
  width: 100%;
  margin-top: 15px;
  padding-left: calc(40% + 10px);
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;
