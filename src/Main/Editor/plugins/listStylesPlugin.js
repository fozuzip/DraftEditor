export default ignoreTypes => ({
  blockStyleFn: block => {
    const styles = block.getData().toObject();
    if (styles.listStyle) {
      switch (styles.listStyle) {
        case 'dashes':
          return 'custom dash';
        case 'checks':
          return 'custom check';
        default:
          return;
      }
    }
  }
});
