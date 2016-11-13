import {mapCoordinates} from './coordinates.js';
import {instructionCodes} from './codes';
import {moveTo, lineTo, quadTo, bezierTo} from './path';
import {push, pop, apply, merge} from './transform';
import {instructions} from './instructions';


let applySequenceConfiguration = function applySequenceConfiguration(obj, configuration) {
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

let capInstructions = (instructions, iIndex) => {
  if (iIndex < instructions.length) instructions[iIndex] = -1;
  return instructions;
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
  branch(predicate, configuration) {
    configuration = configuration || {};
    configuration.instructor = configuration.instructor || this.instructor;
    let branch = applySequenceConfiguration(Object.create(Object.getPrototypeOf(this)), configuration);

    this.getTransform(branch.transforms);
    branch.tLowerBound = 2;

    predicate(branch, configuration.state);

    return capInstructions(branch.instructions, branch.iIndex);
  }
};

let carve = function carve(canvasContext, mapCoordinates) {

  if(typeof canvasContext !== 'object') {
    throw TypeError("First argument must be a canvasRenderingContext2D object");
  }
  if (typeof mapCoordinates !== 'function') {
    throw new TypeError('Must provide a remap function');
  }

  let builtInstructions = instructions(canvasContext, mapCoordinates);
  let operations = [];
  operations[instructionCodes.moveTo] = builtInstructions.moveTo;
  operations[instructionCodes.lineTo] = builtInstructions.lineTo;
  operations[instructionCodes.quadTo] = builtInstructions.quadTo;
  operations[instructionCodes.bezierTo] = builtInstructions.bezierTo;

  let commit = function commit(instructions, predicate) {
    let execute = () => {
      let iIndex = 0;
      while (iIndex < instructions.length && instructions[iIndex] != -1) {
        iIndex = operations[instructions[iIndex]](instructions, iIndex);
      }
    };
    if(typeof predicate === 'function'){
      predicate(canvasContext, execute);
    } else execute();
    return commit;
  };

  return commit;
};
carve.sequence = (predicate, configuration) => {
  configuration = configuration || {};

  let seqCtx = applySequenceConfiguration(Object.create(operations), configuration);
  predicate(seqCtx, configuration.state);
  return capInstructions(seqCtx.instructions, seqCtx.iIndex);
};

export {carve};

export default carve;