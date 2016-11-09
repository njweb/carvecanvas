let expect = require('chai').expect;
let _ = require('lodash');

import {push, pop, merge, apply} from '../src/transform';

describe('Push', () => {
  it('should return a number larger by two than the index passed in', () => {
    let index = 5;
    expect(push([], index, [10, 15])).to.equal(index + 2);
  });
  it('should put the offset value [0] in the transform array at [index]', () => {
    let arr = [];
    let index = 15;
    let offset = [22, 8];
    push(arr, index, offset);
    expect(arr[index]).to.equal(offset[0]);
  });
  it('should put the offset value [1] in the transform array at [index + 1]', () => {
    let arr = [];
    let index = 20;
    let offset = [22, 16];
    push(arr, index, offset);
    expect(arr[index + 1]).to.equal(offset[1]);
  });
});

describe('Pop', () => {
  it('should return a number two less than the value passed in', () => {
    let index = 10;
    expect(pop(index, 0)).to.equal(index - 2);
  });
  it('should not return a value less than 0', () => {
    let index = -1;
    expect(pop(index, -2)).to.equal(0);
  });
  it('should not return a value less than the lower bound value', () => {
    let index = 8;
    let lowerBound = 7;
    expect(pop(index, lowerBound)).to.equal(lowerBound);
  });
});

describe('Merge', () => {
  it('should return an array', () => {
    let tA = [10, 20];
    let tB = [-5, 5];
    expect(merge([], tA, tB)).to.be.an('array');
  });
  it('should return an array with a length of 2', () => {
    let tA = [10, 20];
    let tB = [-5, 5];
    expect(merge([], tA, tB).length).to.equal(2);
  });
  it('should return an array where index 0 equals the sum of both provided transform\'s index 0', () => {
    let tA = [10, 20];
    let tB = [-5, 5];
    let result = merge([], tA, tB);
    expect(result[0]).to.equal(tA[0] + tB[0]);
  });
  it('should return an array where index 1 equals the sum of both provided transform\'s index 1', () => {
    let tA = [10, 20];
    let tB = [-5, 5];
    let result = merge([], tA, tB);
    expect(result[1]).to.equal(tA[1] + tB[1]);
  });
});

describe('Apply', () => {
  it('should return an array', () => {
    let tA = [10, 20];
    let tB = [-5, 5];
    expect(apply([], tA, tB)).to.be.an('array');
  });
  it('should return an array with a length of 2', () => {
    let tA = [10, 20];
    let tB = [-5, 5];
    expect(apply([], tA, tB).length).to.equal(2);
  });
  it('should return an array where index 0 equals the sum of both provided transform\'s index 0', () => {
    let tA = [10, 20];
    let tB = [-5, 5];
    let result = apply([], tA, tB);
    expect(result[0]).to.equal(tA[0] + tB[0]);
  });
  it('should return an array where index 1 equals the sum of both provided transform\'s index 1', () => {
    let tA = [10, 20];
    let tB = [-5, 5];
    let result = apply([], tA, tB);
    expect(result[1]).to.equal(tA[1] + tB[1]);
  });
});