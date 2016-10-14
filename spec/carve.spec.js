let expect = require('chai').expect;
let _ = require('lodash');
import {carve} from '../src/index.js'

describe('Carve', () => {

  it('should be a function', () => expect(carve).to.be.a('function'));

  it('should throw an error if args[0] is not an object', () => {
    expect(carve).to.throw(TypeError);
    expect(carve.bind(null, 5)).to.throw(TypeError);
    expect(carve.bind(null, 'abc')).to.throw(TypeError);
  });

  it('should throw a type error if args[0] does not have the paths .canvas.width & .canvas.height', () => {
    expect(carve.bind(null, {canvas: 5})).to.throw(TypeError);
    expect(carve.bind(null, {canvas: {width: 12}})).to.throw(TypeError);
    expect(carve.bind(null, {canvas: {height: 10}})).to.throw(TypeError);
  });

  it('should throw a TypeError if arg[0] does not have a "canvas" property',
    () => expect(carve.bind(null, {})).to.throw(TypeError));

  it('should throw a TypeError if arg[0].canvas does not have a "width" property',
    () => expect(carve.bind({canvas: {height: 10}})).to.throw(TypeError));

  it('should throw a TypeError if arg[0].canvas does not have a "height" property',
    () => expect(carve.bind(null, {canvas: {width: 10}})).to.throw(TypeError));

  it('should thow a TypeError if arg[0].canvas.width is not an integer',
    ()=>expect(carve.bind(null, {canvas: {width: 1.2, height: 10}})).to.throw(TypeError));

  it('should throw a TypeError if arg[0].canvas.height is not an integer',
    ()=>expect(carve.bind(null, {canvas: {width: 10, height: 10.5}})).to.throw(TypeError));

  it('should return an object',
    ()=> expect(carve.call(null, {canvas: {width: 10, height: 10}})).to.be.an('object'));
});