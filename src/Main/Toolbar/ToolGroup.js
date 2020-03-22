import React, { Component } from 'react';

import styled from 'styled-components';
import theme from 'style';
import Tool from './Tool';

class ToolGroup extends Component {
  state = { isDropDownOpen: false };

  setDropdown = flag =>
    this.setState({ isDropDownOpen: flag }, () => {
      if (this.state.isDropDownOpen) {
        this.props.onDropdownOpen && this.props.onDropdownOpen();
      } else this.props.onDropdownClose && this.props.onDropdownClose();
    });
  toggleDropdown = () => this.setDropdown(!this.state.isDropDownOpen);

  render() {
    const {
      label,
      icon,
      isSelected,
      render,
      tools,
      dropdownOrientation,
      dropdownAlignment,
      width
    } = this.props;
    const { isDropDownOpen } = this.state;
    return (
      <div style={{ position: 'relative' }}>
        <Tool
          label={label}
          icon={icon}
          render={render}
          isSelected={isSelected}
          action={this.toggleDropdown}
          isExtending={isDropDownOpen}
        />
        {isDropDownOpen && (
          <div position="relative">
            <Dropdown
              orientation={dropdownOrientation}
              alignment={dropdownAlignment}
              width={width}
              toggleDropdown={this.toggleDropdown}
            >
              {tools({ toggleDropdown: this.toggleDropdown })}
            </Dropdown>
            <OutsideClick
              onClick={e => {
                this.toggleDropdown();
              }}
            />
          </div>
        )}
      </div>
    );
  }
}
export default ToolGroup;

const OutsideClick = styled.div`
  background-color: red;
  opacity: 0;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 18;
`;
const Dropdown = styled.div`
  position: absolute;

  top: 32px;

  background-color: ${theme.color.white};
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
  border-radius: 3px;

  display : ${({ orientation }) => (orientation === 'horizontal' ? 'flex' : 'block')}

  width: ${({ width }) => (width ? theme.rem(width) : 'auto')}
  left: ${({ alignment, width }) => {
    switch (alignment) {
      case 'end':
        return theme.rem(-(width - 26));
      case 'center':
        return theme.rem(-(width - 26) / 2);
      default:
        return 0;
    }
  }}

  z-index: 20;
`;
