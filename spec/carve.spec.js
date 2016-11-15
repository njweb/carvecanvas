let expect = require('chai').expect;
let _ = require('lodash');
import carve from '../src/index';
import {apply as applyTransform} from '../src/transform';
import {instructionCodes} from '../src/codes'
import {canvasRenderingContext2DMock} from './canvasRenderingContext2D.mock.js';

let mockCanvasCtx2D = canvasRenderingContext2DMock();
let addPoints = (a, b) => [a[0] + b[0], a[1] + b[1]];

describe('Carve', () => {

  it('should be a function', () => {
    expect(carve).to.be.a('function');
  });
  it('should return an object with a sequence method', () => {
    let myCarve = carve(mockCanvasCtx2D);
    expect(myCarve).to.respondTo('sequence');
  });
  it('should return an object with a commit method', () => {
    let myCarve = carve(mockCanvasCtx2D);
    expect(myCarve).to.respondTo('sequence');
  });

  describe('Sequence', () => {

    let myCarveObj;
    beforeEach(() => {
      myCarveObj = carve(mockCanvasCtx2D);
    });

    it('should call a passed sequencer function', () => {
      let wasCalled = false;
      let predicate = () => {wasCalled = true;};
      myCarveObj.sequence(predicate);
      expect(wasCalled).to.be.true;
    });

    describe('Get Transform', () => {
      it('should return the current transform', () => {
        let transformA = [40, 60];
        let transformB = [-4, 2];
        myCarveObj.sequence((ctx) => {
          ctx.pushTransform(transformA)
            .pushTransform(transformB);
          expect(ctx.getTransform([])).to.deep.equal(addPoints(transformA, transformB));
        });
      });
    });

    describe('Push Transform', () => {
      it('should return the sequence context', () => {
        myCarveObj.sequence((ctx) => {expect(ctx.pushTransform([0, 0])).to.equal(ctx);});
      });
      it('should set the current transform', () => {
        let transform = [10, 20];
        myCarveObj.sequence((ctx) => {
          ctx.pushTransform(transform);
          expect(ctx.getTransform([])).to.deep.equal(transform);
        });
      });
    });

    describe('Push Global Transform', () => {
      it('should return the sequence context', () => {
        myCarveObj.sequence((ctx) => {
          expect(ctx.pushGlobalTransform([5, 10])).to.equal(ctx);
        });
      });
      it('should overwrite the current transform value', () => {
        let globalTransform = [-20, 80];
        myCarveObj.sequence((ctx) => {
          ctx.pushTransform([2, 10])
            .pushTransform([-30, -20])
            .pushGlobalTransform(globalTransform);
          expect(ctx.getTransform([])).to.deep.equal(globalTransform);
        });
      });
    });

    describe('Pop Transform', () => {
      it('should return the sequence context', () => {
        myCarveObj.sequence((ctx) => { expect(ctx.popTransform()).to.equal(ctx); });
      });
      it('should return the sequence context object', () => {
        myCarveObj.sequence((ctx) => {
          expect(ctx.popTransform()).to.equal(ctx);
        });
      });
      it('should remove the last pushed transform', () => {
        myCarveObj.sequence((ctx) => {
          let transform = [9, -10];
          ctx.pushTransform(transform)
            .pushTransform([5, 5])
            .popTransform();
          expect(ctx.getTransform([])).to.deep.equal(transform);
        });
      });
    });

    describe('Get Instructions', () => {
      it('should return an array', () => {
        myCarveObj.sequence((ctx) => {
          expect(ctx.getInstructions()).to.be.an('array');
        });
      });
      it('should return the instruction array from the configuration (if provided)', () => {
        let myArray = [];
        carve(mockCanvasCtx2D, {instructions: myArray}).sequence((ctx) => {
          expect(ctx.getInstructions()).to.equal(myArray);
        });
      });
    });

    describe('Move To', () => {
      it('should return the sequence context', () => {
        myCarveObj.sequence((ctx) => {
          expect(ctx.moveTo([0, 0])).to.equal(ctx);
        });
      });
      it('should push the moveTo code to the returned instruction array', () => {
        myCarveObj.sequence((ctx) => {
          let result = ctx.moveTo([0, 0]).getInstructions();
          expect(result[0]).to.equal(instructionCodes.moveTo);
        });
      });
      it('should push the point value to the returned instruction array', () => {
        let point = [10, 20];
        myCarveObj.sequence((ctx) => {
          let result = ctx.moveTo(point).getInstructions();
          expect(result.slice(1, 3)).to.deep.equal(point);
        });
      });
      it('should offset the point with the current transform', () => {
        let point = [5, -5];
        let transform = [20, 25];
        myCarveObj.sequence((ctx) => {
          let result = ctx.pushTransform(transform).moveTo(point).getInstructions();
          expect(result.slice(1, 3)).to.deep.equal(applyTransform([], transform, point));
        });
      });
    });

    describe('Line To', () => {
      it('should return the sequence context', () => {
        myCarveObj.sequence((ctx) => {expect(ctx.lineTo([0, 0])).to.equal(ctx);});
      });
      it('should push the lineTo code to the returned instruction array', () => {
        myCarveObj.sequence((ctx) => {
          let result = ctx.lineTo([0, 0]).getInstructions();
          expect(result[0]).to.equal(instructionCodes.lineTo);
        });
      });
      it('should push the point value to the returned instruction array', () => {
        let point = [10, 20];
        myCarveObj.sequence((ctx) => {
          let result = ctx.lineTo(point).getInstructions();
          expect(result.slice(1, 3)).to.deep.equal(point);
        });
      });
      it('should offset the point with the current transform', () => {
        let point = [5, -5];
        let transform = [20, 25];
        myCarveObj.sequence((ctx) => {
          let result = ctx.pushTransform(transform).lineTo(point).getInstructions();
          expect(result.slice(1, 3)).to.deep.equal(applyTransform([], transform, point));
        });
      });
    });

    describe('Quad To', () => {
      it('should return the sequence context', () => {
        myCarveObj.sequence((ctx) => {expect(ctx.quadTo([0, 0], [0, 0])).to.equal(ctx);});
      });
      it('should push the quadTo code to the returned instruction array', () => {
        myCarveObj.sequence((ctx) => {
          let result = ctx.quadTo([0, 0], [0, 0]).getInstructions();
          expect(result[0]).to.equal(instructionCodes.quadTo);
        });
      });
      it('should push the control & point value to the returned instruction array', () => {
        let control = [5, 10];
        let point = [20, -10];
        myCarveObj.sequence((ctx) => {
          let result = ctx.quadTo(control, point).getInstructions();
          expect(result.slice(1, 1 + 2 + 2)).to.deep.equal([].concat(control, point));
        });
      });
      it('should offset the control & point with the current transform', () => {
        let control = [30, 32];
        let point = [12, -4];
        let transform = [-8, 10];
        myCarveObj.sequence((ctx) => {
          let result = ctx.pushTransform(transform).quadTo(control, point).getInstructions();
          expect(result.slice(1, 1 + 2 + 2)).to.deep
            .equal([].concat(applyTransform([], transform, control),
              applyTransform([], transform, point)));
        });
      });
    });

    describe('Bezier To', () => {
      it('should return the sequence context', () => {
        myCarveObj.sequence((ctx) => {expect(ctx.bezierTo([0, 0], [0, 0], [0, 0])).to.equal(ctx);});
      });
      it('should push the bezierTo code to the returned instruction array', () => {
        myCarveObj.sequence((ctx) => {
          let result = ctx.bezierTo([0, 0], [0, 0], [0, 0]).getInstructions();
          expect(result[0]).to.equal(instructionCodes.bezierTo);
        });
      });
      it('should push the control & point value to the returned instruction array', () => {
        let controlA = [5, 9];
        let controlB = [12, 30];
        let point = [14, 0];
        myCarveObj.sequence((ctx) => {
          let result = ctx.bezierTo(controlA, controlB, point).getInstructions();
          expect(result.slice(1, 1 + 2 + 2 + 2)).to.deep
            .equal([].concat(controlA, controlB, point));
        });
      });
      it('should offset the control & point with the current transform', () => {
        let controlA = [5, 9];
        let controlB = [12, 30];
        let point = [14, 0];
        let transform = [-10, -5];
        myCarveObj.sequence((ctx) => {
          let result = ctx.pushTransform(transform).bezierTo(controlA, controlB, point).getInstructions();
          expect(result.slice(1, 1 + 2 + 2 + 2)).to.deep
            .equal([].concat(
              applyTransform([], transform, controlA),
              applyTransform([], transform, controlB),
              applyTransform([], transform, point)));
        });
      });
    });

    describe('Sequence', () => {
      it('should return the sequence context', () => {
        myCarveObj.sequence((ctx) => {
          expect(ctx.sequence(() => {})).to.equal(ctx);
        });
      });
      it('should execute the passed predicate', () => {
        let wasExecuted = false;
        let check = () => {wasExecuted = true;};
        myCarveObj.sequence((ctx) => {ctx.sequence(check);});
        expect(wasExecuted).to.be.true;
      });
      it('should pass the sequence context to the predicate', () => {
        let storedCtx;
        myCarveObj.sequence((ctx) => {
          storedCtx = ctx;
          ctx.sequence((ctx) => {expect(ctx).to.equal(storedCtx); });
        });
      });
      it('should pass the state argument provided to the original sequence call to the predicate', () => {
        let original = {a: 5};
        myCarveObj.sequence((ctx, state)=> {
          ctx.sequence((ctx, state) => {expect(state).to.equal(original); }, state);
        }, original);
      });
      it('should prevent the popping of transforms past where the transform stack ' +
        'was when sequence was called', () => {
        let transform = [10, 20];
        let point = [5, -5];
        myCarveObj.sequence((ctx) => {
          let result = ctx.pushTransform(transform)
            .sequence((ctx) => {ctx.popTransform();})
            .moveTo(point)
            .getInstructions();
          expect(result.slice(1, 3)).to.deep.equal(addPoints(transform, point));
        });
      });
    });

    describe('Branch', () => {
      it('should provide a new sequence context to the predicate', () => {
        myCarveObj.sequence((ctx) => {
          ctx.branch((innerCtx) => {
            expect(innerCtx).to.not.equal(ctx);
          });
        });
      });
      carve(mockCanvasCtx2D).sequence((ctx) => {
        _.forIn(ctx, (v, k) => {
          if (typeof v === 'function') {
            it('should have the function ' + k + ' on the new sequence context', () => {
              myCarveObj.sequence((ctx) => {
                ctx.branch((ctx) => {
                  expect(ctx[k]).to.be.a('function');
                });
              });
            });
          }
        });
      });
      it('should have an instruction array', () => {
        myCarveObj.sequence((ctx) => {
          ctx.branch((ctx) => {
            expect(ctx.instructions).to.be.an('array');
          });
        });
      });
      it('should have an empty instruction array', () => {
        myCarveObj.sequence((ctx) => {
          ctx.branch((ctx) => {
            expect(ctx.instructions).to.be.empty;
          })
        });
      });
      it('should have an instruction index with a value of 0', () => {
        myCarveObj.sequence((ctx) => {
          // expect(ctx.branch().iIndex).to.equal(0);
          ctx.branch((ctx) => {
            expect(ctx.iIndex).to.equal(0);
          });
        });
      });
      it('should have an transform array with the parent sequence context\'s current ' +
        'transform values', () => {
        myCarveObj.sequence((ctx) => {
          ctx.pushTransform([5, 10]);
          ctx.pushTransform([-2, -2]);
          let offset = ctx.getTransform([]);
          ctx.branch((ctx) => {
            expect(ctx.transforms).to.deep.equal(offset);
          });
        });
      });
      it('should have a transform lower bound of 2', () => {
        myCarveObj.sequence((ctx) => {
          ctx.branch((ctx) => {
            expect(ctx.tLowerBound).to.equal(2);
          });
        });
      });

    });

    describe('Commit', () => {
      beforeEach(() => { mockCanvasCtx2D.reset(); });

      it('should throw a type error if no instructor was supplied in the configuration', () => {
        myCarveObj.sequence((ctx) => {
          expect(ctx.commit).to.throw(TypeError);
        });
      });

      it('should commit the instructions to the provided instructor', () => {
        let point = [20, 10];
        myCarveObj.sequence((ctx) => {
          ctx.moveTo(point)
            .commit();
        });

        expect(mockCanvasCtx2D.storage[0].type).to.equal('moveTo');
        expect(mockCanvasCtx2D.storage[0].point).to.deep.equal(point);
      });
      it('should call a provided predicate function', () => {
        let wasCalled = false;
        let predicate = () => {wasCalled = true;};
        myCarveObj.sequence((ctx) => {
          ctx.commit(predicate);
        });
        expect(wasCalled).to.be.true;
      });
      it('should provide the canvas context object to a predicate function', () => {
        let predicate = () => {wasCalled = true;};
        myCarveObj.sequence((ctx) => {
          ctx.commit((canvasCtx) => {
            expect(canvasCtx).to.equal(mockCanvasCtx2D);
          });
        });
      });
      it('should reset the instruction index to 0', () => {
        myCarveObj.sequence((ctx) => {
          ctx.moveTo([2, 3]).commit();
          expect(ctx.iIndex).to.equal(0);
        });
      });
      it('should be able to reuse an instruction array', () => {
        myCarveObj.sequence((ctx) => {
          ctx.moveTo([10, 20])
            .lineTo([4, 5])
            .lineTo([-2, -3])
            .commit();
        });
        mockCanvasCtx2D.reset();
        let point = [-40, 50];
        myCarveObj.sequence((ctx) => {
          ctx.moveTo(point).commit();
        });
        expect(mockCanvasCtx2D.storage.length).to.equal(1);
        expect(mockCanvasCtx2D.storage[0].point).to.deep.equal(point);
      });

    });

  });

  describe('Commit', () => {

    let myCommit;
    beforeEach(() => {
      mockCanvasCtx2D.reset();
      myCommit = carve(mockCanvasCtx2D).commit;
    });

    it('should return an object', () => {
      expect(myCommit).to.be.a('function');
    });
    it('should submit values after a move to code to the canvas context object\'s moveTo method', () => {
      let point = [5, 10];
      myCommit([instructionCodes.moveTo].concat(point));
      expect(mockCanvasCtx2D.storage[0].type).to.equal('moveTo');
      expect(mockCanvasCtx2D.storage[0].point).to.deep.equal(point);
    });
    it('should submit values after a lineTo code to the canvas context object\'s lineTo method', () => {
      let point = [10, -5];
      myCommit([instructionCodes.lineTo].concat(point));
      expect(mockCanvasCtx2D.storage[0].type).to.equal('lineTo');
      expect(mockCanvasCtx2D.storage[0].point).to.deep.equal(point);
    });
    it('should submit the values after a quadTo code to the canvas contex object\'s' +
      'quadraticCurveTo method', () => {
      let control = [9, 10];
      let point = [30, 20];
      myCommit([instructionCodes.quadTo].concat(control, point));
      expect(mockCanvasCtx2D.storage[0].type).to.equal('quadraticCurveTo');
      expect(mockCanvasCtx2D.storage[0].control).to.deep.equal(control);
      expect(mockCanvasCtx2D.storage[0].point).to.deep.equal(point);
    });
    it('should submit the values after a bezierTo code to the canvas context object\'s' +
      'bezierCurveTo method', () => {
      let controlA = [10, 30];
      let controlB = [16, 20];
      let point = [4, 30];
      myCommit([instructionCodes.bezierTo].concat(controlA, controlB, point));
      expect(mockCanvasCtx2D.storage[0].type).to.equal('bezierCurveTo');
      expect(mockCanvasCtx2D.storage[0].controlA).to.deep.equal(controlA);
      expect(mockCanvasCtx2D.storage[0].controlB).to.deep.equal(controlB);
      expect(mockCanvasCtx2D.storage[0].point).to.deep.equal(point);
    });
    it('should stop submitting instructions after finding instruction code: -1', () => {
      let myInstructions = [instructionCodes.moveTo].concat([4, 5], instructionCodes.lineTo, [10, 12], -1,
        instructionCodes.lineTo, [20, 30]);
      myCommit(myInstructions);
      expect(mockCanvasCtx2D.storage[0].type).to.equal('moveTo');
      expect(mockCanvasCtx2D.storage[1].type).to.equal('lineTo');
      expect(mockCanvasCtx2D.storage[2]).to.be.undefined;
    });

  });
});

