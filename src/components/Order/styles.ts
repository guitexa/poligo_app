import styled, { css } from 'styled-components';
import { shade } from 'polished';

interface PrimaryContentProps {
  isModalOpen: boolean;
}

interface SecondaryContentProps {
  isModalOpen: boolean;
}

interface ProductsOrderContentProps {
  isModalOpen: boolean;
}

interface ProductRowProps {
  color: string;
}

interface AddProductButtonProps {
  color: string;
}

export const OrderOverlap = styled.div`
  .headerButton {
    position: absolute;
    top: 8px;
    right: 15px;
  }
`;

export const ModalOverlap = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 200;
`;

export const Container = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  top: 50px;
  right: 0;
  left: 0;
  width: 100vw;
  bottom: 0;
  background: #fff;
  font-size: 13px;
  overflow: hidden;
  z-index: 100;
`;

export const PrimaryContent = styled.div<PrimaryContentProps>`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.2s all;

  ${({ isModalOpen }) =>
    isModalOpen &&
    css`
      filter: blur(2px);
    `};
`;

export const SecondaryContent = styled.div<SecondaryContentProps>`
  width: 100%;
  display: flex;
  align-items: flex-end;
  position: relative;
  transition: 0.2s all;

  ${({ isModalOpen }) =>
    isModalOpen &&
    css`
      filter: blur(2px);
    `};
`;

export const AddProductButton = styled.button<AddProductButtonProps>`
  width: 32px;
  height: 32px;
  background: ${({ color }) => color};
  border-radius: 50%;
  border: 5px solid #fff;
  display: flex;
  justify-content: center;
  align-content: center;
  cursor: pointer;
  outline: none;
  position: absolute;
  left: calc(50% - 16.5px);
  margin-bottom: -14px;
  transition: 0.2s all;

  &:hover {
    background: ${({ color }) => shade(0.2, color)};
  }

  svg {
    color: #fff;
    width: 14px;
    height: 14px;
    margin: 4px;
  }
`;

export const TitlesForm = styled.div`
  width: 35%;
  padding-right: 10px;

  p {
    color: #888;
    line-height: 1.6em;
    text-align: right;
  }
`;

export const DataForm = styled.div`
  width: 65%;

  p {
    font-size: 13px;
    line-height: 1.6em;
    height: 1.6em;
    color: #222;
    flex: 1;
    text-align: left;

    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }

  .status {
    font-size: 13px;
    line-height: 1.6em;
    color: #222;
    display: flex;
    justify-content: flex-start;
    align-items: center;

    svg {
      font-size: 13px;
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
    }

    .faTimes {
      color: #f00;
      font-size: 15px;
      margin-left: -2px;
    }

    .goAlert {
      color: #ffa602;
      margin-left: -1px;
    }

    .faCalendarTimes,
    .ioThumbsDown {
      color: #c00000;
    }

    .hiRefresh {
      color: #000;
    }
  }
`;

export const ClientContainer = styled.div`
  width: 50%;
  padding: 15px;
  border-bottom: 1px solid #999;
  border-right: 1px solid #999;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const OrdersProductsContainer = styled.div`
  width: 50%;
  padding: 15px;
  border-bottom: 1px solid #999;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Status = styled.div`
  padding: 2px 0 3px 0;

  .MuiListItem-root.Mui-selected,
  .MuiListItem-root.Mui-selected:hover {
    background-color: #222;
  }

  .MuiFormControl-root {
    min-width: 50px;
    margin: 0;
  }

  .MuiInput-underline::before,
  .MuiInput-underline::after,
  .MuiInput-underline:hover,
  .MuiInput-underline:hover:not(.Mui-disabled)::before {
    border: none;
  }

  .MuiInputBase-input {
    font-size: 13px;
    height: 1.3em;
    padding: 0px 30px 0 0;
    margin-bottom: -3px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .MuiSelect-icon {
    margin-right: 2px;
  }

  .MuiSelect-select:focus {
    background: transparent;
  }
`;

export const DeliveryData = styled.div`
  width: 50%;
  padding: 15px;
  height: 120px;
  border-bottom: 1px solid #999;
  border-right: 1px solid #999;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const BillingData = styled.div`
  width: 50%;
  padding: 15px;
  height: 120px;
  border-bottom: 1px solid #999;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ProductsOrderContent = styled.div<ProductsOrderContentProps>`
  width: 100%;
  padding-bottom: 30px;
  overflow-y: auto;
  transition: 0.2s all;

  ${({ isModalOpen }) =>
    isModalOpen &&
    css`
      filter: blur(2px);
    `};
`;

export const TitleRow = styled.div`
  width: 100%;
  padding: 15px;
  display: flex;
  height: 35px;
  align-items: center;
  justify-content: flex-start;
  font-weight: bold;
  text-decoration: underline;
`;

export const TitleProductName = styled.div`
  width: 20%;
  text-align: left;
`;

export const TitleProductDescription = styled.div`
  flex: 1;
  text-align: left;
`;

export const TitleProductValue = styled.div`
  width: 15%;
  max-width: 200px;
  text-align: left;
`;

export const ProductRow = styled.div<ProductRowProps>`
  width: 100%;
  padding: 0 15px;
  display: flex;
  height: 24px;
  align-items: center;
  justify-content: flex-start;
  font-size: 13px;

  &:hover {
    background: ${({ color }) => color};

    button {
      color: #fff;
      svg {
        color: #ffffff70;
      }
    }
  }
`;

export const ProductName = styled.button`
  width: 20%;
  font-size: 13px;
  text-align: left;
  padding: 4.5px 25px 3.5px 5px;
  cursor: pointer;
  border: none;
  outline: none;
  background: transparent;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
`;

export const ProductDescription = styled.button`
  flex: 1;
  font-size: 13px;
  text-align: left;
  padding: 4.5px 25px 3.5px 5px;
  min-height: 23px;
  cursor: pointer;
  border: none;
  outline: none;
  background: transparent;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
`;

export const ProductValue = styled.div`
  width: 15%;
  max-width: 200px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .product-value {
    width: 70%;
    font-size: 13px;
    padding: 4.5px 10px 3.5px 5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    border: none;
    outline: none;
    background: transparent;
  }

  .edit-product,
  .delete-product {
    font-size: 13px;
    background: transparent;
    outline: none;
    border: none;
    height: 24px;

    &:hover {
      svg {
        color: #fff;
      }
    }

    svg {
      color: transparent;
    }

    .faEdit {
      width: 23px;
    }

    .faTrashAlt {
      width: 18px;
    }
  }
`;
