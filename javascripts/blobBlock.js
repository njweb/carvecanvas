/* UMD definition from:  https://github.com/umdjs/umd/blob/master/templates/returnExports.js */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.blobBlock = factory();
  }
}(this, function () {
	return function blobBlock() {
		var blockLength = 10;
		var stretchValue = 1.8;
		var droopAmount = 2;

		var block = {
		  position: [10, 10],
		  rot: 0
		};

		var corners = [
		  [-1, 1],
		  [1, 1],
		  [1, -1],
		  [-1, -1]
		];

		var maxAngleOffset = Math.PI * 0.5;
		var rotMat = mat2d.create();

		var simpleCommit = function simpleCommit(fillStyle) {
		  return function(canvasCtx, op) {
		    canvasCtx.beginPath();
		    op();
		    canvasCtx.fillStyle = fillStyle ? fillStyle : '#34AB88';
		    canvasCtx.fill();
		  };
		};

		var projPoint = function projPoint(out, p, s, mat) {
		  return vec2.transformMat2(out, vec2.scale(out, p, s), mat);
		};

		var renderTail = function renderTail(ctx, state) {
		  var x = -1 + (stretchValue * state.secondProgress);
		  ctx
		    .moveTo(projPoint([], [x, 1], blockLength, rotMat))
		    .sequence(renderTailLip, state)
		    .lineTo(projPoint([], [x, -1], blockLength, rotMat));
		};
		var renderTailLip = function renderTailLip(ctx, state) {
		  var lipX = (-0.5 * state.bounceProgress) + (stretchValue * state.secondProgress);
		  var centerX = (stretchValue * 0.5 * state.firstProgress) + (stretchValue * 0.5 * state.secondProgress);
		  ctx
		    .lineTo(projPoint([], [lipX, 1], blockLength, rotMat))
		    .quadTo(
		      vec2.add([], projPoint([], [lipX, state.yValue], blockLength, rotMat), state.droopOffset),
		      vec2.add([], projPoint([], [centerX, state.yValue], blockLength, rotMat), state.droopOffset)
		    )
		    .sequence(renderHeadLip, state)
		    .quadTo(
		      vec2.add([], projPoint([], [lipX, -state.yValue], blockLength, rotMat), state.droopOffset),
		      projPoint([], [lipX, -1], blockLength, rotMat)
		    );
		};
		var renderHeadLip = function renderHeadLip(ctx, state) {
		  var lipX = (stretchValue * state.firstProgress) + (0.5 * state.bounceProgress);
		  var centerX = (stretchValue * 0.5 * state.firstProgress) + (stretchValue * 0.5 * state.secondProgress);

		  ctx
		    .quadTo(
		      vec2.add([], projPoint([], [lipX, state.yValue], blockLength, rotMat), state.droopOffset),
		      projPoint([], [lipX, 1], blockLength, rotMat)
		    )
		    .sequence(renderHead, state)
		    .lineTo(projPoint([], [lipX, -1], blockLength, rotMat))
		    .quadTo(
		      vec2.add([], projPoint([], [lipX, -state.yValue], blockLength, rotMat), state.droopOffset),
		      vec2.add([], projPoint([], [centerX, -state.yValue], blockLength, rotMat), state.droopOffset)
		    )
		};
		var renderHead = function renderHead(ctx, state) {
		  var x = (stretchValue * state.firstProgress) + 1;

		  ctx
		    .lineTo(projPoint([], [x, 1], blockLength, rotMat))
		    .lineTo(projPoint([], [x, -1], blockLength, rotMat));
		};

		var renderStretchBlock = function renderStretchBlock(ctx, block) {

		  var shapedProgress = Math.sin(block.progress * 0.5 * Math.PI);
		  var firstProgress = Math.min(shapedProgress * 2, 1);
		  var secondProgress = Math.max(shapedProgress - 0.5, 0) * 2;
		  var bounceProgress = Math.sin(shapedProgress * Math.PI);
		  var yValue = 1 - (0.8 * bounceProgress);
		  var droopOffset = [0, -droopAmount * bounceProgress];

		  var state = Object.assign({}, block, {firstProgress, secondProgress, bounceProgress, yValue, droopOffset});
		  ctx.sequence(renderTail, state);
		};

		var renderBlock = function renderBlock(ctx, block) {
		  rotMat = mat2d.fromRotation(rotMat, block.rot);
		  if (block.progress > 0) {
		    ctx.sequence(renderStretchBlock, block);
		  } else {
		    _.forEach(corners, function forEachCorner(c, i) {
		      var point = vec2.transformMat2([], vec2.scale([], c, blockLength), rotMat);
		      if (i === 0) { ctx.moveTo(point); }
		      else { ctx.lineTo(point); }
		    });
		  }
		};

		let blobCommit = simpleCommit('#A4B');

		return {
		  render: function render(ctx) {
		    ctx.pushTransform(block.position)
		      .sequence(renderBlock, block)
		      .popTransform()
		      .commit(blobCommit);
		  },
		  update: function update(deltaTime) {
		    if (!_.isNil(block.progress)) {
		      block.progress = Math.min(block.progress + (deltaTime * 0.0003), 1);
		      if (block.progress >= 1) {
		        block.progress = null;
		        var offset = vec2.scale([], vec2.transformMat2d([], [1, 0], rotMat), blockLength * stretchValue);
		        block.position = vec2.add([], block.position, offset);
		      }
		    } else if (_.isNil(block.targetRot)) {
		      var centerNormal = vec2.normalize([], vec2.negate([], block.position));
		      var centerRot = Math.atan2(centerNormal[1], centerNormal[0]);
		      var rotOffset = (Math.random() * maxAngleOffset * 2) - (maxAngleOffset);

		      if(Math.abs(rotOffset - block.rot) > Math.abs((rotOffset - (Math.PI * 2)) - block.rot)) {
		      	rotOffset -= (Math.PI * 2);
		      }
		      console.log(Math.abs(rotOffset - block.rot));

		      block.targetRot = centerRot + rotOffset;
		    } else {
		      block.rot += (block.targetRot - block.rot) * (deltaTime * 0.002);
		      if (Math.abs(block.rot - block.targetRot) < 0.1) {
		        block.targetRot = null;
		        block.progress = 0;
		      }
		    }
		  }
		};
	};
}));