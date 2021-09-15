import styled, { keyframes } from 'styled-components';

import Background from '../../assets/bg.png';

interface ContentProps {
  isSelected: boolean;
}

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

export const Content = styled.div<ContentProps>`
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
    background: #ffffff15;
    border: 1px solid #ffffff50;

    &:hover {
      background: #ffffff30;
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
    }
  }

  a {
    display: flex;
    margin-top: 8px;
    justify-content: center;
    align-self: flex-start;
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

  button {
    margin-top: 25px;
  }

  .MuiFormHelperText-root {
    display: none;
  }

  .MuiSelect-select {
    background: #fff;
    padding: 11px 16px;
    color: ${({ isSelected }) => (isSelected ? '#222' : '#33333390')};
    text-decoration: none;
    transition: all 0.2s;
  }

  .MuiSelect-select:focus {
    background: #fff;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .Mui-focused {
    background: #fff;
    transition: all 0.2s;
  }

  .MuiOutlinedInput-notchedOutline,
  .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline,
  .MuiOutlinedInput-root:active .MuiOutlinedInput-notchedOutline {
    border: none;
    transition: all 0.2s;
  }
  .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border: 1px solid #222;
    transition: all 0.2s;
  }
`;
