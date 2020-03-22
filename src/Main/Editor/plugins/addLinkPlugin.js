import React from 'react';

export const linkStrategy = (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    return entityKey !== null && contentState.getEntity(entityKey).getType() === 'LINK';
  }, callback);
};

export const Link = props => {
  const { contentState, entityKey } = props;
  const { url } = contentState.getEntity(entityKey).getData();

  return (
    <a
      className="link"
      onMouseDown={e => {
        e.persist();
        if (e.button === 2) {
          return;
        } else {
          window.open(url, '_blank');
        }
      }}
      href={url}
      aria-label={url}
      style={{ cursor: 'pointer' }}
    >
      {props.children}
    </a>
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