describe('Behavior', () => {
  let myCarve;
  beforeEach(() => {
    myCarve = carve(mockCanvasCtx2D);
    mockCanvasCtx2D.reset();
  });

  it('should correctly arrange multiple sequence instructions', () => {
    let pointA = [10, 10];
    let pointB = [30, 1.46];

    let controlA = [-10, -30.5];
    let controlB = [-5, -40];
    let pointC = [-30, -100];

    let controlC = [80, -30.5];
    let pointD = [-40, 80];

    let myInstructions = myCarve.sequence((ctx => {
      ctx.moveTo(pointA)
        .lineTo(pointB)
        .bezierTo(controlA, controlB, pointC)
        .quadTo(controlC, pointD);
    }));

    myCarve.commit(myInstructions);

    expect(mockCanvasCtx2D.storage[0].type).to.equal('moveTo');
    expect(mockCanvasCtx2D.storage[0].point).to.deep.equal(pointA);

    expect(mockCanvasCtx2D.storage[1].type).to.equal('lineTo');
    expect(mockCanvasCtx2D.storage[1].point).to.deep.equal(pointB);

    expect(mockCanvasCtx2D.storage[2].type).to.equal('bezierCurveTo');
    expect(mockCanvasCtx2D.storage[2].controlA).to.deep.equal(controlA);
    expect(mockCanvasCtx2D.storage[2].controlB).to.deep.equal(controlB);
    expect(mockCanvasCtx2D.storage[2].point).to.deep.equal(pointC);

    expect(mockCanvasCtx2D.storage[3].type).to.equal('quadraticCurveTo');
    expect(mockCanvasCtx2D.storage[3].control).to.deep.equal(controlC);
    expect(mockCanvasCtx2D.storage[3].point).to.deep.equal(pointD);
  });
  it('should correctly apply transform values across multiple instructions', () => {
    let pointA = [10, 10];
    let pointB = [30, 1.46];

    let controlA = [-10, -30.5];
    let controlB = [-5, -40];
    let pointC = [-30, -100];

    let controlC = [80, -30.5];
    let pointD = [-40, 80];

    let transformA = [1.5, -2.3];
    let transformB = [10, 15];
    let transformC = [-100, -30.2];

    let myInstructions = myCarve.sequence((ctx) => {
      ctx
        .pushTransform(transformA)
        .moveTo(pointA)
        .pushTransform(transformB)
        .lineTo(pointB)
        .sequence((ctx) => {
          ctx.pushTransform(transformC)
            .bezierTo(controlA, controlB, pointC);
        })
        .popTransform()
        .sequence((ctx) => {
          ctx.popTransform()
            .quadTo(controlC, pointD);
        })
        .popTransform()
        .popTransform()
        .lineTo(pointA);
    });
    myCarve.commit(myInstructions);

    let storage = mockCanvasCtx2D.storage;
    expect(storage[0].type).to.equal('moveTo');
    expect(storage[0].point).to.deep.equal(addPoints(transformA, pointA));

    expect(storage[1].type).to.equal('lineTo');
    expect(storage[1].point).to
      .deep.equal(addPoints(addPoints(transformA, transformB), pointB));

    expect(storage[2].type).to.equal('bezierCurveTo');
    expect(storage[2].controlA).to
      .deep.equal(addPoints(addPoints(addPoints(transformA, transformB), transformC), controlA));
    expect(storage[2].controlB).to
      .deep.equal(addPoints(addPoints(addPoints(transformA, transformB), transformC), controlB));
    expect(storage[2].point).to
      .deep.equal(addPoints(addPoints(addPoints(transformA, transformB), transformC), pointC));

    expect(storage[3].type).to.equal('quadraticCurveTo');
    expect(storage[3].control).to
      .deep.equal(addPoints(transformA, controlC));
    expect(storage[3].point).to
      .deep.equal(addPoints(transformA, pointD));

    expect(storage[4].type).to.equal('lineTo');
    expect(storage[4].point).to.deep.equal(pointA);
  });
});