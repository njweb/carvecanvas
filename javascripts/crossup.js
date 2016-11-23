/* UMD definition from:  https://github.com/umdjs/umd/blob/master/templates/returnExports.js */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.crossup = factory();
  }
}(this, function () {

    return function crossup() {

        var progress = 0;
        var cache = {
          a: [0, 0],
          b: [0, 0],
          mat: [0, 0, 0, 0, 0, 0]
        };

        var simpleCommit = function simpleCommit(fillStyle) {
          return function commit(canvasCtx, op) {
            canvasCtx.beginPath();
            op();
            canvasCtx.fillStyle = fillStyle ? fillStyle : '#34AB88';
            canvasCtx.fill();
          };
        };

        var calcPoints = function calcPoints(progress) {
          var localProgress = Math.min(progress * (1 / 0.7), 1);
          var piProgress = localProgress * Math.PI;

          var yProgress = Math.sin(piProgress * 0.5);
          var xProgress = Math.sin(piProgress);

          var rotMat = mat2d.fromRotation(cache.mat, (Math.PI) + ((Math.PI - piProgress) * 2));
          var offset = [xProgress * 20, 0];
          var circlePoint = vec2.add(cache.a, [0, 10], vec2.transformMat2d([], [0, -10], rotMat));
          var combined = vec2.add(cache.b, offset, circlePoint);

          return {xProgress, yProgress, combined, localProgress};
        };

        var renderRight = function renderRight(ctx, state) {
        var points = calcPoints(1 - state.progress);

          ctx.pushTransform([5, 0])
            .lineTo([0, points.yProgress * 20])
            .sequence(points.localProgress < 0.5 ?
              function point(ctx) {ctx.lineTo([points.xProgress * 20, 0]);} :
              function square(ctx) {
                ctx.lineTo(points.combined)
                  .lineTo(vec2.multiply([], points.combined, [1, -1]));
              }
            ).lineTo([0, points.yProgress * -20]);
        };

        var renderLeft = function renderLeft(ctx, state) {
          var points = calcPoints(state.progress);

          ctx.pushTransform([-5, 0])
            .lineTo([0, points.yProgress * -20])
            .sequence(points.localProgress < 0.5 ?
              function point(ctx) {ctx.lineTo([points.xProgress * -20, 0]);} :
              function square(ctx) {
                ctx.lineTo(vec2.multiply([], points.combined, [-1, -1]))
                  .lineTo(vec2.multiply([], points.combined, [-1, 1]));
              }
            ).lineTo([0, points.yProgress * 20]);
        };

        var crossupCommit = simpleCommit('#C54575');

        return {
          render: function render(ctx) {
            return ctx
              .moveTo([-5, 32])
              .lineTo([5, 32])
              .sequence(renderRight, {progress})
              .lineTo([5, -32])
              .lineTo([-5, -32])
              .sequence(renderLeft, {progress})
              .commit(crossupCommit);
          },
          update: function update(deltaTime) {
            progress = (progress + (deltaTime * 0.0005)) % 1;
          }
        };
    };
}));