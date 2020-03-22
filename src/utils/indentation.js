import { EditorState, Modifier } from 'draft-js';

export const adjustBlockDepth = (editorState, adjustment, maxDepth) => {
  const contentState = editorState.getCurrentContent();
  const selectionState = editorState.getSelection();

  const startKey = selectionState.getStartKey();
  const endKey = selectionState.getEndKey();

  let blockMap = contentState.getBlockMap();
  const blocks = blockMap
    .toSeq()
    .skipUntil((_, k) => k === startKey)
    .takeUntil((_, k) => k === endKey)
    .concat([[endKey, blockMap.get(endKey)]])
    .map(block => {
      let depth = block.getDepth() + adjustment;
      depth = Math.max(0, Math.min(depth, maxDepth));
      return block.set('depth', depth);
    });

  blockMap = blockMap.merge(blocks);

  return EditorState.push(
    editorState,
    contentState.merge({
      blockMap,
      selectionBefore: selectionState,
      selectionAfter: selectionState
    }),
    'adjut-depth'
  );
};

// OLD
export const insertTab = (e, editorState) => {
  e.preventDefault();

  var contentState = editorState.getCurrentContent();
  var selection = editorState.getSelection();

  var indentation = '\t';
  var newContentState;

  if (selection.isCollapsed()) {
    newContentState = Modifier.insertText(contentState, selection, indentation);
  } else {
    newContentState = Modifier.replaceText(contentState, selection, indentation);
  }

  return EditorState.push(editorState, newContentState, 'insert-characters');
};
