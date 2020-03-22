import React from 'react';
import Spinner from './Spinner';
import styled from 'styled-components';

const Loading = () => (
  <Wrapper>
    <Spinner size={24} show={true} />
  </Wrapper>
);
export default Loading;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
`;
