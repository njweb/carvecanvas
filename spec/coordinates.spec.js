"use strict";
let expect = require('chai').expect;
let _ = require('lodash');
import {mapCoordinates} from '../src/coordinates.js'

let calcRatio = (values) => { return (values[1] - values[0]) / (values[2] - values[1]); };

describe('Point Coordinate Manipulation', function () {

  it('should be a function', () => expect(mapCoordinates).to.be.a('function'));

  it('should return a function', () => expect(mapCoordinates()).to.be.a('function'));

  it('should return the offset value if passed [0, 0]', () => {
    let offset = [100, 100];
    let mapper = mapCoordinates(offset);
    expect(mapper([], [0, 0])).to.deep.equal(offset);
  });

  it('should transform the x value (index 0) linearly', () => {
    let offset = [100, 100];
    let points = [[0, 0], [10, 0], [20, 0]];
    let origRatio = calcRatio(_.map(points, (p) => p[0]));

    let mapper = mapCoordinates(offset);
    let outPoints = _.map(points, (p) => mapper([], p));
    expect(calcRatio(_.map(outPoints, (p) => p[0]))).to.equal(origRatio);
  });

  it('should transform the y value (index 1) linearly', () => {
    let offset = [100, 100];
    let points = [[0, 0], [0, 20], [0, 40]];
    let origRatio = calcRatio(_.map(points, (p)=>p[1]));

    let mapper = mapCoordinates(offset);
    let outPoints = _.map(points, (p) => mapper([], p));
    expect(calcRatio(_.map(outPoints, (p) => p[1]))).to.equal(origRatio);
  });

  it('should be able retain the x relative magnitude value', () => {
    let mapper = mapCoordinates([100, 100], false);

    let pointA = [10, 0];
    let pointB = [20, 0];

    let outputA = mapper([], pointA);
    let outputB = mapper([], pointB);

    expect(outputA[0]).to.be.lessThan(outputB[0]);
  });

  it('should be able flip the x relative magnitude value', () => {
    let mapper = mapCoordinates([100, 100], true);

    let pointA = [10, 0];
    let pointB = [20, 0];

    let outputA = mapper([], pointA);
    let outputB = mapper([], pointB);

    expect(outputB[0]).to.be.lessThan(outputA[0]);
  });

  it('should be able to retain the y relative magnitude value', () => {
    let mapper = mapCoordinates([100, 100], false, false);

    let pointA = [0, 10];
    let pointB = [0, 20];

    let outputA = mapper([], pointA);
    let outputB = mapper([], pointB);

    expect(outputA[1]).to.be.lessThan(outputB[1]);
  });

  it('should be able to flip the y relative magnitude value', () => {
    let mapper = mapCoordinates([100, 100], false, true);

    let pointA = [0, 10];
    let pointB = [0, 20];

    let outputA = mapper([], pointA);
    let outputB = mapper([], pointB);

    expect(outputB[1]).to.be.lessThan(outputA[1]);
  });

});