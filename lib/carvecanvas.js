(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.carvecanvas = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var instructionCodes = {
  nil: -1,
  moveTo: 0,
  lineTo: 1,
  bezierTo: 2,
  quadTo: 3
};

exports.instructionCodes = instructionCodes;
exports.default = instructionCodes;

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.carve = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _codes = require('./codes');

var _path = require('./path');

var _transform = require('./transform');

var _instructions = require('./instructions');

var applySequenceConfiguration = function applySequenceConfiguration(obj, configuration) {
  configuration = configuration || {};

  obj.instructions = configuration.instructions || [];
  obj.iIndex = Number.isInteger(configuration.instructionIndex) ? configuration.instructionIndex : 0;
  obj.transforms = configuration.transforms || [];
  obj.tIndex = Number.isInteger(configuration.transformIndex) ? configuration.transformIndex : 0;
  obj.tLowerBound = Number.isInteger(configuration.transformLowerBound) ? configuration.transformLowerBound : 0;
  obj.instructor = configuration.instructor;

  return obj;
};

var capInstructions = function capInstructions(instructions, iIndex) {
  if (iIndex < instructions.length) instructions[iIndex] = -1;
  return instructions;
};

var sequenceActions = {
  cache: [[0, 0], [0, 0], [0, 0]],
  moveTo: function moveTo(p) {
    this.iIndex = (0, _path.moveTo)(this.instructions, this.iIndex, this.applyTransform(this.cache[0], this.getTransform(this.cache[0]), p));
    return this;
  },
  lineTo: function lineTo(p) {
    this.iIndex = (0, _path.lineTo)(this.instructions, this.iIndex, this.applyTransform(this.cache[0], this.getTransform(this.cache[0]), p));
    return this;
  },
  quadTo: function quadTo(c, p) {
    this.iIndex = (0, _path.quadTo)(this.instructions, this.iIndex, this.applyTransform(this.cache[0], this.getTransform(this.cache[0]), c), this.applyTransform(this.cache[1], this.getTransform(this.cache[1]), p));
    return this;
  },
  bezierTo: function bezierTo(cA, cB, p) {
    this.iIndex = (0, _path.bezierTo)(this.instructions, this.iIndex, this.applyTransform(this.cache[0], this.getTransform(this.cache[0]), cA), this.applyTransform(this.cache[1], this.getTransform(this.cache[1]), cB), this.applyTransform(this.cache[2], this.getTransform(this.cache[2]), p));
    return this;
  },
  getInstructions: function getInstructions() {
    return this.instructions;
  },
  getTransform: function getTransform(out) {
    if (this.tIndex === 0) {
      out[0] = 0;
      out[1] = 0;
    } else {
      out[0] = this.transforms[this.tIndex - 2];
      out[1] = this.transforms[this.tIndex - 1];
    }
    return out;
  },
  applyTransform: function applyTransform(out, t, p) {
    if (this.tIndex === 0) {
      out[0] = p[0];
      out[1] = p[1];
    } else {
      (0, _transform.apply)(out, t, p);
    }
    return out;
  },
  pushTransform: function pushTransform(t) {
    this.tIndex = (0, _transform.push)(this.transforms, this.tIndex, (0, _transform.merge)(this.cache[0], this.getTransform(this.cache[0]), t));
    return this;
  },
  pushGlobalTransform: function pushGlobalTransform(t) {
    this.tIndex = (0, _transform.push)(this.transforms, this.tIndex, t);
    return this;
  },
  popTransform: function popTransform() {
    this.tIndex = (0, _transform.pop)(this.tIndex, this.tLowerBound);
    return this;
  },
  sequence: function sequence(predicate, state) {

    var storeTIndex = this.tIndex;
    var storeLowerBound = this.tLowerBound;
    this.tLowerBound = this.tIndex;
    predicate(this, state);

    this.tIndex = storeTIndex;
    this.tLowerBound = storeLowerBound;

    return this;
  },
  branch: function branch(predicate, configuration) {
    configuration = configuration || {};
    configuration.instructor = configuration.instructor || this.instructor;
    var branch = applySequenceConfiguration(Object.create(Object.getPrototypeOf(this)), configuration);

    this.getTransform(branch.transforms);
    branch.tLowerBound = 2;

    predicate(branch, configuration.state);

    return capInstructions(branch.instructions, branch.iIndex);
  }
};

var passthroughProjection = function passthroughProjection(out, p) {
  out[0] = p[0];
  out[1] = p[1];
  return out;
};

var carve = function carve(canvasContext, configuration) {

  if (configuration !== undefined && (typeof configuration === 'undefined' ? 'undefined' : _typeof(configuration)) !== 'object') {
    throw TypeError('configuration must be an object');
  }
  configuration = configuration || {};

  var projection = void 0;
  if (configuration.projection !== undefined) {
    if (typeof configuration.projection === 'function') {
      projection = configuration.projection;
    } else {
      throw TypeError('configuration.projection must be a function');
    }
  } else {
    projection = passthroughProjection;
  }

  var builtInstructions = (0, _instructions.instructions)(canvasContext, projection);
  var operations = [];
  operations[_codes.instructionCodes.moveTo] = builtInstructions.moveTo;
  operations[_codes.instructionCodes.lineTo] = builtInstructions.lineTo;
  operations[_codes.instructionCodes.quadTo] = builtInstructions.quadTo;
  operations[_codes.instructionCodes.bezierTo] = builtInstructions.bezierTo;

  var commit = function commit(instructions) {
    var iIndex = 0;
    while (iIndex < instructions.length && instructions[iIndex] != -1) {
      iIndex = operations[instructions[iIndex]](instructions, iIndex);
    }
  };

  var commitSequence = function commitSequence(predicate) {
    var instructions = capInstructions(this.instructions, this.iIndex);
    var executeCommit = function executeCommit() {
      commit(instructions);
    };
    if (typeof predicate === 'function') {
      predicate(canvasContext, executeCommit);
    } else executeCommit();
    this.iIndex = 0;
    return this;
  };

  var carveCtx = applySequenceConfiguration(Object.create(Object.assign({}, { commit: commitSequence }, sequenceActions)), configuration);

  return {
    sequence: function sequence(predicate, state) {
      predicate(carveCtx, state);
      return carveCtx.instructions;
    },
    commit: commit
  };
};

exports.carve = carve;
exports.default = carve;

},{"./codes":1,"./instructions":3,"./path":4,"./transform":5}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var instructions = function instructions(canvasContext, remapCoordinates) {
  var cache = [[0, 0], [0, 0], [0, 0]];
  return {
    moveTo: function moveTo(instructions, index) {
      var point = remapCoordinates(cache[0], instructions.slice(index + 1, index + 3));
      canvasContext.moveTo(point[0], point[1]);
      return index + 3;
    },
    lineTo: function lineTo(instructions, index) {
      var point = remapCoordinates(cache[0], instructions.slice(index + 1, index + 3));
      canvasContext.lineTo(point[0], point[1]);
      return index + 3;
    },
    quadTo: function quadTo(instructions, index) {
      var control = remapCoordinates(cache[0], instructions.slice(index + 1, index + 3));
      var point = remapCoordinates(cache[1], instructions.slice(index + 3, index + 5));
      canvasContext.quadraticCurveTo(control[0], control[1], point[0], point[1]);
      return index + 5;
    },
    bezierTo: function bezierTo(instructions, index) {
      var controlA = remapCoordinates(cache[0], instructions.slice(index + 1, index + 3));
      var controlB = remapCoordinates(cache[1], instructions.slice(index + 3, index + 5));
      var point = remapCoordinates(cache[2], instructions.slice(index + 5, index + 7));
      canvasContext.bezierCurveTo(controlA[0], controlA[1], controlB[0], controlB[1], point[0], point[1]);
      return index + 7;
    }
  };
};

