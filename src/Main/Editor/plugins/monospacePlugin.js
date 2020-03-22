import { RichUtils, KeyBindingUtil } from 'draft-js';

export default () => ({
  keyBindingFn: e => {
    if (KeyBindingUtil.hasCommandModifier(e) && e.key === '`') {
      return 'inline-code';
    }
  },
  handleKeyCommand: (command, editorState, { setEditorState }) => {
    if (command === 'inline-code') {
      setEditorState(RichUtils.toggleInlineStyle(editorState, 'CODE'));
      return 'handled';
    } else return 'not-handled';
  },

  customStyleMap: {
    CODE: {
      fontFamily: 'monospace',
      backgroundColor: '#F3F3F3',
      borderRadius: '3px',
      padding: '0 4px'
    }
  }
});
