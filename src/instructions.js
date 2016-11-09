let instructions = (canvasContext, remapCoordinates) => {
  let cache = [[0, 0], [0, 0], [0, 0]];
  return {
    moveTo: (instructions, index) => {
      let point = remapCoordinates(
        cache[0], instructions.slice(index + 1, index + 3));
      canvasContext.moveTo(point[0], point[1]);
      return index + 3;
    },
    lineTo: (instructions, index) => {
      let point = remapCoordinates(
        cache[0], instructions.slice(index + 1, index + 3));
      canvasContext.lineTo(point[0], point[1]);
      return index + 3;
    },
    quadTo: (instructions, index) => {
      let control = remapCoordinates(
        cache[0], instructions.slice(index + 1, index + 3));
      let point = remapCoordinates(
        cache[1], instructions.slice(index + 3, index + 5));
      canvasContext.quadraticCurveTo(
        control[0],
        control[1],
        point[0],
        point[1]);
      return index + 5;
    },
    bezierTo: (instructions, index) => {
      let controlA = remapCoordinates(
        cache[0], instructions.slice(index + 1, index + 3));
      let controlB = remapCoordinates(
        cache[1], instructions.slice(index + 3, index + 5));
      let point = remapCoordinates(
        cache[2], instructions.slice(index + 5, index + 7));
      canvasContext.bezierCurveTo(
        controlA[0],
        controlA[1],
        controlB[0],
        controlB[1],
        point[0],
        point[1]);
      return index + 7;
    }
  }
};

export {instructions};
export default {instructions};