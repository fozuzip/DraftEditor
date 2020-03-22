import React, { Component } from 'react';

import Toolbar from './Toolbar';

import api from 'utils/api';

import { EditorState, ContentBlock, genKey } from 'draft-js';

import { List, Map } from 'immutable';

class Container extends Component {
  onBold = () => this.props.toggleInlineStyle('BOLD');
  isBoldSelected = () => this.hasInlineStyle('BOLD');

  onItalic = () => this.props.toggleInlineStyle('ITALIC');
  isItalicSelected = () => this.hasInlineStyle('ITALIC');

  onUnderline = () => this.props.toggleInlineStyle('UNDERLINE');
  isUnderlineSelected = () => this.hasInlineStyle('UNDERLINE');

  onStrikethrough = () => this.props.toggleInlineStyle('STRIKETHROUGH');
  isStrikethroughSelected = () => this.hasInlineStyle('STRIKETHROUGH');

  onColor = color => {
    const currentColor = this.selectedColor();
    if (currentColor) this.props.replaceInlineStyle(`COLOR-${currentColor}`, `COLOR-${color}`);
    else this.props.toggleInlineStyle(`COLOR-${color}`);
  };
  selectedColor = () => {
    const style = this.getInlineStyles().find(style => style.startsWith('COLOR'));
    return style ? style.replace('COLOR-', '') : null;
  };

  onFontSize = type => this.props.toggleBlockType(type);
  selectedFontSize = () => {
    const blockType = this.getBlock().getType();
    return blockType;
  };

  onAligment = value => () => this.props.setBlockStyle({ aligment: value });
  isAligmentSelected = value => {
    const blockStyles = this.getBlock()
      .getData()
      .toObject();

    return blockStyles.aligment && blockStyles.aligment === value;
  };

  onList = type => {
    if (type === 'numbers') {
      this.props.toggleBlockType('ordered-list-item', { listStyle: type });
    } else if (type === 'checks') {
      this.props.toggleBlockType('checkbox');
    } else {
      this.props.toggleBlockType('unordered-list-item', { listStyle: type });
    }
  };
  selectedList = () => {
    const block = this.getBlock();
    if (block.getType().endsWith('list-item')) return block.getData().toObject().listStyle;
    else if (block.getType() === 'checkbox') return 'checks';
    else return null;
  };

  onAddIndent = () => this.props.indentSelection('add');
  onRemoveIndent = () => this.props.indentSelection('remove');

  onUndo = () => this.props.undo();
  onRedo = () => this.props.redo();

  onCodeSnippet = () => this.props.toggleBlockType('code-block');
  isCodeSnippetSeleced = () => this.hasBlockType('code-block');

  onInlineCode = () => this.props.toggleInlineStyle('CODE');

  uploadImage = async e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    let data = new FormData();
    data.append('data', file);

    const { id, url } = await this.props.uploadImage(data);
    this.addImage(url, id);
  };

  addImage = (src, id) => this.props.createEntity('image', 'IMMUTABLE', { src, id });

  hasInlineStyle = type =>
    this.getInlineStyles()
      .toArray()
      .includes(type);

  getInlineStyles = () => this.props.editorState.getCurrentInlineStyle();

  hasBlockType = type => this.getBlock().getType() === type;

  getBlock = () =>
    this.props.editorState.getCurrentContent().getBlockForKey(this.getSelection().getStartKey());

  getSelection = () => this.props.editorState.getSelection();
  isCodeSnippetSelected = () => {
    const blockType = this.getBlock().getType();
    return blockType === 'code-block';
  };

  status = () => ({
    inlineStyles: this.getInlineStyles().toArray(),
    blockType: this.getBlock().getType(),
    blockStyles: this.getBlock()
      .getData()
      .toObject()
  });

  onTable = () => {
    const contentState = this.props.editorState.getCurrentContent();
    const selection = this.props.editorState.getSelection();

    const currentBlock = contentState.getBlockForKey(selection.getStartKey());
    const blockMap = contentState.getBlockMap();

    const blocksBefore = blockMap.toSeq().takeUntil(b => b === currentBlock);
    const blocksAfter = blockMap
      .toSeq()
      .skipUntil(b => b === currentBlock)
      .rest();

    const tableKey = genKey();
    const emptyKey = genKey();
    const newBlocks = [
      [currentBlock.getKey(), currentBlock],
      [
        tableKey,
        new ContentBlock({
          key: tableKey,
          type: 'table',
          text: '',
          characterList: List(),
          data: new Map({
            headers: [' ', ' ', ' '],
            cells: [[' ', ' ', ' '], [' ', ' ', ' '], [' ', ' ', ' ']]
          })
        })
      ],
      [
        emptyKey,
        new ContentBlock({
          key: emptyKey,
          type: 'unstyled',
          text: '',
          characterList: List()
        })
      ]
    ];

    const newBlockMap = blocksBefore.concat(newBlocks, blocksAfter).toOrderedMap();
    const newContentState = contentState.merge({
      blockMap: newBlockMap,
      selectionBefore: selection,
      selectionAfter: selection
    });
    this.props.onChange(
      EditorState.push(this.props.editorState, newContentState, 'insert-fragment')
    );
  };

  isTable = () => {
    const blockType = this.getBlock().getType();
    return blockType === 'table';
  };

  entitySelected = () => {
    const block = this.getBlock();
    const offset = this.props.editorState.getSelection().getStartOffset();
    const entityKey = block && block.getEntityAt(offset);

    return entityKey
      ? {
          ...this.props.editorState
            .getCurrentContent()
            .getEntity(entityKey)
            .toObject(),
          key: entityKey
        }
      : null;
  };

  isCodeSelected = () => this.hasInlineStyle('CODE') || this.hasBlockType('code-block');

  toggleCode = () => {
    if (this.hasInlineStyle('CODE')) {
      this.props.toggleInlineStyle('CODE');
    } else {
      this.props.toggleBlockType('code-block');
    }
  };

  render() {
    return (
      <Toolbar
        onBold={this.onBold}
        isBoldSelected={this.isBoldSelected}
        onItalic={this.onItalic}
        isItalicSelected={this.isItalicSelected}
        onUnderline={this.onUnderline}
        isUnderlineSelected={this.isUnderlineSelected}
        onStrikethrough={this.onStrikethrough}
        isStrikethroughSelected={this.isStrikethroughSelected}
        onColor={this.onColor}
        selectedColor={this.selectedColor}
        onFontSize={this.onFontSize}
        selectedFontSize={this.selectedFontSize}
        onAligment={this.onAligment}
        isAligmentSelected={this.isAligmentSelected}
        onList={this.onList}
        selectedList={this.selectedList}
        onAddIndent={this.onAddIndent}
        onRemoveIndent={this.onRemoveIndent}
        onUndo={this.onUndo}
        onRedo={this.onRedo}
        uploadImage={this.uploadImage}
        onCodeSnippet={this.onCodeSnippet}
        isCodeSnippetSelected={this.isCodeSnippetSelected}
        onInlineCode={this.onInlineCode}
        onTable={this.onTable}
        isTable={this.isTable}
        canEdit={this.props.canEdit}
        createLink={this.props.createLink}
        editEntity={this.props.editEntity}
        removeEntity={this.props.removeEntity}
        createInternalLink={this.props.createInternalLink}
        headerBlocks={this.props.headerBlocks}
        isSelectionEmpty={this.props.isSelectionEmpty}
        isCodeSelected={this.isCodeSelected}
        toggleCode={this.toggleCode}
        entity={this.entitySelected()}
        block={this.getBlock()}
      />
    );
  }
}
export default Container;
