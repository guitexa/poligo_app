import styled from 'styled-components';

interface ContainerProps {
  color: string;
  inUse?: boolean;
  size?: string;
}

export const Container = styled.button<ContainerProps>`
  position: relative;
  width: 34px;
  height: 34px;
  background: ${({ color, inUse }) => (inUse ? '#fff' : color)};
  border: 1px solid #fff;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.2s all;
  cursor: ${({ inUse }) => (inUse ? 'default' : 'pointer')};

  img {
    width: 27px;
    height: ${({ size }) => size || '17px'};
    filter: ${({ color, inUse }) =>
      inUse && color === '#004A82'
        ? 'brightness(0) saturate(100%) invert(13%) sepia(58%) saturate(5486%) hue-rotate(193deg) brightness(94%) contrast(104%)'
        : inUse && color === '#851800'
        ? 'brightness(0) saturate(100%) invert(10%) sepia(99%) saturate(3187%) hue-rotate(9deg) brightness(101%) contrast(101%)'
        : inUse && color === '#246CE5'
        ? 'brightness(0) saturate(100%) invert(35%) sepia(24%) saturate(5384%) hue-rotate(206deg) brightness(92%) contrast(95%)'
        : inUse && color === '#1C8F07'
        ? 'brightness(0) saturate(100%) invert(46%) sepia(79%) saturate(5601%) hue-rotate(82deg) brightness(98%) contrast(94%)'
        : inUse && color === '#c9a100'
        ? 'brightness(0) saturate(100%) invert(56%) sepia(31%) saturate(6824%) hue-rotate(28deg) brightness(114%) contrast(101%)'
        : ''};
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
    color: ${({ color, inUse }) => (inUse ? color : '#fff')};
  }

  &:hover {
    background: #fff;

    img {
      filter: ${({ color }) =>
        color === '#004A82'
          ? 'brightness(0) saturate(100%) invert(13%) sepia(58%) saturate(5486%) hue-rotate(193deg) brightness(94%) contrast(104%)'
          : color === '#851800'
          ? 'brightness(0) saturate(100%) invert(10%) sepia(99%) saturate(3187%) hue-rotate(9deg) brightness(101%) contrast(101%)'
          : color === '#246CE5'
          ? 'brightness(0) saturate(100%) invert(35%) sepia(24%) saturate(5384%) hue-rotate(206deg) brightness(92%) contrast(95%)'
          : color === '#1C8F07'
          ? 'brightness(0) saturate(100%) invert(46%) sepia(79%) saturate(5601%) hue-rotate(82deg) brightness(98%) contrast(94%)'
          : color === '#c9a100'
          ? 'brightness(0) saturate(100%) invert(56%) sepia(31%) saturate(6824%) hue-rotate(28deg) brightness(114%) contrast(101%)'
          : ''};
    }

    svg {
      color: ${({ color }) => color};
    }
  }
`;
