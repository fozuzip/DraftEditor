export default ignoreTypes => ({
  blockStyleFn: block => {
    if (ignoreTypes.includes(block.getType())) return;

    const depth = block.getDepth();
    return depth > 0 ? 'block-depth-' + depth : '';
  }
});
