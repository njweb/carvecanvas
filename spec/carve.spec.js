let expect = require('chai').expect;
let _ = require('lodash');
import {carve} from '../src/index.js';
import {canvasRenderingContext2DMock} from './canvasRenderingContext2D.mock.js';

let mockCanvasCtx2D = canvasRenderingContext2DMock();

describe('Carve', () => {

  it('should be a function', () => expect(carve).to.be.a('function'));

  it('should throw an error if the first argument is not an object', () => {
    expect(carve).to.throw(TypeError);
    expect(carve.bind(null, 5)).to.throw(TypeError);
    expect(carve.bind(null, 'abc')).to.throw(TypeError);
  });

  it('should throw a TypeError if the first argument "canvas" key does not have a "width" property',
    () => expect(carve.bind({canvas: {height: 10}})).to.throw(TypeError));

  it('should throw a TypeError if the first argument "canvas" key does not have a "height" property',
    () => expect(carve.bind(null, {canvas: {width: 10}})).to.throw(TypeError));

  it('should thow a TypeError if the first argument "canvas.width" path\'s value is not an integer',
    () => expect(carve.bind(null, {canvas: {width: 1.2, height: 10}})).to.throw(TypeError));

  it('should throw a TypeError if the first argument "canvas.height" path\'s value is not an integer',
    () => expect(carve.bind(null, {canvas: {width: 10, height: 10.5}})).to.throw(TypeError));

  it('should return an object',
    () => expect(carve.call(null, mockCanvasCtx2D)).to.be.an('object'));

  describe('Path Methods', () => {

    beforeEach(() => {
      mockCanvasCtx2D.reset();
    });

    describe('moveTo', () => {

      it('should return the original carve context object', () => {
        let ctx = carve(mockCanvasCtx2D);
        let out = ctx.moveTo([0, 0]);
        expect(out).to.equal(ctx);
      });

      it('should apply the point [0, 0] if no point argument is supplied', () => {
        let ctx = carve(mockCanvasCtx2D);
        ctx.moveTo([0, 0]).moveTo().commit();

        let storage = mockCanvasCtx2D.storage;
        expect(storage[0].point).to.deep.equal(storage[1].point);
      });

      it('should transform the passed in point with the current transformation', () => {
        let ctx = carve(mockCanvasCtx2D);
        let point = [-10, -10];
        ctx.moveTo(point)
          .pushTransform([10, 10])
          .moveTo(point)
          .commit();

        let storage = mockCanvasCtx2D.storage;
        expect(storage[1].point).to.not.deep.equal(storage[0].point);
      });

    });

    describe('lineTo', () => {

      it('lineTo should return the original carve context object', () => {
        let ctx = carve(mockCanvasCtx2D);
        let out = ctx.lineTo([0, 0]);
        expect(out).to.equal(ctx);
      });

      it('should apply the point [0, 0] if no point argument is supplied', () => {
        let ctx = carve(mockCanvasCtx2D);
        ctx.lineTo([0, 0]).lineTo().commit();

        let storage = mockCanvasCtx2D.storage;
        expect(storage[0].point).to.deep.equal(storage[1].point);
      });

      it('should transform the passed in point with the current transformation', () => {
        let ctx = carve(mockCanvasCtx2D);
        let point = [-10, 10];
        ctx.lineTo(point)
          .pushTransform([10, 10])
          .lineTo(point)
          .commit();

        let storage = mockCanvasCtx2D.storage;
        expect(storage[1].point).to.not.deep.equal(storage[0].point);
      });

    });

    describe('bezierTo', () => {

      it('should return the original carve context object', () => {
        let ctx = carve(mockCanvasCtx2D);
        let out = ctx.bezierTo([0, 0], [10, 10], [20, 0]);
        expect(out).to.equal(ctx);
      });

      it('should transform all passed in points with the current transformation', () => {
        let ctx = carve(mockCanvasCtx2D);
        let points = [[10, 10], [20, 10], [30, 0]];
        ctx.bezierTo.apply(ctx, points);
        ctx.pushTransform([10, 10]);
        ctx.bezierTo.apply(ctx, points);
        ctx.commit();

        _.forOwn(mockCanvasCtx2D.storage[0], (v, k) => {
          if(k !== 'type'){
            expect(mockCanvasCtx2D.storage[1][k]).to.not.deep.equal(v);
          }
        });
      });

    });

    describe('quadTo', () => {

      it('should return the original carve context object', () => {
        let ctx = carve(mockCanvasCtx2D);
        let out = ctx.quadTo([10, 10], [20, 0]);
        expect(out).to.equal(ctx);
      });

      it('should transform all passed in points with the current transformation', () => {
        let ctx = carve(mockCanvasCtx2D);
        let points = [[10, 10], [20, 10]];
        ctx.quadTo.apply(ctx, points)
          .pushTransform([10, 10])
          .quadTo.apply(ctx, points)
          .commit();

        _.forOwn(mockCanvasCtx2D.storage[0], (v, k) => {
          if(k !== 'type'){
            expect(mockCanvasCtx2D.storage[1][k]).to.not.deep.equal(v);
          }
        });

      });

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

    it('should be able to apply a sequence of instructions to the stored canvas context object', () => {
      let ctx = carve(mockCanvasCtx2D);
      ctx.moveTo([10, 10])
        .lineTo([20, 20])
        .bezierTo([-10, 20], [0, 40], [10, 50])
        .quadTo([10, 10], [20, 20])
        .lineTo([0, 0])
        .commit();
      expect(mockCanvasCtx2D.storage.length).to.equal(5);
      expect(mockCanvasCtx2D.storage[0].type).to.equal('moveTo');
      expect(mockCanvasCtx2D.storage[1].type).to.equal('lineTo');
      expect(mockCanvasCtx2D.storage[2].type).to.equal('bezierCurveTo');
      expect(mockCanvasCtx2D.storage[3].type).to.equal('quadraticCurveTo');
      expect(mockCanvasCtx2D.storage[4].type).to.equal('lineTo');
    });

    it('should call a passed predicate', () => {
      let wasCalled = false;
      let predicate = () => wasCalled = true;
      let ctx = carve(mockCanvasCtx2D);
      ctx.moveTo([10, 10]).lineTo([20, 20]).commit(predicate);
      expect(wasCalled).to.equal.true;
    });

    it('should provide the predicate with the original CanvasRenderingContext2D object as ' +
      'the first argument', () => {
      let predicate = (arg0) => expect(arg0).to.equal(mockCanvasCtx2D);
      let ctx = carve(mockCanvasCtx2D);
      ctx.moveTo([10, 10]).commit(predicate);
    });

    it('should provide the predicate with a function as the second argument', () => {
      let predicate = (arg0, arg1) => expect(arg1).to.be.a('function');
      let ctx = carve(mockCanvasCtx2D);
      ctx.moveTo([-10, -10]).commit(predicate);
    });

    it('should execute the CanvasRenderingContext2D instructions when the function at ' +
      'arguments[1] is called', () => {
      let predicate = (canvasCtx, exe) => {
        expect(mockCanvasCtx2D.storage).to.be.empty;
        exe();
        expect(mockCanvasCtx2D.storage).to.not.be.empty;
      };
      let ctx = carve(mockCanvasCtx2D);
      ctx.moveTo([10, 10]).commit(predicate);
    });

  });

  describe('Map To Canvas Coordinates', () => {

    beforeEach(() => {
      mockCanvasCtx2D.reset();
    });

    it('should transform input points to canvas coordinates during the commit process', () => {
      let ctx = carve(mockCanvasCtx2D);
      let expectedPoint = [mockCanvasCtx2D.canvas.width * 0.5, mockCanvasCtx2D.canvas.height * 0.5];
      ctx.moveTo([0, 0]).commit();
      expect(mockCanvasCtx2D.storage[0].point).to.deep.equal(expectedPoint);
    });

  });

  describe('Transform', () => {

    beforeEach(() => {
      mockCanvasCtx2D.reset();
    });

    it('should have a pushTransform function', () => {
      expect(carve(mockCanvasCtx2D).pushTransform).to.be.a('function');
    });

    it('should apply pushed transform information to points passed to the moveTo function', () => {
      let ctx = carve(mockCanvasCtx2D);
      ctx.moveTo([0, 0]).commit();
      let reference = mockCanvasCtx2D.storage[0].point;

      mockCanvasCtx2D.reset();
      ctx.pushTransform([10, 10]).moveTo([0, 0]).commit();
      expect(mockCanvasCtx2D.storage[0].point).to.not.deep.equal(reference);
    });

    it('should be able to apply multiple pushed transforms in sequence', () => {
      let ctx = carve(mockCanvasCtx2D);
      let zeroPoint = [0, 0];

      ctx.pushTransform([10, 10]).moveTo(zeroPoint).pushTransform([10, 10]).moveTo(zeroPoint).commit();

      let first = mockCanvasCtx2D.storage[0].point;
      let second = mockCanvasCtx2D.storage[1].point;
      expect(first).to.not.deep.equal(second);
    });

    it('should have a popTransform function', () => {
      expect(carve(mockCanvasCtx2D).popTransform).to.be.a('function');
    });

    it('should be able to use popTransform to remove an applied transform', () => {
      let ctx = carve(mockCanvasCtx2D);
      let zeroPoint = [0, 0];

      ctx.moveTo(zeroPoint).pushTransform([10, 10]).moveTo(zeroPoint).popTransform().moveTo(zeroPoint).commit();

      let storage = mockCanvasCtx2D.storage;
      expect(storage[0].point).to.not.deep.equal(storage[1].point);
      expect(storage[0].point).to.deep.equal(storage[2].point);
    });

    it('should be able to popTransform repeatedly to no effect if there are no more transforms to remove', () => {
      let ctx = carve(mockCanvasCtx2D);
      let zeroPoint = [0, 0];

      ctx.moveTo(zeroPoint).pushTransform([10, 10]).popTransform().popTransform().moveTo(zeroPoint).commit();

      let storage = mockCanvasCtx2D.storage;
      expect(storage[0].point).to.deep.equal(storage[1].point);
    });

  });

  describe('Sequence', () => {

    beforeEach(() => {
      mockCanvasCtx2D.reset();
    });

    it('should have a sequence function', () => {
      let ctx = carve(mockCanvasCtx2D);
      expect(ctx.sequence).to.be.a('function');
    });

    it('should call the passed predicate passed as the first argument', () => {
      let wasCalled = false;
      let predicate = () => wasCalled = true;
      let ctx = carve(mockCanvasCtx2D);

      ctx.sequence(predicate);

      expect(wasCalled).to.be.true;
    });

    it('should pass a carve context object from argument[1] to the predicate ' +
      'as the carve context argument', function () {
      let ctx = carve(mockCanvasCtx2D);
      let predicate = (carveCtx) => expect(carveCtx).to.equal(ctx);
      ctx.sequence(predicate, ctx);
    });

    it('should pass a non-"carve context" object from argument[1] to the predicate ' +
      'as the state argument', function () {
      let state = {a: 5};
      let predicate = (carveCtx, s) => expect(s).to.deep.equal(state);
      let ctx = carve(mockCanvasCtx2D);
      ctx.sequence(predicate, state);
    });

    it('should pass a carve context object from argument[2] to the predicate ' +
      'as the carve context argument', function () {
      let ctx = carve(mockCanvasCtx2D);
      let predicate = (carveCtx) => {
        expect(carveCtx).to.equal(ctx);
      };
      ctx.sequence(predicate, null, ctx);
    });

    it('should restore the carve contex\'s transform to when render was called, ' +
      'after the render predicate is complete', () => {
      let ctx = carve(mockCanvasCtx2D);
      ctx.pushTransform([10, 10]).moveTo([0, 0]).sequence((ctx) => ctx.pushTransform([20, 20]), ctx)
        .moveTo([0, 0]).commit();
      expect(mockCanvasCtx2D.storage.length).to.equal(2);
      expect(mockCanvasCtx2D.storage[1].point).to.deep.equal(mockCanvasCtx2D.storage[0].point);
    });

    it('should prohibit the carve context from popping transforms off the stack to the index ' +
      'when render was called', () => {
      let ctx = carve(mockCanvasCtx2D);
      ctx.pushTransform([10, 10]).moveTo([0, 0]);
      ctx.sequence((ctx) => ctx.popTransform().moveTo([0, 0]), ctx);

      ctx.commit();
      expect(mockCanvasCtx2D.storage.length).to.equal(2);
      expect(mockCanvasCtx2D.storage[1].point).to.deep.equal(mockCanvasCtx2D.storage[0].point);
    });

  });

  describe('Branch', () => {

    beforeEach(() => {
      mockCanvasCtx2D.reset();
    });

    it('should be a function', () => {
      expect(carve(mockCanvasCtx2D).branch).to.be.a('function');
    });

    it('should return an object', () => {
      expect(carve(mockCanvasCtx2D).branch()).to.be.an('object');
    });

    it('should have an empty instruction stack', () => {
      let ctx = carve(mockCanvasCtx2D).moveTo([10, 10]).lineTo([10, 10]);
      let child = ctx.branch();
      child.commit();

      expect(mockCanvasCtx2D.storage).to.be.empty;
    });

    it('should be able to commit instruction to the same canvas context 2D object that was used ' +
      'to create the parent', () => {
      let child = carve(mockCanvasCtx2D).branch();
      child.moveTo([10, 10]).commit();

      expect(mockCanvasCtx2D.storage).to.not.be.empty;
      expect(mockCanvasCtx2D.storage[0].type).to.equal('moveTo');
    });

    it('should carry the last trasform of the parent as its root transform', () => {
      let ctx = carve(mockCanvasCtx2D);
      ctx.pushTransform([10, 10]).moveTo([0, 0]).commit();
      let child = ctx.branch().moveTo([0, 0]).commit();

      expect(mockCanvasCtx2D.storage[1].point).to.deep.equal(mockCanvasCtx2D.storage[0].point);
    });

    it('should not allow its root transform to be popped off', () => {
      let ctx = carve(mockCanvasCtx2D);
      let child = ctx.pushTransform([10, 10]).branch();
      child.moveTo([0, 0]).popTransform().moveTo([0, 0]).commit();

      expect(mockCanvasCtx2D.storage[1].point).to.deep.equal(mockCanvasCtx2D.storage[0].point);
    });

  });

});