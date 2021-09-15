import styled, { css } from 'styled-components';

interface InputProps {
  isErrored: boolean;
}

export const Container = styled.div<InputProps>`
  width: 100%;
  display: flex;
  align-items: center;
  border: none;
  box-sizing: border-box;
  transition: all 0.2s;
  position: relative;

  ${({ isErrored }) =>
    isErrored &&
    css`
      &:before {
        content: '';
        position: absolute;
        width: 100%;
        bottom: 1px;
        border-bottom: 1px solid #9d1309;
      }
    `};

  & + div {
    margin-top: 10px;
  }

  input {
    width: 100%;
    min-width: 50px;
    color: #222;
    background: transparent;
    flex: 1;
    border: none;
    font-size: 13px;
    line-height: 1.6em;
    color: #222;

    &::placeholder {
      font-size: 13px;
      color: #333;
    }
  }
`;
