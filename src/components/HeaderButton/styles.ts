import styled from 'styled-components';

interface ContainerProps {
  color: string;
}

export const Container = styled.button<ContainerProps>`
  position: relative;
  width: 34px;
  height: 34px;
  background: ${({ color }) => color};
  border: 1px solid #fff;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.2s all;
  cursor: pointer;

  img {
    width: 27px;
    height: 17px;
    filter: invert(98%) sepia(2%) saturate(9%) hue-rotate(36deg)
      brightness(103%) contrast(105%);
  }

  div {
    position: absolute;
    bottom: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 2px 0 2px 0;
    width: 8px;
    height: 8px;
    background: #fff;
  }

  svg {
    color: white;
  }

  &:hover {
    background: #fff;

    img {
      filter: invert(19%) sepia(71%) saturate(2627%) hue-rotate(188deg)
        brightness(86%) contrast(105%);
    }

    svg {
      color: ${({ color }) => color};
    }
  }
`;
