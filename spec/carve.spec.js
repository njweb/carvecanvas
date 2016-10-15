let expect = require('chai').expect;
import {carve} from '../src/index.js';
import {canvasRenderingContext2DMock} from './canvasRenderingContext2D.mock.js';

let mockCanvasCtx2D = canvasRenderingContext2DMock();

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
    () => expect(carve.bind(null, {canvas: {width: 1.2, height: 10}})).to.throw(TypeError));

  it('should throw a TypeError if arg[0].canvas.height is not an integer',
    () => expect(carve.bind(null, {canvas: {width: 10, height: 10.5}})).to.throw(TypeError));

  it('should return an object',
    () => expect(carve.call(null, mockCanvasCtx2D)).to.be.an('object'));

  describe('Path Methods', () => {

    it('moveTo should return the original carve context object', () => {
      let ctx = carve(mockCanvasCtx2D);
      let out = ctx.moveTo([0, 0]);
      expect(out).to.equal(ctx);
    });

    it('lineTo should return the original carve context object', () => {
      let ctx = carve(mockCanvasCtx2D);
      let out = ctx.lineTo([0, 0]);
      expect(out).to.equal(ctx);
    });

    it('bezierTo should return the original carve context object', () => {
      let ctx = carve(mockCanvasCtx2D);
      let out = ctx.bezierTo([0, 0], [10, 10], [20, 0]);
      expect(out).to.equal(ctx);
    });

    it('quadTo should return the original carve context object', () => {
      let ctx = carve(mockCanvasCtx2D);
      let out = ctx.quadTo([10, 10], [20, 0]);
      expect(out).to.equal(ctx);
    });

  });

  describe('Commit', () => {

    beforeEach(() => {
      mockCanvasCtx2D.reset();
    });

    it('should return the orignal carve context object', () => {
      let ctx = carve(mockCanvasCtx2D);
      let out = ctx.commit();
      expect(out).to.equal(ctx);
    });

    it('should apply a stored moveTo instruction to the stored canvas context object', () => {
      let ctx = carve(mockCanvasCtx2D);
      ctx.moveTo([10, 10]).commit();
      expect(mockCanvasCtx2D.storage).not.to.be.empty;
      expect(mockCanvasCtx2D.storage[0].type).to.equal('moveTo');
    });

    it('should apply a stored lineTo instruction to the stored canvas context object', () => {
      let ctx = carve(mockCanvasCtx2D);
      ctx.lineTo([10, 10]).commit();
      expect(mockCanvasCtx2D.storage).not.to.be.empty;
      expect(mockCanvasCtx2D.storage[0].type).to.equal('lineTo');
    });

    it('should apply a stored bezierTo instruction to the stored canvas context object', () => {
      let ctx = carve(mockCanvasCtx2D);
      ctx.bezierTo([0, 4], [4, 8], [10, 10]).commit();
      expect(mockCanvasCtx2D.storage).not.to.be.empty;
      expect(mockCanvasCtx2D.storage[0].type).to.equal('bezierCurveTo');
    });

    it('should apply a stored quadTo instruction to the stored canvas context object', () => {
      let ctx = carve(mockCanvasCtx2D);
      ctx.quadTo([4, 4], [10, 10]).commit();
      expect(mockCanvasCtx2D.storage).not.to.be.empty;
      expect(mockCanvasCtx2D.storage[0].type).to.equal('quadraticCurveTo');
    });

    it('should be able to apply a sequence of instructions to the stored canvas context object', () =>{
      let ctx = carve(mockCanvasCtx2D);
      ctx.moveTo([10, 10])
        .lineTo([20, 20])
        .bezierTo([-10, 20], [0, 40], [10, 50])
        .quadTo([10, 10], [20, 20])
        .lineTo([0, 0])
        .commit();
      expect(mockCanvasCtx2D.storage).not.to.be.empty;
      expect(mockCanvasCtx2D.storage[0].type).to.equal('moveTo');
      expect(mockCanvasCtx2D.storage[1].type).to.equal('lineTo');
      expect(mockCanvasCtx2D.storage[2].type).to.equal('bezierCurveTo');
      expect(mockCanvasCtx2D.storage[3].type).to.equal('quadraticCurveTo');
      expect(mockCanvasCtx2D.storage[4].type).to.equal('lineTo');
    });

  });

});