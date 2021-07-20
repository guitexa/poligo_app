import styled from 'styled-components';

interface ContentProps {
  color: string;
}

interface HeaderProps {
  color: string;
}

interface PaymentMethodProps {
  color: string;
  value: boolean;
}

interface RadioLabelProps {
  checked: boolean;
}

interface DateProps {
  color: string;
  isFilled: boolean;
}

interface TotalValueProps {
  color: string;
}

export const Background = styled.div`
  position: absolute;
  display: flex;
  top: 50px;
  right: 0;
  left: 0;
  width: 100vw;
  bottom: 0;
  overflow: hidden;
  z-index: 100;
  background: #000;
  opacity: 0.7;
`;

export const ModalContainer = styled.div`
  position: absolute;
  background: #ffffff;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  padding: 10px 20px 20px 20px;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 200;
`;

export const Header = styled.div<HeaderProps>`
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;

  strong {
    font-size: 20px;
    padding-top: 10px;
  }

  button {
    position: absolute;
    top: -8px;
    right: -18px;
    background: transparent;
    border: none;
    outline: none;
    width: 38px;
    height: 38px;

    &:hover {
      svg {
        opacity: 1;
      }
    }

    svg {
      color: ${({ color }) => color};
      width: 38px;
      height: 38px;
      padding: 8px;
      opacity: 0.4;
      transition: 0.2s all;
    }
  }
`;

export const Content = styled.div<ContentProps>`
  width: 100%;

  form {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
  }

  .MuiRadio-colorSecondary.Mui-checked {
    color: ${({ color }) => color};
  }

  .MuiRadio-colorSecondary:not(.Mui-checked) {
    color: #999;
  }

  .MuiIconButton-colorSecondary:hover {
    background-color: #f8f8f8;
  }

  .MuiInput-underline:hover:not(.Mui-disabled)::before {
    border-color: ${({ color }) => color};
  }
`;

export const PaymentType = styled.div`
  display: flex;
  align-items: center;
`;

export const RadioLabel = styled.div<RadioLabelProps>`
  color: ${({ checked }) => (checked ? '#000' : '#999')};
  padding-right: 10px;
`;

export const PaymentContent = styled.div`
  width: 100%;
  display: flex;
`;

export const EnterPayment = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding-right: 10px;
  margin-right: 10px;
  border-right: 1px dashed #888;
`;

export const DividedPayment = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const SecondaryContent = styled.div`
  width: 100%;
  display: flex;
`;

export const PrimaryContent = styled.div`
  width: 100%;
  display: flex;
`;

export const PaymentMethod = styled.div<PaymentMethodProps>`
  display: flex;
  flex: 1;
  margin: 10px;

  label {
    line-height: 0px;
    margin-left: 2px;
    font-size: 1rem;
  }

  .MuiInputLabel-shrink {
    transform: ${({ value }) =>
      value
        ? 'translate(0px, 6px) scale(0.7)'
        : 'translate(1px, 24px) scale(1)'};
  }

  .MuiInputBase-input {
    font-size: 1rem;
    height: 1.9em;
    padding: 0px 30px 0 3px;
    margin-bottom: -2px;
  }

  .MuiListItem-root.Mui-selected,
  .MuiListItem-root.Mui-selected:hover {
    background-color: #222;
  }

  .MuiFormControl-root {
    width: 100%;
    margin: 0;
  }

  .MuiSelect-icon {
    top: calc(50% - 15px);
    margin-right: 2px;
  }

  .MuiSelect-select:focus {
    background: transparent;
  }

  .MuiSelect-select.MuiSelect-select {
    margin-bottom: -8px;
  }
