import React, { Fragment } from 'react';

import styled, { keyframes } from 'styled-components';
import theme from 'style';

const Spinner = ({ size, show }) => (
  <Container size={size}>
    {show && (
      <Fragment>
        <SVG i={1} viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
          <circle
            className="length"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            cx="33"
            cy="33"
            r="28"
          />
        </SVG>
        <SVG i={2} viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
          <circle fill="none" strokeWidth="8" strokeLinecap="round" cx="33" cy="33" r="28" />
        </SVG>
        <SVG i={3} viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
          <circle fill="none" strokeWidth="8" strokeLinecap="round" cx="33" cy="33" r="28" />
        </SVG>
        <SVG i={4} viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
          <circle fill="none" strokeWidth="8" strokeLinecap="round" cx="33" cy="33" r="28" />
        </SVG>
      </Fragment>
    )}
  </Container>
);
export default Spinner;

const colors = ['#84EBBD', '#4977EC', '#F6BB67', '#333841'];
const d = 175.6449737548828;

const contanim = keyframes`
  100% {
    transform: rotate(360deg)
  }
`;

const strokeanim = keyframes`
  % {
    stroke-dasharray: 1, 300;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 120, 300;
    stroke-dashoffset: -${d} / 3;
  }
  100% {
    stroke-dasharray: 120, 300;
    stroke-dashoffset: -${d};
  }
`;

const Container = styled.div`
  margin: ${0} ${theme.rem(16)}
  width: ${({ size }) => theme.rem(size)};
  height: ${({ size }) => theme.rem(size)};

  animation: ${contanim} 2s linear infinite;
`;

const SVG = styled.svg`
  width: 100%;
  height: 100%;

  left: 0;
  top: 0;
  position: absolute;

  transform: rotate(-90deg);

  &:nth-child(${({ i }) => i}) circle {
    stroke: ${({ i }) => colors[i]};
    stroke-dasharray: 1, 300;
    stroke-dashoffset: 0;

    animation: ${strokeanim} 3s calc(0.2s * (${({ i }) => i})) ease infinite;
    transform-origin: center center;
  }
`;
