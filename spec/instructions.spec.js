let expect = require('chai').expect;
let _ = require('lodash');

import {canvasRenderingContext2DMock} from './canvasRenderingContext2D.mock'
import {instructions} from '../src/instructions'

let mockContext = canvasRenderingContext2DMock();
let remapStore = [];
let remapper = (out, v) => {
  out[0] = v[0] + 1;
  out[1] = v[1] - 1;
  remapStore.push(out);
  return out;
};
let instructorInstance;

describe('Instructor', () => {

  beforeEach(() => {
    mockContext.reset();
    remapStore = [];
    instructorInstance = instructions(mockContext, remapper);
  });

  describe('Move To', () => {

    it('should return a number 3 larger than the passed index value', () => {
      let index = 5;
      expect(instructorInstance.moveTo([0, 10, 10], index)).to.equal(index + 3);
    });

    it('should send the two values after index through the remapCoordinates function', () => {
      let index = 0;
      let point = [10, 15];
      let instructions = [0].concat(point);
      instructorInstance.moveTo(instructions, index);
      expect(remapStore[0]).to.deep.equal(remapper([], point));
    });

    it('should call the moveTo function on the canvas context 2D object', () => {
      let index = 0;
      let point = [10, 15];
      let instructions = [0].concat(point);

      instructorInstance.moveTo(instructions, index);

      expect(mockContext.storage[0].type).to.equal('moveTo');
    });

    it('should send the output from the remap coordinate\'s function into ' +
      'the canvas context 2D\'s moveTo function', () => {
      let index = 0;
      let point = [10, 15];
      let instructions = [0].concat(point);

      instructorInstance.moveTo(instructions, index);

      expect(mockContext.storage[0].point).to.deep.equal(remapper([], point));
    });

  });
  describe('Line To', () => {

    it('should return a number 3 larger than the passed in index', () => {
      let index = 6;
      expect(instructorInstance.lineTo([], index)).to.equal(index + 3);
    });

    it('should send the two values after index through the remapCoordinates function', () => {
      let index = 0;
      let point = [10, 15];
      let instructions = [0].concat(point);
      instructorInstance.lineTo(instructions, index);
      expect(remapStore[0]).to.deep.equal(remapper([], point));
    });

    it('should call the lineTo function on the canvas context 2D object', () => {
      let index = 0;
      let point = [10, 15];
      let instructions = [0].concat(point);

      instructorInstance.lineTo(instructions, index);

      expect(mockContext.storage[0].type).to.equal('lineTo');
    });

    it('should send the output from the remap coordinate\'s function into ' +
      'the canvas context 2D\'s lineTo function', () => {
      let index = 0;
      let point = [10, 15];
      let instructions = [0].concat(point);

      instructorInstance.lineTo(instructions, index);

      expect(mockContext.storage[0].point).to.deep.equal(remapper([], point));
    });

  });
  describe('Quad To', () => {

    it('should return a number 5 larger than the passed index value', () => {
      let index = 3;
      expect(instructorInstance.quadTo([], index)).to.equal(index + 5);
    });
    it('should pass the control values after the index through the remapCoordinates function', () => {
      let index = 0;
      let control = [8, 7];
      let point = [10, 15];
      let instructions = [0].concat(control, point);

      instructorInstance.quadTo(instructions, index);

      expect(remapStore[0]).to.deep.equal(remapper([], control));
    });
    it('should pass the point values after the index through the remapCoordinates function', () => {
      let index = 0;
      let control = [8, 7];
      let point = [10, 15];
      let instructions = [0].concat(control, point);

      instructorInstance.quadTo(instructions, index);

      expect(remapStore[1]).to.deep.equal(remapper([], point));
    });
    it('should call the quadraticCurveTo function on the canvas context 2D object', () => {
      let index = 0;
      let control = [8, 7];
      let point = [10, 15];
      let instructions = [0].concat(control, point);

      instructorInstance.quadTo(instructions, index);

      expect(mockContext.storage[0].type).to.equal('quadraticCurveTo');
    });

    it('should pass the control point to the quadratic curve function', () => {
      let index = 0;
      let control = [8, 7];
      let point = [10, 15];
      let instructions = [0].concat(control, point);

      instructorInstance.quadTo(instructions, index);

      expect(mockContext.storage[0].control).to.deep.equal(remapper([], control));
    });

    it('should pass the point to the quadratic curve function', () => {
      let index = 0;
      let control = [8, 7];
      let point = [10, 15];
      let instructions = [0].concat(control, point);

      instructorInstance.quadTo(instructions, index);

      expect(mockContext.storage[0].point).to.deep.equal(remapper([], point));
    });

  });

  describe('Bezier To', () => {

    it('should return an number 7 larger than the passed index value', () => {
      let index = 17;
      expect(instructorInstance.bezierTo([], index)).to.equal(index + 7);
    });
    it('should pass the first control values after the index through the coordinate remapper function', () => {
      let index = 0;
      let controlA = [8, 7];
      let controlB = [10, 10];
      let point = [10, 15];
      let instructions = [0].concat(controlA, controlB, point);

      instructorInstance.bezierTo(instructions, index);

      expect(remapStore[0]).to.deep.equal(remapper([], controlA));
    });
    it('should pass the second control values after the index through the coordinate remapper function', () => {
      let index = 0;
      let controlA = [8, 7];
      let controlB = [10, 10];
      let point = [10, 15];
      let instructions = [0].concat(controlA, controlB, point);

      instructorInstance.bezierTo(instructions, index);

      expect(remapStore[1]).to.deep.equal(remapper([], controlB));
    });
    it('should pass the point values after the index through the coordinate remapper function', () => {
      let index = 0;
      let controlA = [8, 7];
      let controlB = [10, 10];
      let point = [10, 15];
      let instructions = [0].concat(controlA, controlB, point);

      instructorInstance.bezierTo(instructions, index);

      expect(remapStore[2]).to.deep.equal(remapper([], point));
    });
    it('should call the bezierCurveTo function on the canvas context 2D object', () => {
      let index = 0;
      let controlA = [8, 7];
      let controlB = [10, 10];
      let point = [10, 15];
      let instructions = [0].concat(controlA, controlB, point);

      instructorInstance.bezierTo(instructions, index);

      expect(mockContext.storage[0].type).to.equal('bezierCurveTo');
    });
    it('should send the first control point to the bezierCurveTo function', () => {
      let index = 0;
      let controlA = [8, 7];
      let controlB = [10, 10];
      let point = [10, 15];
      let instructions = [0].concat(controlA, controlB, point);

      instructorInstance.bezierTo(instructions, index);

      expect(mockContext.storage[0].controlA).to.deep.equal(remapper([], controlA));
    });
    it('should send the second control point to the bezierCurveTo function', () => {
      let index = 0;
      let controlA = [8, 7];
      let controlB = [10, 10];
      let point = [10, 15];
      let instructions = [0].concat(controlA, controlB, point);

      instructorInstance.bezierTo(instructions, index);

      expect(mockContext.storage[0].controlB).to.deep.equal(remapper([], controlB));
    });
    it('should send the point to the bezierCurveTo function', () => {
      let index = 0;
      let controlA = [8, 7];
      let controlB = [10, 10];
      let point = [10, 15];
      let instructions = [0].concat(controlA, controlB, point);

      instructorInstance.bezierTo(instructions, index);

      expect(mockContext.storage[0].point).to.deep.equal(remapper([], point));
    });

  });

});