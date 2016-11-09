// let carveCtx;
// let shapeObj;

import {mapCoordinates} from './coordinates.js';
import {instructionCodes} from './codes';
import {moveTo, lineTo, quadTo, bezierTo} from './path';
import {push, pop, apply, merge} from './transform';
import {instructions} from './instructions';


let sequence = (predicate, state, configuration) => {

  let applySequenceConfiguration = function applySequenceConfiguration(obj, configuration){
    configuration = configuration || {};

    obj.instructions = configuration.instructions || [];
    obj.iIndex = Number.isInteger(configuration.instructionIndex) ?
      configuration.instructionIndex : 0;
    obj.transforms = configuration.transforms || [];
    obj.tIndex = Number.isInteger(configuration.transformIndex) ?
      configuration.transformIndex : 0;
    obj.tLowerBound = Number.isInteger(configuration.transformLowerBound) ?
      configuration.transformLowerBound : 0;
    obj.instructor = configuration.instructor;

    return obj;
  };

  let operations = {
    cache: [[0, 0], [0, 0], [0, 0]],
    moveTo(p) {
      this.iIndex = moveTo(
        this.instructions,
        this.iIndex,
        this.applyTransform(this.cache[0], this.getTransform(this.cache[0]), p));
      return this;
    },
    lineTo(p) {
      this.iIndex = lineTo(
        this.instructions,
        this.iIndex,
        this.applyTransform(this.cache[0], this.getTransform(this.cache[0]), p));
      return this;
    },
    quadTo(c, p) {
      this.iIndex = quadTo(
        this.instructions,
        this.iIndex,
        this.applyTransform(this.cache[0], this.getTransform(this.cache[0]), c),
        this.applyTransform(this.cache[1], this.getTransform(this.cache[1]), p));
      return this;
    },
    bezierTo(cA, cB, p) {
      this.iIndex = bezierTo(
        this.instructions,
        this.iIndex,
        this.applyTransform(this.cache[0], this.getTransform(this.cache[0]), cA),
        this.applyTransform(this.cache[1], this.getTransform(this.cache[1]), cB),
        this.applyTransform(this.cache[2], this.getTransform(this.cache[2]), p));
      return this;
    },

    getTransform(out) {
      if (this.tIndex === 0) {
        out[0] = 0;
        out[1] = 0;
      } else {
        out[0] = this.transforms[this.tIndex - 2];
        out[1] = this.transforms[this.tIndex - 1];
      }
      return out;
    },
    applyTransform(out, t, p) {
      if (this.tIndex === 0) {
        out[0] = p[0];
        out[1] = p[1];
      } else {
        apply(out, t, p);
      }
      return out;
    },
    pushTransform(t) {
      this.tIndex = push(
        this.transforms,
        this.tIndex,
        merge(this.cache[0], this.getTransform(this.cache[0]), t));
      return this;
    },
    pushGlobalTransform(t) {
      this.tIndex = push(this.transforms, this.tIndex, t);
      return this;
    },
    popTransform() {
      this.tIndex = pop(this.tIndex, this.tLowerBound);
      return this;
    },

    sequence(predicate, state) {

      let storeTIndex = this.tIndex;
      let storeLowerBound = this.tLowerBound;
      this.tLowerBound = this.tIndex;
      predicate(this, state);

      this.tIndex = storeTIndex;
      this.tLowerBound = storeLowerBound;

      return this;
    },
    commit(predicate) {
      if(typeof this.instructor !== 'object'){
        throw new TypeError('Must provide a instructor object in the configuration to use commit');
      }

      let instructor = this.instructor;
      let instructions = this.instructions;
      let operation = () => { instructor.commit(instructions); };

      if(typeof predicate === 'function'){
        predicate(this.instructor.canvasContext, operation)
      } else operation();

      return this;
    },
    branch(configuration) {
      configuration = configuration || {};
      configuration.instructor = configuration.instructor || this.instructor;

      let branch = applySequenceConfiguration(Object.create(Object.getPrototypeOf(this)), configuration);

      this.getTransform(branch.transforms);
      branch.tLowerBound = 2;
      return branch;
    }
  };

  // configuration = configuration || {};
  let seqCtx = applySequenceConfiguration(Object.create(operations), configuration);

  seqCtx.sequence(predicate, state);
  let iIndex = seqCtx.iIndex;

  if (iIndex < seqCtx.instructions.length) seqCtx.instructions[iIndex] = -1;
  return seqCtx.instructions;
};
let instructor = (canvasContext, pointRemapFunction) => {
  if(typeof pointRemapFunction !== 'function') {
    throw new TypeError('Must provide a remap function');
  }

  let builtInstructions = instructions(canvasContext, pointRemapFunction);
  let operations = [];
  operations[instructionCodes.moveTo] = builtInstructions.moveTo;
  operations[instructionCodes.lineTo] = builtInstructions.lineTo;
  operations[instructionCodes.quadTo] = builtInstructions.quadTo;
  operations[instructionCodes.bezierTo] = builtInstructions.bezierTo;

  let commit = function commit(instructions) {
    let iIndex = 0;
    while(iIndex < instructions.length && instructions[iIndex] != -1){
      iIndex = operations[instructions[iIndex]](instructions, iIndex);
    }
  };
  commit.prototype.canvasContext = canvasContext;
  return {canvasContext, commit};
};

