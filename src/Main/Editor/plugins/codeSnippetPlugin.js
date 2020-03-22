export default () => ({
  blockStyleFn: block => (block.getType() === 'code-block' ? 'code-block' : null)
});
