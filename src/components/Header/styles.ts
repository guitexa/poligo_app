import styled from 'styled-components';
import { shade } from 'polished';

import Logotipo from '../../assets/logotipo.svg';

interface ContainerProps {
  color: string;
}

interface CoverProps {
  menuIsOpen: boolean;
}

interface MenuProps {
  menuIsOpen: boolean;
}

export const Container = styled.div<ContainerProps>`
  width: 100%;
  height: 50px;
  background: ${({ color }) => color};
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  padding: 0 15px 0 70px;
  justify-content: space-between;
  z-index: 10;

  div {
    display: flex;

    button + button {
      margin-left: 15px;
    }
  }
`;

export const Menu = styled.div<MenuProps>`
  position: absolute;
  top: 0;
  left: 0;
  width: 150px;
  height: 50px;
  padding-left: 15px;
  background: url(${Logotipo}) no-repeat left 15px center;
  background-size: 40px 40px;
  cursor: pointer;
  z-index: 99999;

  #comercial {
    background: #004a82;

    &:hover {
      background: ${shade(0.1, '#004a82')};
    }
  }

  #technical-area {
    background: #1c8f07;

    &:hover {
      background: ${shade(0.1, '#1c8f07')};
    }
  }

  #billing {
    background: #c9a100;

    &:hover {
      background: ${shade(0.1, '#c9a100')};
    }
  }

  #financial {
    background: #851800;

    &:hover {
      background: ${shade(0.1, '#851800')};
    }
  }

  #reception {
    background: #246ce5;

    &:hover {
      background: ${shade(0.1, '#246CE5')};
    }
  }

  #settings {
    background: #363635;

    &:hover {
      background: ${shade(0.1, '#363635')};
    }
  }

  #exit {
    background: #111;

    &:hover {
      background: #000;
    }
  }

  #sub-menu {
    width: 220px;
    position: absolute;
    top: 50px;
    left: 0;
    opacity: ${({ menuIsOpen }) => (menuIsOpen ? 1 : 0)};
    visibility: ${({ menuIsOpen }) => (menuIsOpen ? 'visible' : 'hidden')};
    transition: 0.2s all;
    padding-top: 1px;
    cursor: default;

    a {
      display: inline-flex;
      align-items: center;
      padding: 10px 15px;
      text-decoration: none;
      color: #fff;
      transition: 0.2s all;
      border-radius: 0 4px 4px 0;
      margin: 1px 0;

      img {
        width: 40px;
        max-height: 45px;
      }

      div {
        margin-left: 12px;

        .title {
          font-size: 16px;
        }

        .text {
          margin-top: 2px;
          font-size: 10px;
          line-height: 10px;
        }
      }
    }

    button {
      display: inline-flex;
      padding: 10px 20px;
      text-decoration: none;
      color: #fff;
      align-items: center;
      position: initial;
      opacity: initial;
      outline: none;
      border: none;
      border-radius: 0 4px 4px 0;

      img {
        margin-left: 5px;
        width: 20px;
      }

      .title {
        font-size: 16px;
        margin-left: 20px;
      }
    }
  }

  #icon {
    width: 50px;
    height: 50px;
  }
`;

export const Title = styled.div`
  color: #fff;
  font-size: 20px;
`;

export const Cover = styled.button<CoverProps>`
  position: absolute;
  display: flex;
  top: 50px;
  right: 0;
  left: 0;
  width: 100vw;
  bottom: 0;
  overflow: hidden;
  background: #000000;
  z-index: 9999;
  opacity: ${({ menuIsOpen }) => (menuIsOpen ? 0.7 : 0)};
  visibility: ${({ menuIsOpen }) => (menuIsOpen ? 'visible' : 'hidden')};
  outline: none;
  border: none;
  cursor: default;
`;
