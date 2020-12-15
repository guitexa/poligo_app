import styled, { keyframes } from 'styled-components';

import Background from '../../assets/bg.png';

export const Container = styled.div`
  background: url(${Background}) no-repeat center center fixed;
  background-size: cover;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const enterEffect = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${enterEffect} 1s;

  > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 25px;
    border-radius: 5px;
    transition: all 0.5s;
    background-color: #ffffff15;
    border: 1px solid #ffffff50;

    &:hover {
      background-color: #ffffff30;
      border: 1px solid #ffffff60;
    }

    img {
      width: 250px;
    }

    form {
      width: 240px;
      display: flex;
      flex-direction: column;
      margin: 35px 10px 0 10px;
      justify-content: center;
      align-items: center;
      flex: 1;

      a {
        margin: 3px 0 25px 0;
        color: #00000090;
        font-size: 13px;
        text-decoration: none;
        align-self: flex-start;
        transition: all 0.2s;

        &:hover {
          color: #222;
        }
      }
    }
  }

  > a {
    display: flex;
    margin-top: 15px;
    align-items: center;
    color: #ffffff90;
    text-decoration: none;
    transition: all 0.2s;

    &:hover {
      color: #fff;
    }

    svg {
      margin-right: 5px;
    }
  }
`;
