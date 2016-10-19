"use strict";
let expect = require('chai').expect;
let _ = require('lodash');
import {originAxis} from '../src/coordinates.js'

let canvasSize = [200, 100];

let points = [[0, 0], [20, 0], [0, 20], [-20, 0], [0, -20], [10, 10], [-10, -10]];

describe('OriginAxis Coordinate system', function () {

  it('should be an array', () => expect(originAxis).to.be.an('array'));

  it('should only contain functions',
    () => expect(_.every(originAxis, (v) => _.isFunction(v))).to.be.true);

  describe('Axis-Origin mapping function at index 0 (canvas center mapping)', function () {

    it('should be a function', () => expect(originAxis[0](canvasSize)).to.be.a('function'));

    it('should return an array if passed an array',
      () => expect(originAxis[0](canvasSize)([], [0, 0])).to.be.an('array'));

    it('should return an array that are half the canvasSize\'s width and height if passed an origin point ( [0, 0] )',
      () => expect(originAxis[0](canvasSize)([], [0, 0])).to.eql([canvasSize[0] * 0.5, canvasSize[1] * 0.5]));

  });
});