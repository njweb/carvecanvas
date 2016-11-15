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

let sequenceActions = {
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

  getInstructions() {return this.instructions;},

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

let passthroughProjection = (out, p) => {
  out[0] = p[0];
  out[1] = p[1];
  return out;
};

let carve = (canvasContext, configuration) => {

  if(configuration !== undefined && typeof  configuration !== 'object'){
    throw TypeError('configuration must be an object');
  }
  configuration = configuration || {};

  let projection;
  if (configuration.projection !== undefined) {
    if(typeof configuration.projection === 'function') {
      projection = configuration.projection;
    }
    else {
      throw TypeError('configuration.projection must be a function');
    }
  } else {
    projection = passthroughProjection;
  }

  let builtInstructions = instructions(canvasContext, projection);
  let operations = [];
  operations[instructionCodes.moveTo] = builtInstructions.moveTo;
  operations[instructionCodes.lineTo] = builtInstructions.lineTo;
  operations[instructionCodes.quadTo] = builtInstructions.quadTo;
  operations[instructionCodes.bezierTo] = builtInstructions.bezierTo;

  let commit = (instructions) => {
    let iIndex = 0;
    while (iIndex < instructions.length && instructions[iIndex] != -1) {
      iIndex = operations[instructions[iIndex]](instructions, iIndex);
    }
  };

  let commitSequence = function commitSequence(predicate) {
    let instructions = capInstructions(this.instructions, this.iIndex);
    let executeCommit = () => { commit(instructions); };
    if (typeof predicate === 'function') {
      predicate(canvasContext, executeCommit);
    } else executeCommit();
    this.iIndex = 0;
    return this;
  };

  let carveCtx = applySequenceConfiguration(
    Object.create(Object.assign({}, {commit: commitSequence}, sequenceActions)),
    configuration);

  return {
    sequence: (predicate, state) => {
      predicate(carveCtx, state);
      return carveCtx.instructions;
    },
    commit
  };
};

export {carve};

export default carve;