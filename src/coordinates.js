let mapCoordinates = (offset = [0, 0], flipX = false, flipY = true) => {
  const mulX = flipX === true ? -1 : 1;
  const mulY = flipY === true ? -1 : 1;
  return (out, p) => {
    out[0] = (p[0] * mulX) + offset[0];
    out[1] = (p[1] * mulY) + offset[1];
    return out;
  }
};

export { mapCoordinates };
export default mapCoordinates;
