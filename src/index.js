// let carveCtx;
// let shapeObj;

let isObj = (v) => v !== null && typeof v === 'object';

let validateCanvasCtxArgument = (canvasCtx) => {
  if (
    !isObj(canvasCtx)
    || !isObj(canvasCtx.canvas)
    || !Number.isInteger(canvasCtx.canvas.width)
    || !Number.isInteger(canvasCtx.canvas.height)
  ) throw new TypeError('arg[0] should be a valid CanvasRenderingContext2D');
  else return canvasCtx;
};

let carve = (ctx) => {
  ctx = validateCanvasCtxArgument(ctx);

  return {
    _instructions: [],
    _transform: [],
    _mapToCanvas: () => {},
    _applyTransform: () => {},
    _mergeTransforms: () => {},

    pushTransform: () => {},
    popTransform: () => {},

    moveTo: () => {},
    lineTo: () => {},
    bezierTo: () => {},
    quadTo: () => {},

    makeChild: () => {},
    render: () => {},
    commit: () => {}

  };
};

export {carve}
/*
 {
 _canvasCtx: {}
 _canvasSize: []
 _instructions: []
 _transform: []???
 render(predicate, state)
 commit()

 moveTo
 lineTo
 bezierTo
 quadTo

 pushTransform(t)
 popTransform()

 _applyTransform
 _mapToCanvas
 }
 */

/*
 {
 canvasCtx: {},
 canvasSize: [],
 instructions: [],
 transform: [],

 mapToCanvas: func,

 mergeTransform: func,
 setTransform: func,

 createChild: func,
 render: func

 commit: func
 }

 carveCtx.render(carveCtx.createChild(), predicate, state) -> carveCtx
 carveCtx.moveTo().render(...).commit();
 */


// carveCtx.buildShape() -> shapeCtx.pushTransform -> shapeCtx.moveTo -> shapeCtx.lineTo -> shapeCtx.renderShape() -> shapeCtx.commit()
// carveCtx.render() -> <new>carveCtx ->