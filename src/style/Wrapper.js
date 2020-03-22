import React from 'react';

import styled from 'styled-components';

const ScreenWrapper = ({ children }) => <Container>{children}</Container>;
export default ScreenWrapper;

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: white;
`;
