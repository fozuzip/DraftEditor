export default ignoreTypes => ({
  blockStyleFn: block => {
    if (ignoreTypes.includes(block.getType())) return;

    const styles = block.getData().toObject();
    if (styles.aligment) {
      switch (styles.aligment) {
        case 'left':
          return 'align-left';
        case 'center':
          return 'align-center';
        case 'right':
          return 'align-right';
        default:
          return;
      }
    }
  }
});
