import styled from 'styled-components';

interface HeaderProps {
  color: string;
}

export const Background = styled.button`
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
  outline: none;
  border: none;
  cursor: default;
`;

export const ModalContainer = styled.div`
  position: absolute;
  width: 60vw;
  background: #ffffff;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  padding: 10px 20px;
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

export const Content = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  div {
    width: 100%;
    margin: 10px 0;

    strong {
      text-transform: uppercase;
      font-size: 12px;
      line-height: 25px;
    }
  }
`;
