export default () => ({
  blockStyleFn: block => (block.getType() === 'all-caps' ? 'all-caps' : null)
});
