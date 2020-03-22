import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import ToolGroup from './ToolGroup';
import ReactSVG from 'react-svg';
import Tool from './Tool';

class LinkGroup extends Component {
  inputRef = React.createRef();
  state = { tab: 'menu', url: '', block: null, isEdit: false };

  changeTab = to => this.setState({ tab: to });
  changeField = field => e => this.setState({ [field]: e.target.value });
  changeBlock = key => this.setState(prev => ({ block: prev.block === key ? null : key }));

  onDropdownOpen = () => {
    const { entity } = this.props;

    if (entity && entity.type === 'LINK') {
      this.setState({ tab: 'external', url: entity.data.url, block: null, isEdit: true });
    } else if (entity && entity.type === 'INTERNAL-LINK') {
      this.setState({ tab: 'internal', url: null, block: entity.data.to, isEdit: true });
    } else {
      this.setState({ tab: 'menu', url: '', block: null, isEdit: false });
    }
  };

  componentDidUpdate(_, prevState) {
    // on changing tab to extrernal
    if (prevState.tab !== 'external' && this.state.tab === 'external' && this.inputRef) {
      this.inputRef.current.focus();
    }
  }

  render() {
    const { tab } = this.state;
    return (
      <ToolGroup
        label="Link"
        icon={require('assets/link.svg')}
        dropdownOrientation="vertical"
        dropdownAlignment={tab === 'menu' ? 'end' : 'center'}
        width={tab === 'menu' ? 150 : 360}
        onDropdownOpen={this.onDropdownOpen}
        tools={({ toggleDropdown }) =>
          tab === 'menu' ? (
            this.props.isSelectionEmpty && !this.state.isEdit ? (
              <div style={{ padding: 16 }}>Empty Selection</div>
            ) : (
              <Fragment>
                <Tool
                  label={'External Link'}
                  icon={require('assets/yellow_link.svg')}
                  showLabel
                  action={() => this.changeTab('external')}
                />
                <Tool
                  label={'Internal Link'}
                  icon={require('assets/yellow_link.svg')}
                  showLabel
                  action={() => this.changeTab('internal')}
                />
              </Fragment>
            )
          ) : tab === 'external' ? (
            <Wrapper>
              <InputTitle style={{ marginBottom: 16 }}>External Link</InputTitle>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <Input
                  ref={this.inputRef}
                  value={this.state.url}
                  onChange={this.changeField('url')}
                  placeholder="Enter Url"
                />
                <div
                  onMouseDown={e => {
                    e.preventDefault();
                    toggleDropdown();
                    if (this.state.isEdit) {
                      if (this.state.url.length > 1)
                        this.props.editEntity(this.props.entity.key, { url: this.state.url });
                      else this.props.removeEntity(this.props.entity.key);
                    } else this.props.createLink(this.state.url);
                  }}
                >
                  <ReactSVG
                    src={require('assets/arrow.svg')}
                    svgStyle={{ height: 24, width: 24 }}
                  />
                </div>
              </div>
            </Wrapper>
          ) : (
            <Wrapper>
              <InputTitle style={{ marginBottom: 16 }}>Internal Link</InputTitle>
              {this.props.headerBlocks.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <BlockSelect>
                    {this.props.headerBlocks.map(({ key, content }, index) => (
                      <Block
                        selected={this.state.block === key}
                        onMouseDown={() => this.changeBlock(key)}
                      >
                        {content}
                      </Block>
                    ))}
                  </BlockSelect>
                  <div
                    onMouseDown={e => {
                      e.preventDefault();
                      toggleDropdown();
                      if (this.state.isEdit) {
                        if (this.state.block)
                          this.props.editEntity(this.props.entity.key, { to: this.state.block });
                        else this.props.removeEntity(this.props.entity.key);
                      } else this.props.createInternalLink(this.state.block);
                    }}
                  >
                    <ReactSVG
                      src={require('assets/arrow.svg')}
                      svgStyle={{ height: 24, width: 24 }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ textDecoration: 'italics', color: '#D6DBE1' }}>
                  No reference points (Header blocks) found
                </div>
              )}
            </Wrapper>
          )
        }
      />
    );
  }
}
export default LinkGroup;

const Wrapper = styled.div`
  margin: 24px;
  margin-left: 48px;
`;

const Input = styled.input`
  border: 1px solid #d6dbe1;
  border-radius: 1px;
  background-color: #ffffff;
  margin-right: 16px;
  padding: 8px 16px;
  outline: none;
  flex-grow: 1;
`;

const InputTitle = styled.div`
  font-weight: 500;
  marign-bottom: 16px;
`;

const BlockSelect = styled.div`
  flex-grow: 1;
  max-height: 132px;
  overflow-y: overlay;
  border: 1px solid #e0e6ed;
  margin-right: 16px;
  padding: 8px 16px;

  &::-webkit-scrollbar {
    width: 3px;
    height: 3px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(242, 221, 134, 0.5);
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(242, 221, 134, 1);
  }
`;

const Block = styled.div`
  color: ${({ selected }) => (selected === true ? '#3C4858' : '#D6DBE1')};
  cursor: pointer;

  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  margin-bottom: 16px;
  &:last-child {
    margin-bottom: 0;
  }
`;
