export default () => ({
  blockStyleFn: block => (block.getType().startsWith('header') ? 'normal-weight' : null)
});