`;

export const DividedQuantity = styled.div<PaymentMethodProps>`
  width: 20%;
  margin: 10px;

  label {
    line-height: 0px;
    margin-left: 2px;
    font-size: 1rem;
  }

  .MuiInputLabel-shrink {
    transform: ${({ value }) =>
      value
        ? 'translate(0px, 6px) scale(0.7)'
        : 'translate(1px, 24px) scale(1)'};
  }

  .MuiInputBase-input {
    font-size: 1rem;
    height: 1.9em;
    padding: 0px 30px 0 3px;
    margin-bottom: -2px;
  }

  .MuiListItem-root.Mui-selected,
  .MuiListItem-root.Mui-selected:hover {
    background-color: #222;
  }

  .MuiFormControl-root {
    width: 100%;
    margin: 0;
  }

  .MuiSelect-icon {
    top: calc(50% - 15px);
    margin-right: 2px;
  }

  .MuiSelect-select:focus {
    background: transparent;
  }

  .MuiSelect-select.MuiSelect-select {
    margin-bottom: -8px;
  }
`;

export const Value = styled.div`
  width: 130px;
  margin: 10px;

  label {
    line-height: 0px;
    margin-left: 2px;
    font-size: 1rem;
  }

  .MuiInputLabel-formControl {
    transform: translate(1px, 17.5px) scale(1);
  }

  .MuiInputLabel-shrink {
    transform: translate(0px, 0px) scale(0.7);
  }

  .MuiInputBase-input {
    font-size: 1rem;
    height: 1.9em;
    padding: 0px 30px 0 3px;
    margin-bottom: -2px;
  }

  .MuiInputBase-root {
    margin-top: 4px;
    width: calc(100% + 28px);
  }

  .MuiIconButton-root {
    padding: 3px;
    margin: 0 0px 1px 2px;
  }

  .MuiSvgIcon-root {
    font-size: 1.23rem;
    color: #0000008a;
  }

  .MuiGrid-container {
    width: 100%;
    margin: 0;

    .MuiGrid-item:nth-child(1) {
      width: calc(100% - 28px);
    }

    .MuiGrid-item {
      padding: 0;

      & > .MuiSvgIcon-root {
        margin: 0 0 -2px 5px;
      }
    }
  }
`;

export const Date = styled.div<DateProps>`
  width: 140px;
  margin: 10px;

  label {
    line-height: 0px;
    margin-left: 2px;
    font-size: 1rem;
  }

  .MuiInputLabel-formControl {
    transform: translate(1px, 17.5px) scale(1);
  }

  .MuiInputLabel-shrink {
    transform: translate(0px, 0px) scale(0.7);
  }

  #date-picker-dialog-helper-text,
  #date-picker-inline-helper-text {
    display: none;
  }

  .MuiGrid-container {
    flex-wrap: inherit;
  }

  .MuiInputBase-input {
    font-size: 1rem;
    height: 1.9em;
    /* padding: 0px 30px 0 3px; */
    padding: ${({ isFilled }) => (isFilled ? '0 30px 0 3px' : '0 0 0 3px')};
    margin-bottom: -2px;
  }

  .MuiInputBase-root {
    margin-top: 4px;
    /* width: calc(100% + 28px); */
    width: ${({ isFilled }) => (isFilled ? 'calc(100% + 28px)' : '100%')};
  }

  .MuiIconButton-root {
    /* padding: 3px;
    margin: 0 0px 1px 2px; */
    padding: ${({ isFilled }) => (isFilled ? '3px' : '6px')};
    margin: ${({ isFilled }) => (isFilled ? '0 0px 1px 2px' : '0 -3px 0 0')};
    display: ${({ isFilled }) => (isFilled ? 'none' : 'flex')};
  }

  .MuiSvgIcon-root {
    font-size: 1.2rem;
    color: #0000008a;
  }

  .close-button {
    display: ${({ isFilled }) => (isFilled ? 'flex' : 'none')};
  }
`;

export const TotalValue = styled.div<TotalValueProps>`
  background: ${({ color }) => color};
  color: #fff;
  border-radius: 4px;
  border: none;
  padding: 8px 15px;
  transition: all 0.2s;
  margin-top: 10px;

  p:nth-child(1) {
    font-size: 0.8rem;
    padding-bottom: 2px;
  }

  p:nth-child(2) {
    font-weight: bold;
    font-size: 20px;
  }
`;
