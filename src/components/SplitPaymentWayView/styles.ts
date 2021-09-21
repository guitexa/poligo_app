import styled from 'styled-components';

interface HeaderProps {
  color: string;
}

interface TotalValueProps {
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

  strong {
    font-size: 20px;
    padding: 10px 30px;
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
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;

  strong {
    white-space: nowrap;
    text-transform: uppercase;
    font-size: 12px;
    line-height: 15px;
  }

  & > div > div {
    width: 100%;
    display: flex;

    div {
      margin: 10px;
    }
  }
`;

export const EnterPayment = styled.div`
  display: flex;
  flex-direction: column;
  padding-right: 10px;
  margin: 10px 10px 10px 0;
  border-right: 1px dashed #888;
  align-items: center;
`;

export const DividedPayment = styled.div`
  display: flex;
  flex-direction: column;
  margin: 10px 0;
  align-items: center;
`;

export const TotalValue = styled.div<TotalValueProps>`
  width: 100%;
  display: flex;
  justify-content: center;
  cursor: default;
  margin: -38px 0 -20px 0;

  div {
    background: ${({ color }) => color};
    opacity: 0.7;
    color: #fff;
    border-radius: 4px 4px 0 0;
    border: none;
    padding: 10px 15px;
    transition: all 0.2s;

    &:hover {
      opacity: 1;
    }
  }

  p:nth-child(1) {
    font-size: 0.8rem;
    padding-bottom: 2px;
  }

  p:nth-child(2) {
    font-weight: bold;
    font-size: 20px;
  }
`;
