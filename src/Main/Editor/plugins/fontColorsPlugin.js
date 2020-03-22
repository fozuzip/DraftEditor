export default colors => ({
  customStyleMap: colors.reduce(
    (styles, color) => ({
      ...styles,
      [`COLOR-${color}`]: {
        color: color
      }
    }),
    {}
  )
});
