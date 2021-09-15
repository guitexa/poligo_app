import styled from 'styled-components';
import { shade } from 'polished';

export const Container = styled.button`
  background: #004a82;
  color: #fff;
  border-radius: 4px;
  border: none;
  padding: 8px 60px;
  font-size: 18px;
  transition: all 0.2s;
  z-index: 100;

  &:hover {
    background: ${shade(0.3, '#004a82')};
  }
`;
