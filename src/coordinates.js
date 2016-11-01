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

// let originAxis = [
//   (canvasSize) => {
//     let offset = [canvasSize[0] * 0.5, canvasSize[1] * 0.5];
//     return (out, p) => {
//       out[0] = p[0] + offset[0];
//       out[1] = -p[1] + offset[1];
//       return out;
//     };
//   },
//   () => {
//     return (out, p) => {
//       out[0] = p[0];
//       out[1] = p[1];
//       return out;
//     };
//   },
//   (canvasSize) => {
//     let offset = canvasSize[0] * 0.5;
//     return (out, p) => {
//       out[0] = p[0] + offset;
//       out[1] = p[1];
//       return out;
//     }
//   },
//   (canvasSize) => {
//     let offset = canvasSize[0];
//     return (out, p) => {
//       out[0] = p[0] + offset;
//       out[1] = p[1];
//       return out;
//     }
//   }
// ];
//
// export { originAxis };