let carve = {
  sequence,
  instructor

};

export {carve, sequence, instructor};

export default carve;

// let carve = (srcCtx, options) => {
//   let canvasCtx = validateCanvasCtxArgument(srcCtx);
//
//   // options = options ? Object.create(options) : {};;
//   // options.originOffset = options.originOffset ? options.originOffset :
//   //   [canvasCtx.canvas.width * 0.5, canvasCtx.canvas.height * 0.5];
//   // options.flipX = options.flipX === true; //default false
//   // options.flipY = options.flipY !== false; //default true
//   options = Object.assign({}, {
//     rootTransform: [0, 0],
//     originOffset: [canvasCtx.canvas.width * 0.5, canvasCtx.canvas.height * 0.5],
//     flipX: false,
//     flipY: true
//   }, options );
//
//   let carveRoot = {
//     get _sentinel(){ return sentinelString },
//     _mapToCanvas: mapCoordinates(options.originOffset, options.flipX, options.flipY),
//     _applyTransform: function (out, transform, p) {
//       return this._mergeTransforms(out, transform, p);
//     },
//     _mergeTransforms: function (out, a, b) {
//       out[0] = a[0] + b[0];
//       out[1] = a[1] + b[1];
//       return out;
//     },
//
//     moveTo: function (p = [0, 0]) {
//       let i = this._instructionIndex;
//
//       this._instructions[i] = instructionCodes.moveTo;
//
//       let pTransformed = this._applyTransform([], this.getCurrentTransform(), p);
//
//       this._instructions[i + 1] = pTransformed[0];
//       this._instructions[i + 2] = pTransformed[1];
//
//       this._instructionIndex = i + 1 + 2;
//       return this;
//     },
//     lineTo: function (p = [0, 0]) {
//       let i = this._instructionIndex;
//
//       this._instructions[i] = instructionCodes.lineTo;
//
//       let pTransformed = this._applyTransform([], this.getCurrentTransform(), p);
//
//       this._instructions[i + 1] = pTransformed[0];
//       this._instructions[i + 2] = pTransformed[1];
//
//       this._instructionIndex = i + 1 + 2;
//       return this;
//     },
//     bezierTo: function (cA, cB, p) {
//       let i = this._instructionIndex;
//
//       this._instructions[i] = instructionCodes.bezierTo;
//
//       let cATransformed = this._applyTransform([], this.getCurrentTransform(), cA);
//       let cBTransformed = this._applyTransform([], this.getCurrentTransform(), cB);
//       let pTransformed = this._applyTransform([], this.getCurrentTransform(), p);
//
//       this._instructions[i + 1] = cATransformed[0];
//       this._instructions[i + 2] = cATransformed[1];
//
//       this._instructions[i + 3] = cBTransformed[0];
//       this._instructions[i + 4] = cBTransformed[1];
//
//       this._instructions[i + 5] = pTransformed[0];
//       this._instructions[i + 6] = pTransformed[1];
//
//       this._instructionIndex = i + 1 + 2 + 2 + 2;
//       return this;
//     },
//     quadTo: function (c, p) {
//       let i = this._instructionIndex;
//
//       this._instructions[i] = instructionCodes.quadTo;
//
//       let cTransformed = this._applyTransform([], this.getCurrentTransform(), c);
//       let pTransformed = this._applyTransform([], this.getCurrentTransform(), p);
//
//       this._instructions[i + 1] = cTransformed[0];
//       this._instructions[i + 2] = cTransformed[1];
//
//       this._instructions[i + 3] = pTransformed[0];
//       this._instructions[i + 4] = pTransformed[1];
//
//       this._instructionIndex = i + 1 + 2 + 2;
//       return this;
//     },
//
//     instructions: function (predicate) {
//
//       let pOut = [];
//       let cAOut = [];
//       let cBOut = [];
//       let instructions = this._instructions;
//       let canvasCtx = this.canvasCtx;
//       let i = 0;
//
//       let op = () => {
//         while (i < this._instructionIndex) {
//           switch (this._instructions[i]) {
//             case instructionCodes.moveTo:
//               this._mapToCanvas(pOut, instructions.slice(i + 1, i + 3));
//
//               canvasCtx.moveTo(pOut[0], pOut[1]);
//               i += 1 + 2;
//               break;
//             case instructionCodes.lineTo:
//               this._mapToCanvas(pOut, instructions.slice(i + 1, i + 3));
//
//               canvasCtx.lineTo(pOut[0], pOut[1]);
//               i += 1 + 2;
//               break;
//             case instructionCodes.bezierTo:
//               this._mapToCanvas(cAOut, instructions.slice(i + 1, i + 3));
//               this._mapToCanvas(cBOut, instructions.slice(i + 3, i + 5));
//               this._mapToCanvas(pOut, instructions.slice(i + 5, i + 7));
//
//               canvasCtx.bezierCurveTo(
//                 cAOut[0], cAOut[1],
//                 cBOut[0], cBOut[1],
//                 pOut[0], pOut[1]);
//               i += 1 + 2 + 2 + 2;
//               break;
//             case instructionCodes.quadTo:
//               this._mapToCanvas(cAOut, instructions.slice(i + 1, i + 3));
//               this._mapToCanvas(pOut, instructions.slice(i + 3, i + 5));
//
//               canvasCtx.quadraticCurveTo(
//                 cAOut[0], cAOut[1],
//                 pOut[0], pOut[1]);
//               i += 1 + 2 + 2;
//               break;
//             default:
//               throw new Error('Bad carve context instruction code');
//           }
//         }
//         this._instructionIndex = 0;
//       };
//
//       if (typeof predicate === 'function') { predicate(canvasCtx, op); }
//       else op();
//
//       return this;
//     },
//
//     pushTransform: function (t) {
//       this._transformIndex += 1;
//
//       let transforms = this._transforms;
//       let index = this._transformIndex;
//
//       let nextTransform = transforms[index] ?
//         transforms[index] : [];
//       transforms[index] = this._mergeTransforms(nextTransform, transforms[index - 1], t);
//
//       return this;
//     },
//     pushGlobalTransform: function (t) {
//       this._transformIndex += 1;
//
//       let transforms = this._transforms;
//       let index = this._transformIndex;
//
//       let nextTransform = transforms[index] ?
//         transforms[index] : [];
//
//       nextTransform[0] = t[0];
//       nextTransform[1] = t[1];
//       transforms[index] = nextTransform;
//       return this;
//     },
//     popTransform: function () {
//       if (this._transformIndex > this._transformIndexLowerBound) {
//         this._transformIndex -= 1;
//       }
//       return this;
//     },
//     getCurrentTransform: function () {
//       return this._transforms[this._transformIndex];
//     },
//
//     branch: function () {
//       let child = Object.create(this);
//
//       child._transforms = [this.getCurrentTransform()];
//       child._transformIndex = 0;
//       child._transformIndexLowerBound = 0;
//
//       child._instructions = [];
//       child._instructionIndex = 0;
//
//       return child;
//     },
//
//     sequence: function (predicate) {
//       let carveCtx;
//       let state;
//
//       if(arguments[1] === undefined) {
//         carveCtx = this;
//       } else if(arguments[1] !== null && isCarveContext(arguments[1])) {
//         carveCtx = arguments[1];
//       } else {
//         state = arguments[1];
//         if(arguments[2] !== undefined && isCarveContext(arguments[2])){
//           carveCtx = arguments[2];
//         } else {
//           carveCtx = this;
//         }
//       }
//
//       let storeIndex = carveCtx._transformIndex;
//       let storeLowerBound = carveCtx._transformIndexLowerBound;
//       carveCtx._transformIndexLowerBound = storeIndex;
//
//       predicate(carveCtx, state);
//
//       carveCtx._transformIndex = storeIndex;
//       carveCtx._transformIndexLowerBound = storeLowerBound;
//
//       return this;
//     }
//   };
//
//   let carveCtx = Object.create(carveRoot);
//
//   carveCtx.canvasCtx = canvasCtx;
//
//   carveCtx._transforms = [options.rootTransform];
//   carveCtx._transformIndex = 0;
//   carveCtx._transformIndexLowerBound = 0;
//
//   carveCtx._instructions = [];
//   carveCtx._instructionIndex = 0;
//
//   return carveCtx;
// };
//
// export {carve, instructionCodes};
// export default carve;