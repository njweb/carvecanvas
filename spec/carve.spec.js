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
    expect(carve).to.be.an('function');
  });

  describe('Instructor', () => {
    let myInstructor;
    beforeEach(() => {
      myInstructor = carve(mockCanvasCtx2D, (out, p) => {
        out[0] = p[0];
        out[1] = p[1];
        return out;
      });
      mockCanvasCtx2D.reset();
    });

    it('should return an object', () => {
      expect(myInstructor).to.be.a('function');
    });
    describe('The Commit Function', () => {
      it('should submit values after a move to code to the canvas context object\'s moveTo method', () => {
        let point = [5, 10];
        myInstructor([instructionCodes.moveTo].concat(point));
        expect(mockCanvasCtx2D.storage[0].type).to.equal('moveTo');
        expect(mockCanvasCtx2D.storage[0].point).to.deep.equal(point);
      });
      it('should submit values after a lineTo code to the canvas context object\'s lineTo method', () => {
        let point = [10, -5];
        myInstructor([instructionCodes.lineTo].concat(point));
        expect(mockCanvasCtx2D.storage[0].type).to.equal('lineTo');
        expect(mockCanvasCtx2D.storage[0].point).to.deep.equal(point);
      });
      it('should submit the values after a quadTo code to the canvas contex object\'s' +
        'quadraticCurveTo method', () => {
        let control = [9, 10];
        let point = [30, 20];
        myInstructor([instructionCodes.quadTo].concat(control, point));
        expect(mockCanvasCtx2D.storage[0].type).to.equal('quadraticCurveTo');
        expect(mockCanvasCtx2D.storage[0].control).to.deep.equal(control);
        expect(mockCanvasCtx2D.storage[0].point).to.deep.equal(point);
      });
      it('should submit the values after a bezierTo code to the canvas context object\'s' +
        'bezierCurveTo method', () => {
        let controlA = [10, 30];
        let controlB = [16, 20];
        let point = [4, 30];
        myInstructor([instructionCodes.bezierTo].concat(controlA, controlB, point));
        expect(mockCanvasCtx2D.storage[0].type).to.equal('bezierCurveTo');
        expect(mockCanvasCtx2D.storage[0].controlA).to.deep.equal(controlA);
        expect(mockCanvasCtx2D.storage[0].controlB).to.deep.equal(controlB);
        expect(mockCanvasCtx2D.storage[0].point).to.deep.equal(point);
      });
      it('should stop submitting instructions after finding instruction code: -1', () => {
        let myInstructions = [instructionCodes.moveTo].concat([4, 5], instructionCodes.lineTo, [10, 12], -1,
          instructionCodes.lineTo, [20, 30]);
        myInstructor(myInstructions);
        expect(mockCanvasCtx2D.storage[0].type).to.equal('moveTo');
        expect(mockCanvasCtx2D.storage[1].type).to.equal('lineTo');
        expect(mockCanvasCtx2D.storage[2]).to.be.undefined;
      });

      describe('with Predicate', () => {
        it('should call a passed predicate function', () => {
          let wasCalled = false;
          let predicate = () => {wasCalled = true;};
          myInstructor([], predicate);
          expect(wasCalled).to.be.true;
        });
        it('should pass the canvas context object as the first parameter', () => {
          myInstructor([], (canvasCtx) => {
            expect(canvasCtx).to.equal(mockCanvasCtx2D);
          });
        });
        it('should not commit the instructions before the execute function is called', () => {
          myInstructor([0, 10, 10], (canvasContex, operation) => {
            expect(mockCanvasCtx2D.storage).to.be.empty;
          });
        });
        it('should commit the instructions after the execute function is called', () => {
          myInstructor([0, 10, 10], (canvasContex, operation) => {
            operation();
            expect(mockCanvasCtx2D.storage.length).to.equal(1);
          });
        });
      });

    });

  });

  describe('Sequence', () => {

    it('should call a passed sequencer function', () => {
      let wasCalled = false;
      let predicate = () => {wasCalled = true;};
      carve.sequence(predicate);
      expect(wasCalled).to.be.true;
    });

    describe('Get Transform', () => {
      it('should return the current transform', () => {
        let transformA = [40, 60];
        let transformB = [-4, 2];
        carve.sequence((ctx) => {
          ctx.pushTransform(transformA)
            .pushTransform(transformB);
          expect(ctx.getTransform([])).to.deep.equal(addPoints(transformA, transformB));
        });
      });
    });

    describe('Push Transform', () => {
      it('should return the sequence context', () => {
        carve.sequence((ctx) => {expect(ctx.pushTransform([0, 0])).to.equal(ctx);});
      });
      it('should set the current transform', () => {
        let transform = [10, 20];
        carve.sequence((ctx) => {
          ctx.pushTransform(transform);
          expect(ctx.getTransform([])).to.deep.equal(transform);
        });
      });
    });

    describe('Push Global Transform', () => {
      it('should return the sequence context', () => {
        carve.sequence((ctx) => {
          expect(ctx.pushGlobalTransform([5, 10])).to.equal(ctx);
        });
      });
      it('should overwrite the current transform value', () => {
        let globalTransform = [-20, 80];
        carve.sequence((ctx) => {
          ctx.pushTransform([2, 10])
            .pushTransform([-30, -20])
            .pushGlobalTransform(globalTransform);
          expect(ctx.getTransform([])).to.deep.equal(globalTransform);
        });
      });
    });

    describe('Pop Transform', () => {
      it('should return the sequence context', () => {
        carve.sequence((ctx) => { expect(ctx.popTransform()).to.equal(ctx); });
      });
      it('should return the sequence context object', () => {
        carve.sequence((ctx) => {
          expect(ctx.popTransform()).to.equal(ctx);
        });
      });
      it('should remove the last pushed transform', () => {
        carve.sequence((ctx) => {
          let transform = [9, -10];
          ctx.pushTransform(transform)
            .pushTransform([5, 5])
            .popTransform();
          expect(ctx.getTransform([])).to.deep.equal(transform);
        });
      });
    });

    describe('Move To', () => {
      it('should return the sequence context', () => {
        carve.sequence((ctx) => {
          expect(ctx.moveTo([0, 0])).to.equal(ctx);
        });
      });
      it('should push the moveTo code to the returned instruction array', () => {
        let result = carve.sequence((ctx) => {ctx.moveTo([0, 0])});
        expect(result[0]).to.equal(instructionCodes.moveTo);
      });
      it('should push the point value to the returned instruction array', () => {
        let point = [10, 20];
        let result = carve.sequence((ctx) => {ctx.moveTo(point)});
        expect(result.slice(1, 3)).to.deep.equal(point);
      });
      it('should offset the point with the current transform', () => {
        let point = [5, -5];
        let transform = [20, 25];
        let result = carve.sequence((ctx) => {ctx.pushTransform(transform).moveTo(point)});
        expect(result.slice(1, 3)).to.deep.equal(applyTransform([], transform, point));
      });
    });

    describe('Line To', () => {
      it('should return the sequence context', () => {
        carve.sequence((ctx) => {expect(ctx.lineTo([0, 0])).to.equal(ctx);});
      });
      it('should push the lineTo code to the returned instruction array', () => {
        let result = carve.sequence((ctx) => {ctx.lineTo([0, 0]);});
        expect(result[0]).to.equal(instructionCodes.lineTo);
      });
      it('should push the point value to the returned instruction array', () => {
        let point = [10, 20];
        let result = carve.sequence((ctx) => {ctx.lineTo(point)});
        expect(result.slice(1, 3)).to.deep.equal(point);
      });
      it('should offset the point with the current transform', () => {
        let point = [5, -5];
        let transform = [20, 25];
        let result = carve.sequence((ctx) => {ctx.pushTransform(transform).lineTo(point)});
        expect(result.slice(1, 3)).to.deep.equal(applyTransform([], transform, point));
      });
    });

    describe('Quad To', () => {
      it('should return the sequence context', () => {
        carve.sequence((ctx) => {expect(ctx.quadTo([0, 0], [0, 0])).to.equal(ctx);});
      });
      it('should push the quadTo code to the returned instruction array', () => {
        let result = carve.sequence((ctx) => {ctx.quadTo([0, 0], [0, 0])});
        expect(result[0]).to.equal(instructionCodes.quadTo);
      });
      it('should push the control & point value to the returned instruction array', () => {
        let control = [5, 10];
        let point = [20, -10];
        let result = carve.sequence((ctx) => {ctx.quadTo(control, point);});
        expect(result.slice(1, 1 + 2 + 2)).to.deep.equal([].concat(control, point));
      });
      it('should offset the control & point with the current transform', () => {
        let control = [30, 32];
        let point = [12, -4];
        let transform = [-8, 10];
        let result = carve.sequence((ctx) => {ctx.pushTransform(transform).quadTo(control, point)});
        expect(result.slice(1, 1 + 2 + 2)).to.deep
          .equal([].concat(applyTransform([], transform, control), applyTransform([], transform, point)));
      });
    });

    describe('Bezier To', () => {
      it('should return the sequence context', () => {
        carve.sequence((ctx) => {expect(ctx.bezierTo([0, 0], [0, 0], [0, 0])).to.equal(ctx);});
      });
      it('should push the bezierTo code to the returned instruction array', () => {
        let result = carve.sequence((ctx) => {ctx.bezierTo([0, 0], [0, 0], [0, 0]);});
        expect(result[0]).to.equal(instructionCodes.bezierTo);
      });
      it('should push the control & point value to the returned instruction array', () => {
        let controlA = [5, 9];
        let controlB = [12, 30];
        let point = [14, 0];
        let result = carve.sequence((ctx) => {ctx.bezierTo(controlA, controlB, point)});
        expect(result.slice(1, 1 + 2 + 2 + 2)).to.deep
          .equal([].concat(controlA, controlB, point));
      });
      it('should offset the control & point with the current transform', () => {
        let controlA = [5, 9];
        let controlB = [12, 30];
        let point = [14, 0];
        let transform = [-10, -5];
        let result = carve.sequence((ctx) => {ctx.pushTransform(transform).bezierTo(controlA, controlB, point)});
        expect(result.slice(1, 1 + 2 + 2 + 2)).to.deep
          .equal([].concat(
            applyTransform([], transform, controlA),
            applyTransform([], transform, controlB),
            applyTransform([], transform, point)));
      });
    });

    describe('Sequence', () => {
      it('should return the sequence context', () => {
        carve.sequence((ctx) => {
          expect(ctx.sequence(() => {})).to.equal(ctx);
        });
      });
      it('should execute the passed predicate', () => {
        let wasExecuted = false;
        let check = () => {wasExecuted = true;};
        carve.sequence((ctx) => {ctx.sequence(check);});
        expect(wasExecuted).to.be.true;
      });
      it('should pass the sequence context to the predicate', () => {
        let storedCtx;
        carve.sequence((ctx) => {
          storedCtx = ctx;
          ctx.sequence((ctx) => {expect(ctx).to.equal(storedCtx); });
        });
      });
      it('should pass the state argument provided to the original sequence call to the predicate', () => {
        let original = {a: 5};
        carve.sequence((ctx, state)=> {
          ctx.sequence((ctx, state) => {expect(state).to.equal(original); }, state);
        }, {state: original});
      });
      it('should prevent the popping of transforms past where the transform stack ' +
        'was when sequence was called', () => {
        let transform = [10, 20];
        let point = [5, -5];
        let result = carve.sequence((ctx) => {
          ctx.pushTransform(transform)
            .sequence((ctx) => {ctx.popTransform();})
            .moveTo(point);
        });
        expect(result.slice(1, 3)).to.deep.equal(addPoints(transform, point));
      });
    });

    describe('Branch', () => {
      it('should provide a new sequence context to the predicate', () => {
        carve.sequence((ctx) => {
          ctx.branch((innerCtx) => {
            expect(innerCtx).to.not.equal(ctx);
          });
        });
      });
      carve.sequence((ctx) => {
        _.forIn(ctx, (v, k) => {
          if (typeof v === 'function') {
            it('should have the function ' + k + ' on the new sequence context', () => {
              carve.sequence((ctx) => {
                ctx.branch((ctx) => {
                  expect(ctx[k]).to.be.a('function');
                });
              });
            });
          }
        });
      });
      it('should have an instruction array', () => {
        carve.sequence((ctx) => {
          ctx.branch((ctx) => {
            expect(ctx.instructions).to.be.an('array');
          });
        });
      });
      it('should have an empty instruction array', () => {
        carve.sequence((ctx) => {
          ctx.branch((ctx) => {
            expect(ctx.instructions).to.be.empty;
          })
        });
      });
      it('should have an instruction index with a value of 0', () => {
        carve.sequence((ctx) => {
          // expect(ctx.branch().iIndex).to.equal(0);
          ctx.branch((ctx) => {
            expect(ctx.iIndex).to.equal(0);
          });
        });
      });
      it('should have an transform array with the parent sequence context\'s current ' +
        'transform values', () => {
        carve.sequence((ctx) => {
          ctx.pushTransform([5, 10]);
          ctx.pushTransform([-2, -2]);
          let offset = ctx.getTransform([]);
          ctx.branch((ctx) => {
            expect(ctx.transforms).to.deep.equal(offset);
          });
        });
      });
      it('should have a transform lower bound of 2', () => {
        carve.sequence((ctx) => {
          ctx.branch((ctx) => {
            expect(ctx.tLowerBound).to.equal(2);
          });
        });
      });

    });

  });

});