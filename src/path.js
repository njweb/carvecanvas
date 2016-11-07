import {instructionCodes} from './codes.js';

let moveTo = (outInstructions, index, point = [0, 0]) => {
  outInstructions[index] = instructionCodes.moveTo;
  outInstructions[index + 1] = point[0];
  outInstructions[index + 2] = point[1];
  return index += 3;
};
let lineTo = (outInstructions, index, point = [0, 0]) => {
  outInstructions[index] = instructionCodes.lineTo;
  outInstructions[index + 1] = point[0];
  outInstructions[index + 2] = point[1];
  return index += 3;
};
let quadTo = (outInstructions, index, control, point) => {
  outInstructions[index] = instructionCodes.quadTo;
  outInstructions[index + 1] = control[0];
  outInstructions[index + 2] = control[1];
  outInstructions[index + 3] = point[0];
  outInstructions[index + 4] = point[1];
  return index += 5;
};

let bezierTo = (outInstructions, index, controlA, controlB, point) => {
  outInstructions[index] = instructionCodes.bezierTo;
  outInstructions[index + 1] = controlA[0];
  outInstructions[index + 2] = controlA[1];
  outInstructions[index + 3] = controlB[0];
  outInstructions[index + 4] = controlB[1];
  outInstructions[index + 5] = point[0];
  outInstructions[index + 6] = point[1];
  return index + 7;
};

export {moveTo, lineTo, quadTo, bezierTo}

export default {moveTo, lineTo, quadTo, bezierTo}