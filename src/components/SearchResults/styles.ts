import styled from 'styled-components';

interface ContentProps {
  color: string;
}

interface LoadMoreProps {
  color: string;
}

interface ValueProps {
  status_order: string | unknown;
}

export const OrderOverlap = styled.div`
  z-index: 100;
`;

export const Container = styled.div`
  position: absolute;
  display: flex;
  top: 110px;
  right: 0;
  left: 0;
  width: 100vw;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
  background: #fff;
`;

export const Content = styled.div`
  width: 100%;
  overflow-y: scroll;
`;

export const RowResult = styled.button<ContentProps>`
  padding: 0 0 0 15px;
  margin: 2px 0;
  width: 100%;
  height: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: transparent;
  outline: none;
  border: none;

  &:hover {
    background: ${({ color }) => color};

    div {
      color: #fff;
    }

    svg {
      color: #fff;
    }
  }

  > div {
    font-size: 13px;
    padding: 0 5px 0 5px;

    & + div {
      margin-left: 10px;
    }
  }
`;

export const DateField = styled.div`
  width: 9.5%;
  max-width: 100px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

export const ClientName = styled.div`
  flex: 0.8;
  text-align: left;

  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
`;

export const Product = styled.div`
  flex: 1;
  text-align: left;

  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
`;

export const Professional = styled.div`
  width: 14%;
  max-width: 200px;
  display: flex;
  align-items: center;
  text-align: left;
`;

export const Value = styled.div<ValueProps>`
  width: 11%;
  max-width: 120px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${({ status_order }) =>
    status_order !== 'Aprovado' ? '#666' : '#000'};
`;

export const Status = styled.div`
  width: 8%;
  max-width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 15px;
    height: 15px;
    padding: 0.5px;
  }

  .faGrayCheck {
    color: #555;
  }

  .faGreenCheck {
    color: #1b914f;
  }

  .faRegClock {
    color: #555;
  }

  .riDraftFill {
    color: #999;
    width: 16px;
    height: 16px;
  }

  .faTimes {
    color: #f00;
    width: 18px;
    height: 18px;
  }

  .faCalendarTimes,
  .ioThumbsDown {
    color: #c00000;
    width: 16px;
    height: 16px;
  }

  .hiRefresh {
    color: #000;
  }
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
