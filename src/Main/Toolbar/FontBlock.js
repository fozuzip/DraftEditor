import React from 'react';

import styled from 'styled-components';

const FontBlock = ({ size, children, onClick }) => (
  <Container
    size={size}
    onMouseDown={e => {
      e.preventDefault();
      onClick && onClick();
    }}
  >
    {children}
  </Container>
);
export default FontBlock;

const Container = styled.div`
  margin-left: 16px;
  margin-bottom: 16px;

  font-size: ${({ size }) => size}em;

  &:first-child {
    margin-top: 16px;
  }

  cursor: pointer;
`;
