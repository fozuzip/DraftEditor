import React from 'react';
import styled from 'styled-components';
import { EditorBlock } from 'draft-js';

const Checkbox = props => {
  const blockData = props.blockProps.get();
  return (
    <Wrapper>
      <div contentEditable={false} style={{ marginRight: 12 }}>
        <input
          type="checkbox"
          checked={blockData.isChecked}
          onMouseDown={e => {
            e.preventDefault();
            props.blockProps.set({ isChecked: !blockData.isChecked });
          }}
        />
      </div>
      <EditorBlock {...props} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  input:focus,
  select:focus,
  textarea:focus,
  button:focus {
    outline: none;
  }
`;

export default ({ getBlockData, setBlockData }) => ({
  blockRendererFn: block => {
    const type = block.getType();

    if (type === 'checkbox') {
      const key = block.getKey();
      return {
        component: Checkbox,
        editable: true,
        props: {
          get: getBlockData(key),
          set: setBlockData(key)
        }
      };
    }
  }
});
