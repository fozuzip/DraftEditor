import React from 'react';
import { EditorState, SelectionState } from 'draft-js';

export const linkStrategy = (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    return entityKey !== null && contentState.getEntity(entityKey).getType() === 'INTERNAL-LINK';
  }, callback);
};

export const Link = props => {
  const { getEditorState, setEditorState, contentState, entityKey } = props;

  const { to } = contentState.getEntity(entityKey).getData();
  const blockExists = () =>
    !!getEditorState()
      .getCurrentContent()
      .getBlockMap()
      .toArray()
      .find(block => block.getKey() === to);

  const moveCursor = () => {
    let newSelection = new SelectionState({
      anchorKey: to,
      anchorOffset: 0,
      focusKey: to,
      focusOffset: 0,
      hasFocus: true,
      isBackward: false
    });
    setEditorState(EditorState.forceSelection(getEditorState(), newSelection));
    setTimeout(() => {
      const scrollConfig = {
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      };
      window.getSelection().focusNode.parentElement.scrollIntoView(scrollConfig);
    }, 100);
  };

  return blockExists() ? (
    <span
      style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
      onMouseDown={e => {
        e.preventDefault();
        if (blockExists()) moveCursor(to);
      }}
    >
      {props.children}
    </span>
  ) : (
    props.children
  );
};

const addLinkPluginPlugin = {
  decorators: [
    {
      strategy: linkStrategy,
      component: Link
    }
  ]
};

export default addLinkPluginPlugin;
