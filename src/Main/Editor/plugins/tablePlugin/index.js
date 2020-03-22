import TableComponent from './Block';

export default ({ getBlockData, setBlockData, removeBlock, toggleDisableInput }) => ({
  blockRendererFn: block => {
    const type = block.getType();

    if (type === 'table') {
      const key = block.getKey();
      return {
        component: TableComponent,
        editable: false,
        props: {
          id: key,
          get: getBlockData(key),
          set: setBlockData(key),
          toggleDisableInput: toggleDisableInput,
          delete: () => removeBlock(key)
        }
      };
    }
  }
});
