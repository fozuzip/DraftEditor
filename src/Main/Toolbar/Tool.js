import React from 'react';
import styled from 'styled-components';
import theme from 'style';
import ReactSVG from 'react-svg';

const Tool = ({ label, icon, render, action, isSelected, isExtending, showLabel, upload, hint }) =>
  showLabel ? (
    <LabelWrapper
      onMouseDown={e => {
        e.preventDefault();
        action();
      }}
      isSelected={isSelected}
    >
      <Container>
        {icon ? (
          <ReactSVG src={icon} svgStyle={{ height: 14, width: 14, paddingTop: 4 }} />
        ) : (
          render && render()
        )}
      </Container>
      {upload && <input type="file" />}
      <LabelText>{label}</LabelText>
    </LabelWrapper>
  ) : (
    <Container
      onMouseDown={e => {
        e.preventDefault();
        action();
      }}
      isSelected={isSelected}
    >
      {(isSelected || isExtending) && <SelectionBox isExtending={isExtending} />}
      {hint && <Tooltip className={'hoverable'}>{hint}</Tooltip>}
      <IconWrapper>
        {icon && <ReactSVG src={icon} svgStyle={{ height: 14, width: 14, paddingTop: 4 }} />}
        {render && render()}
      </IconWrapper>
    </Container>
  );

export default Tool;

const LabelWrapper = styled.div`
  display: flex;
  height: ${theme.rem(48)};
  align-items: center;
  margin-left: 8px;

  cursor: pointer;
`;

const LabelText = styled.div`
  margin-left: ${theme.rem(4)};
`;

const Container = styled.div`
  position: relative;
  width: ${theme.rem(26)};
  height: ${theme.rem(26)};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;

  cursor: pointer;

  &:hover {
    .hoverable {
      opacity: 1;
      transition: opacity 0.3s linear;
      transition-delay: 0.3s;
    }
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  z-index: 15;
`;

const SelectionBox = styled.div`
  position: absolute;
  width: ${theme.rem(26)};
  height: ${({ isExtending }) => theme.rem(isExtending ? 38 : 32)};
  top: -3px;
  background-color: ${theme.color.white};
  box-shadow: 0 2px 4px 1px rgba(0, 0, 0, 0.25);
  border-radius: 3px;

  z-index: 10;
`;

const Tooltip = styled.div`
  position: absolute;

  top: -28px;
  padding: 6px 4px;
  background-color: white;
  white-space: nowrap;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
  font-weight: 300;
  z-index: 12;
`;
