import React, { Fragment } from 'react';

import styled from 'styled-components';
import theme from 'style';

import { Bar } from '../common';
import Tool from './Tool';
import ToolGroup from './ToolGroup';
import LinkGroup from './LinkGroup';
import FontBlock from './FontBlock';

const Toolbar = props => (
  <Wrapper>
    <input
      type="file"
      value={''}
      name={`file`}
      id={`upload_file`}
      onChange={props.uploadImage}
      style={{ display: 'none' }}
    />
    <Bar primary orientation={'horizontal'}>
      {props.canEdit && (
        <Fragment>
          <ToolGroup
            label="Paragraph"
            width={100}
            icon={props.selectedFontSize() === 'unstyled' && require('assets/paragraph_format.svg')}
            render={() => getFontSizeLabel(props.selectedFontSize())}
            tools={({ toggleDropdown }) => (
              <Fragment>
                <FontBlock
                  size={2}
                  onClick={() => {
                    toggleDropdown();
                    props.onFontSize('header-one');
                  }}
                >
                  Title
                </FontBlock>
                <FontBlock
                  size={1.5}
                  onClick={() => {
                    toggleDropdown();
                    props.onFontSize('header-two');
                  }}
                >
                  Subtitle
                </FontBlock>
                <FontBlock
                  size={1.17}
                  onClick={() => {
                    toggleDropdown();
                    props.onFontSize('header-three');
                  }}
                >
                  Heading
                </FontBlock>
                <FontBlock
                  size={1}
                  onClick={() => {
                    toggleDropdown();
                    props.onFontSize('unstyled');
                  }}
                >
                  Body
                </FontBlock>
                <FontBlock
                  size={0.83}
                  onClick={() => {
                    toggleDropdown();
                    props.onFontSize('header-five');
                  }}
                >
                  Small letters
                </FontBlock>
                <FontBlock
                  size={1}
                  onClick={() => {
                    toggleDropdown();
                    props.onFontSize('all-caps');
                  }}
                >
                  ALL CAPS
                </FontBlock>
              </Fragment>
            )}
          />
          <Tool
            label="Bold"
            icon={require('assets/bold.svg')}
            action={props.onBold}
            isSelected={props.isBoldSelected()}
            hint={'Ctrl + B'}
          />
          <Tool
            label="Italic"
            icon={require('assets/italic.svg')}
            action={props.onItalic}
            isSelected={props.isItalicSelected()}
            hint={'Ctrl + I'}
          />
          <Tool
            label="Underline"
            icon={require('assets/underline.svg')}
            action={props.onUnderline}
            isSelected={props.isUnderlineSelected()}
            hint={'Ctrl + U'}
          />
          <Tool
            label="Strikethrough"
            icon={require('assets/strikethrough.svg')}
            action={props.onStrikethrough}
            isSelected={props.isStrikethroughSelected()}
          />
          <ToolGroup
            label="Color"
            render={() => <Dot color={props.selectedColor()} />}
            dropdownOrientation="horizontal"
            tools={({ toggleDropdown }) => (
              <Fragment>
                {theme.color.editor.map(color => (
                  <Tool
                    key={color}
                    label={`Color ${color}`}
                    render={() => <Dot color={color} />}
                    action={() => {
                      toggleDropdown();
                      props.onColor(color);
                    }}
                  />
                ))}
              </Fragment>
            )}
          />
          <LinkGroup
            createLink={props.createLink}
            editEntity={props.editEntity}
            removeEntity={props.removeEntity}
            createInternalLink={props.createInternalLink}
            headerBlocks={props.headerBlocks}
            isSelectionEmpty={props.isSelectionEmpty}
            entity={props.entity}
          />
          <Tool
            label="Align left"
            icon={require('assets/align_left.svg')}
            action={props.onAligment('left')}
            isSelected={props.isAligmentSelected('left')}
          />
          <Tool
            label="Align center"
            icon={require('assets/align_center.svg')}
            action={props.onAligment('center')}
            isSelected={props.isAligmentSelected('center')}
          />
          <Tool
            label="Align right"
            icon={require('assets/align_right.svg')}
            action={props.onAligment('right')}
            isSelected={props.isAligmentSelected('right')}
          />
          <ToolGroup
            label="Bullets"
            icon={require('assets/bullets.svg')}
            isSelected={!!props.selectedList()}
            tools={({ toggleDropdown }) => (
              <Fragment>
                <Tool
                  label="Numbered Bullets"
                  icon={require('assets/bullets_numbers.svg')}
                  action={() => {
                    toggleDropdown();
                    props.onList('numbers');
                  }}
                  isSelected={props.selectedList() === 'numbers'}
                />
                <Tool
                  label="Checked Bullets"
                  icon={require('assets/bullets_checks.svg')}
                  action={() => {
                    toggleDropdown();
                    props.onList('checks');
                  }}
                  isSelected={props.selectedList() === 'checks'}
                />
                <Tool
                  label="Dashed Bullets"
                  icon={require('assets/bullets_dashes.svg')}
                  action={() => {
                    toggleDropdown();
                    props.onList('dashes');
                  }}
                  isSelected={props.selectedList() === 'dashes'}
                />
                <Tool
                  label="Normal Bullets"
                  icon={require('assets/bullets.svg')}
                  action={() => {
                    toggleDropdown();
                    props.onList('bullets');
                  }}
                  isSelected={props.selectedList() === 'bullets'}
                />
              </Fragment>
            )}
          />
          <Tool
            label="Add Indention"
            icon={require('assets/increase_indent.svg')}
            action={props.onAddIndent}
          />
          <Tool
            label="Remove Indention"
            icon={require('assets/decrease_indent.svg')}
            action={props.onRemoveIndent}
          />
          {props.isCodeSelected() ? (
            <Tool
              label="Code"
              icon={require('assets/code_snippet.svg')}
              action={props.toggleCode}
              isSelected
            />
          ) : (
            <ToolGroup
              label="Actions"
              icon={require('assets/code_snippet.svg')}
              dropdownAlignment="end"
              width={200}
              tools={({ toggleDropdown }) => (
                <Fragment>
                  <Tool
                    label={'Code snippet'}
                    icon={require('assets/code_block.svg')}
                    showLabel
                    action={() => {
                      toggleDropdown();
                      props.onCodeSnippet();
                    }}
                  />
                  <Tool
                    label={'Inline code'}
                    icon={require('assets/inline_code.svg')}
                    showLabel
                    action={() => {
                      toggleDropdown();
                      props.onInlineCode();
                    }}
                  />
                </Fragment>
              )}
            />
          )}

          <Tool
            label="Undo"
            icon={require('assets/undo.svg')}
            action={props.onUndo}
            hint={'Ctrl + Z'}
          />
          <ToolGroup
            label="Actions"
            icon={require('assets/add_plus_icon.svg')}
            dropdownAlignment="end"
            width={200}
            tools={({ toggleDropdown }) => (
              <Fragment>
                <Tool
                  label="Redo"
                  showLabel
                  icon={require('assets/redo.svg')}
                  action={() => {
                    toggleDropdown();
                    props.onRedo();
                  }}
                />
                <Tool
                  label={props.isTable() ? 'Remove Table' : 'Insert Table'}
                  icon={require('assets/table.svg')}
                  showLabel
                  action={() => {
                    toggleDropdown();
                    props.onTable();
                  }}
                />
                <Tool
                  label="Upload images"
                  icon={require('assets/upload_image.svg')}
                  showLabel
                  action={() => {
                    toggleDropdown();
                    const f = document.getElementById('upload_file');
                    f.click();
                  }}
                />
                <Tool label="Take a photo" icon={require('assets/camera.svg')} showLabel />
              </Fragment>
            )}
          />
        </Fragment>
      )}
    </Bar>
  </Wrapper>
);
export default Toolbar;

const Wrapper = styled.div`
  width: 100%;
  margin-bottom: 16px;
`;

const getFontSizeLabel = blockType => {
  switch (blockType) {
    case 'header-one':
      return 'T';
    case 'header-two':
      return 'S';
    case 'header-three':
      return 'H';
    case 'unstyled':
      return null;
    case 'header-five':
      return 'sl';
    case 'all-caps':
      return 'AC';
    default:
      return '-';
  }
};

const getListTypeIcon = listType => {
  switch (listType) {
    case 'numbers':
      return require('assets/bullets_numbers.svg');
    case 'checks':
      return require('assets/bullets_checks.svg');
    case 'dashes':
      return require('assets/bullets_dashes.svg');
    case 'bullets':
      return require('assets/bullets.svg');
    default:
      return '';
  }
};

const Dot = styled.div`
  height: 8px;
  width: 8px;
  border-radius: 50%;
  background-color: ${({ color }) => (color ? color : theme.color.font)};
`;
