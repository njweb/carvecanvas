// let carveCtx;
// let shapeObj;

import {originAxis as originAxisMapFunctions} from './coordinates.js';

const sentinelString = '_@_carvecontext_@_';

let isObj = (v) => v !== null && typeof v === 'object';

let isCarveContext = (c) => c._sentinel === sentinelString;

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

let carve = (srcCtx, options) => {
  let canvasCtx = validateCanvasCtxArgument(srcCtx);

  options = options ? Object.create(options) : {};
  options.originAxisType = options.originAxisType ? options.originAxisType : 0;
  options.rootTransform = options.rootTransform ? options.rootTransform : [0, 0];

  let carveRoot = {
    get _sentinel(){ return sentinelString },
    _mapToCanvas: originAxisMapFunctions[options.originAxisType]([
      canvasCtx.canvas.width,
      canvasCtx.canvas.height
    ]),
    _applyTransform: function (out, transform, p) {
      return this._mergeTransforms(out, transform, p);
    },
    _mergeTransforms: function (out, a, b) {
      out[0] = a[0] + b[0];
      out[1] = a[1] + b[1];
      return out;
    },

    moveTo: function (p = [0, 0]) {
      let i = this._instructionIndex;

      this._instructions[i] = instructionCodes.moveTo;

      let pTransformed = this._applyTransform([], this.getCurrentTransform(), p);

      this._instructions[i + 1] = pTransformed[0];
      this._instructions[i + 2] = pTransformed[1];

      this._instructionIndex = i + 1 + 2;
      return this;
    },
    lineTo: function (p = [0, 0]) {
      let i = this._instructionIndex;

      this._instructions[i] = instructionCodes.lineTo;

      let pTransformed = this._applyTransform([], this.getCurrentTransform(), p);

      this._instructions[i + 1] = pTransformed[0];
      this._instructions[i + 2] = pTransformed[1];

      this._instructionIndex = i + 1 + 2;
      return this;
    },
    bezierTo: function (cA, cB, p) {
      let i = this._instructionIndex;

      this._instructions[i] = instructionCodes.bezierTo;

      let cATransformed = this._applyTransform([], this.getCurrentTransform(), cA);
      let cBTransformed = this._applyTransform([], this.getCurrentTransform(), cB);
      let pTransformed = this._applyTransform([], this.getCurrentTransform(), p);

      this._instructions[i + 1] = cATransformed[0];
      this._instructions[i + 2] = cATransformed[1];

      this._instructions[i + 3] = cBTransformed[0];
      this._instructions[i + 4] = cBTransformed[1];

      this._instructions[i + 5] = pTransformed[0];
      this._instructions[i + 6] = pTransformed[1];

      this._instructionIndex = i + 1 + 2 + 2 + 2;
      return this;
    },
    quadTo: function (c, p) {
      let i = this._instructionIndex;

      this._instructions[i] = instructionCodes.quadTo;

      let cTransformed = this._applyTransform([], this.getCurrentTransform(), c);
      let pTransformed = this._applyTransform([], this.getCurrentTransform(), p);

      this._instructions[i + 1] = cTransformed[0];
      this._instructions[i + 2] = cTransformed[1];

      this._instructions[i + 3] = pTransformed[0];
      this._instructions[i + 4] = pTransformed[1];

      this._instructionIndex = i + 1 + 2 + 2;
      return this;
    },

    commit: function (predicate) {

      let pOut = [];
      let cAOut = [];
      let cBOut = [];
      let instructions = this._instructions;
      let canvasCtx = this.canvasCtx;
      let i = 0;

      let op = () => {
        while (i < this._instructionIndex) {
          switch (this._instructions[i]) {
            case instructionCodes.moveTo:
              this._mapToCanvas(pOut, instructions.slice(i + 1, i + 3));

              canvasCtx.moveTo(pOut[0], pOut[1]);
              i += 1 + 2;
              break;
            case instructionCodes.lineTo:
              this._mapToCanvas(pOut, instructions.slice(i + 1, i + 3));

              canvasCtx.lineTo(pOut[0], pOut[1]);
              i += 1 + 2;
              break;
            case instructionCodes.bezierTo:
              this._mapToCanvas(cAOut, instructions.slice(i + 1, i + 3));
              this._mapToCanvas(cBOut, instructions.slice(i + 3, i + 5));
              this._mapToCanvas(pOut, instructions.slice(i + 5, i + 7));

              canvasCtx.bezierCurveTo(
                cAOut[0], cAOut[1],
                cBOut[0], cBOut[1],
                pOut[0], pOut[1]);
              i += 1 + 2 + 2 + 2;
              break;
            case instructionCodes.quadTo:
              this._mapToCanvas(cAOut, instructions.slice(i + 1, i + 3));
              this._mapToCanvas(pOut, instructions.slice(i + 3, i + 5));

              canvasCtx.quadraticCurveTo(
                cAOut[0], cAOut[0],
                pOut[0], pOut[1]);
              i += 1 + 2 + 2;
              break;
            default:
              throw new Error('Bad carve context instruction code');
          }
        }
        this._instructionIndex = 0;
      };

      if (typeof predicate === 'function') { predicate(canvasCtx, op); }
      else op();

      return this;
    },

    pushTransform: function (t) {
      this._transformIndex += 1;

      let transforms = this._transforms;
      let index = this._transformIndex;

      let nextTransform = transforms[index] ?
        transforms[index] : [];
      transforms[index] = this._mergeTransforms(nextTransform, transforms[index - 1], t);

      return this;
    },
    popTransform: function () {
      if (this._transformIndex > this._transformIndexLowerBound) {
        this._transformIndex -= 1;
      }
      return this;
    },
    getCurrentTransform: function () {
      return this._transforms[this._transformIndex];
    },

    branch: function () {
      let child = Object.create(this);

      child._transforms = [this.getCurrentTransform()];
      child._transformIndex = 0;
      child._transformIndexLowerBound = 0;

      child._instructions = [];
      child._instructionIndex = 0;

      return child;
    },

    sequence: function (predicate) {
      let carveCtx;
      let state;

      if(arguments[1] === undefined) {
        carveCtx = this;
      } else if(arguments[1] !== null && isCarveContext(arguments[1])) {
        carveCtx = arguments[1];
      } else {
        state = arguments[1];
        if(arguments[2] !== undefined && isCarveContext(arguments[2])){
          carveCtx = arguments[2];
        } else {
          carveCtx = this;
        }
      }

      let storeIndex = carveCtx._transformIndex;
      let storeLowerBound = carveCtx._transformIndexLowerBound;
      carveCtx._transformIndexLowerBound = storeIndex;

      predicate(carveCtx, state);

      carveCtx._transformIndex = storeIndex;
      carveCtx._transformIndexLowerBound = storeLowerBound;

      return this;
    }
  };

  let carveCtx = Object.create(carveRoot);

  carveCtx.canvasCtx = canvasCtx;

  carveCtx._transforms = [options.rootTransform];
  carveCtx._transformIndex = 0;
  carveCtx._transformIndexLowerBound = 0;

  carveCtx._instructions = [];
  carveCtx._instructionIndex = 0;

  return carveCtx;
};

export {carve, instructionCodes};
export default carve;