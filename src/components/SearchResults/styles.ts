import styled from 'styled-components';

interface LoadMoreProps {
  color: string;
}

export const OrderOverlap = styled.div`
  z-index: 100;
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 110px;
  right: 0;
  left: 0;
  width: 100vw;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
  background: #fff;
`;

export const SeparatedContent = styled.div`
  width: 100%;

  > div {
    width: 100%;
    overflow-y: scroll;
  }
`;

export const Content = styled.div`
  width: 100%;
  overflow-y: scroll;
`;

export const LoadMore = styled.button<LoadMoreProps>`
  padding: 20px;
  margin-top: 15px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.8rem;
  cursor: pointer;
  background: #fdfdfd;
  outline: none;
  border: none;
  border-top: 1px solid ${({ color }) => color};
  transition: 0.2s all;

  &:hover {
    background: ${({ color }) => color};

    p,
    svg {
      color: #fff;
    }
  }

  svg {
    color: ${({ color }) => color};
  }

  p {
    color: ${({ color }) => color};
    margin: 0 10px;
  }
`;
