// let carveCtx;
// let shapeObj;

let isObj = (v) => v !== null && typeof v === 'object';

const instructionCodes = {
  moveTo: 0,
  lineTo: 1,
  bezierTo: 2,
  quadTo: 3
};

let validateCanvasCtxArgument = (canvasCtx) => {
  if (
    !isObj(canvasCtx)
    || !isObj(canvasCtx.canvas)
    || !Number.isInteger(canvasCtx.canvas.width)
    || !Number.isInteger(canvasCtx.canvas.height)
  ) throw new TypeError('arg[0] should be a valid CanvasRenderingContext2D');
  else return canvasCtx;
};

let carve = (canvasCtx) => {
  canvasCtx = validateCanvasCtxArgument(canvasCtx);

  let carveCtx = {
    canvasCtx,

    _transforms: [],
    _instructions: [],
    _instructionIndex: 0,

    // _mapToCanvas: () => {},
    // _applyTransform: () => {},
    // _mergeTransforms: () => {},
    // _setTransform: () => {},
    //
    // pushTransform: () => {},
    // popTransform: () => {},
    //
    // makeChild: () => {},
    // render: () => {}
  };

  carveCtx.moveTo = (p) => {
    let i = carveCtx._instructionIndex;

    carveCtx._instructions[i] = instructionCodes.moveTo;

    carveCtx._instructions[i + 1] = p[0];
    carveCtx._instructions[i + 2] = p[1];

    carveCtx._instructionIndex = i + 1 + 2;
    return carveCtx;
  };
  carveCtx.lineTo = (p) => {
    let i = carveCtx._instructionIndex;

    carveCtx._instructions[i] = instructionCodes.lineTo;

    carveCtx._instructions[i + 1] = p[0];
    carveCtx._instructions[i + 2] = p[1];

    carveCtx._instructionIndex = i + 1 + 2;
    return carveCtx;
  };
  carveCtx.bezierTo = (cA, cB, p) => {
    let i = carveCtx._instructionIndex;

    carveCtx._instructions[i] = instructionCodes.bezierTo;

    carveCtx._instructions[i + 1] = cA[0];
    carveCtx._instructions[i + 2] = cA[1];

    carveCtx._instructions[i + 3] = cB[0];
    carveCtx._instructions[i + 4] = cB[1];

    carveCtx._instructions[i + 5] = p[0];
    carveCtx._instructions[i + 6] = p[1];

    carveCtx._instructionIndex = i + 1 + 2 + 2 + 2;
    return carveCtx;
  };
  carveCtx.quadTo = (c, p) => {
    let i = carveCtx._instructionIndex;

    carveCtx._instructions[i] = instructionCodes.quadTo;

    carveCtx._instructions[i + 1] = c[0];
    carveCtx._instructions[i + 2] = c[1];

    carveCtx._instructions[i + 3] = p[0];
    carveCtx._instructions[i + 4] = p[1];

    carveCtx._instructionIndex = i + 1 + 2 + 2;
    return carveCtx;
  };

  carveCtx.commit = (predicate) => {

    let instructions = carveCtx._instructions;
    let canvasCtx = carveCtx.canvasCtx;
    let i = 0;

    let op = () => {
      while (i < carveCtx._instructionIndex) {
        switch (carveCtx._instructions[i]) {
          case instructionCodes.moveTo:
            i += 1 + 2;
            canvasCtx.moveTo(instructions[i + 1], instructions[i + 2]);
            break;
          case instructionCodes.lineTo:
            i += 1 + 2;
            canvasCtx.lineTo(instructions[i + 1], instructions[i + 2]);
            break;
          case instructionCodes.bezierTo:
            i += 1 + 2 + 2 + 2;
            canvasCtx.bezierCurveTo(
              instructions[i + 1],
              instructions[i + 2],

              instructions[i + 3],
              instructions[i + 4],

              instructions[i + 5],
              instructions[i + 6]);
            break;
          case instructionCodes.quadTo:
            i += 1 + 2 + 2;
            canvasCtx.quadraticCurveTo(
              instructions[i + 1],
              instructions[i + 2],

              instructions[i + 3],
              instructions[i + 4]);
            break;
          default:
            throw new Error('Bad carve context instruction code');
        }
      }
      carveCtx._instructionIndex = 0;
    };

    if (typeof predicate === 'function') { predicate(canvasCtx, op); }
    else op();

    return carveCtx;
  };

  return carveCtx;
};

export {carve, instructionCodes};
export default carve;