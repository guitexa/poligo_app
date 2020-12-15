import styled from 'styled-components';
import { shade } from 'polished';

export const Container = styled.button`
  background-color: #0181ca;
  color: #fff;
  border-radius: 4px;
  border: none;
  padding: 8px 60px;
  font-size: 18px;
  transition: all 0.2s;

  &:hover {
    background-color: ${shade(0.3, '#0181ca')};
  }
`;
