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

  let capInstructions = (instructions, iIndex) => {
    if(iIndex < instructions.length) instructions[iIndex] = -1;
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
    commit(predicate) {
      if(typeof this.instructor !== 'object'){
        throw new TypeError('Must provide a instructor object in the configuration to use commit');
      }

      let instructor = this.instructor;
      let instructions = this.instructions;
      let operation = () => {
        instructor.commit(capInstructions(instructions, this.iIndex));
        this.iIndex = 0;
      };

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

  return capInstructions(seqCtx.instructions, seqCtx.iIndex);
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

export {carve, sequence, instructor, mapCoordinates};

export default carve;