exports.instructions = instructions;
exports.default = { instructions: instructions };

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bezierTo = exports.quadTo = exports.lineTo = exports.moveTo = undefined;

var _codes = require('./codes.js');

var moveTo = function moveTo(outInstructions, index) {
  var point = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0, 0];

  outInstructions[index] = _codes.instructionCodes.moveTo;
  outInstructions[index + 1] = point[0];
  outInstructions[index + 2] = point[1];
  return index += 3;
};
var lineTo = function lineTo(outInstructions, index) {
  var point = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0, 0];

  outInstructions[index] = _codes.instructionCodes.lineTo;
  outInstructions[index + 1] = point[0];
  outInstructions[index + 2] = point[1];
  return index += 3;
};
var quadTo = function quadTo(outInstructions, index, control, point) {
  outInstructions[index] = _codes.instructionCodes.quadTo;
  outInstructions[index + 1] = control[0];
  outInstructions[index + 2] = control[1];
  outInstructions[index + 3] = point[0];
  outInstructions[index + 4] = point[1];
  return index += 5;
};

var bezierTo = function bezierTo(outInstructions, index, controlA, controlB, point) {
  outInstructions[index] = _codes.instructionCodes.bezierTo;
  outInstructions[index + 1] = controlA[0];
  outInstructions[index + 2] = controlA[1];
  outInstructions[index + 3] = controlB[0];
  outInstructions[index + 4] = controlB[1];
  outInstructions[index + 5] = point[0];
  outInstructions[index + 6] = point[1];
  return index + 7;
};

exports.moveTo = moveTo;
exports.lineTo = lineTo;
exports.quadTo = quadTo;
exports.bezierTo = bezierTo;
exports.default = { moveTo: moveTo, lineTo: lineTo, quadTo: quadTo, bezierTo: bezierTo };

},{"./codes.js":1}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var push = function push(outTransformArray, index, offset) {
  outTransformArray[index] = offset[0];
  outTransformArray[index + 1] = offset[1];
  return index + 2;
};

var pop = function pop(index) {
  var lowerBound = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  return Math.max(index - 2, Math.max(lowerBound, 0));
};

var merge = function merge(out, transformA, transformB) {
  out[0] = transformA[0] + transformB[0];
  out[1] = transformA[1] + transformB[1];
  return out;
};

var apply = function apply(out, transform, point) {
  return merge(out, transform, point);
};

exports.push = push;
exports.pop = pop;
exports.merge = merge;
exports.apply = apply;
exports.default = { push: push, pop: pop, merge: merge };

},{}]},{},[2])(2)
});