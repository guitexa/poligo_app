import styled from 'styled-components';

interface ContainerProps {
  color: string;
  isCanceled?: boolean;
  dueDate?: string | false;
}

interface TextFlexProps {
  flex: string;
}

interface TextWidthProps {
  width?: string;
}

interface ValueProps {
  width?: string;
  negative?: boolean;
}

interface StatusProps {
  isCanceled?: boolean;
}

export const Container = styled.button<ContainerProps>`
  padding: 0 0 0 15px;
  margin: 2px 0;
  width: 100%;
  height: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: ${({ isCanceled, dueDate }) =>
    isCanceled ? '#f00' : dueDate || 'transparent'};
  color: ${({ isCanceled }) => (isCanceled ? '#fff' : '#000')};
  outline: none;
  font-weight: ${({ dueDate }) => dueDate && 'bold'};
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

export const TextFlex = styled.div<TextFlexProps>`
  flex: ${({ flex }) => flex};
  text-align: left;

  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
`;

export const TextWidth = styled.div<TextWidthProps>`
  width: ${({ width }) => width || '14%'};
  max-width: 200px;
  display: flex;
  align-items: center;
  text-align: left;
`;

export const Value = styled.div<ValueProps>`
  width: ${({ width }) => width || '11%'};
  color: ${({ negative }) => (negative ? '#f00' : 'inherit')};
  max-width: 120px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Status = styled.div<StatusProps>`
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
    color: ${({ isCanceled }) => (isCanceled ? '#fff' : '#555')};
  }

  .faGreenCheck {
    color: ${({ isCanceled }) => (isCanceled ? '#fff' : '#1b914f')};
  }

  .faRegClock {
    color: ${({ isCanceled }) => (isCanceled ? '#fff' : '#555')};
  }

  .riDraftFill {
    color: ${({ isCanceled }) => (isCanceled ? '#fff' : '#999')};
    width: 16px;
    height: 16px;
  }

  .faTimes {
    color: ${({ isCanceled }) => (isCanceled ? '#fff' : '#f00')};
    width: 18px;
    height: 18px;
  }

  .faCalendarAlt {
    color: ${({ isCanceled }) => (isCanceled ? '#fff' : '#19518A')};
    width: 15px;
    height: 15px;
  }

  .biCalendarX {
    color: ${({ isCanceled }) => (isCanceled ? '#fff' : '#c00000')};
    width: 18px;
    height: 18px;
  }

  .ioThumbsDown {
    color: ${({ isCanceled }) => (isCanceled ? '#fff' : '#c00000')};
    width: 16px;
    height: 16px;
  }

  .goAlert {
    color: ${({ isCanceled }) => (isCanceled ? '#fff' : '#FFA602')};
    width: 16px;
    height: 16px;
  }

  .hiRefresh {
    color: ${({ isCanceled }) => (isCanceled ? '#fff' : '#000')};
  }
`;
