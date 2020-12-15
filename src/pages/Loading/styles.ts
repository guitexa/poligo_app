import styled, { keyframes } from 'styled-components';

const jumpEffect = keyframes`
  0% {
    transform: translateY(10px);
  }

  100% {
    transform: translateY(0);
  }
`;

const shadowEffect = keyframes`
  0% {
    opacity: 0.5;
    transform: scale(1, 0.2);
  }

  100% {
    opacity: 0.3;
    transform: scale(0.9, 0.19);
  }
`;

export const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  img {
    width: 100%;
    height: 8rem;
    margin-bottom: 0.5rem;
    animation: ${jumpEffect};
    animation-duration: 0.7s;
    animation-timing-function: ease-out;
    animation-direction: alternate;
    animation-iteration-count: infinite;
    animation-play-state: running;
  }

  #shadow {
    border-radius: 50%;
    width: 7.5rem;
    height: 1rem;
    background: black;
    filter: blur(10px);
    animation: ${shadowEffect};
    animation-duration: 0.7s;
    animation-timing-function: ease-out;
    animation-direction: alternate;
    animation-iteration-count: infinite;
    animation-play-state: running;
  }
`;
