(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.transformTree = factory();
  }
}(this, function () {
	return function transformTree() {
		var halfPI = Math.PI * 0.5;
		var branchWidth = 1;
		var lineWidth = 1;
		var branchHalfWidth = branchWidth * 0.5;
		var lineHalfWidth = lineWidth * 0.5;
		var maxDepth = 4;
		var cornerNormalCache = [0, 0];

		var firstJoint = [[-20, 0], [0, 1]];
		var leftCorner = [[-branchHalfWidth - lineHalfWidth, 0], vec2.normalize([], [-1, 1])];
		var rightCorner = [[branchHalfWidth + lineHalfWidth, 0], vec2.normalize([], [1, 1])];
		var lastJoint = [[20, 0], [0, 1]];

		var isGrowing = true;
		var opacity = 1;

		var joints = _.map(_.range(256), function() { return  0; });
		var tree;

		var treeBase = {
		  root: [0, 0],
		  normal: [0, 1],
		  length: 0,
		  targetLength: 10,
		  t: -1,
		  children: [],
		  isComplete: false
		};

		var pointCache = (function() {
		  var index = 0;
		  var points = _.map(_.range(64), function(){ return [0, 0]; });

		  var sealedIndex = 0;
		  var sealedPoints = _.map(_.range(512), function() { return [0, 0]; });

		  return {
		    get point() {
		      index = index % points.length;
		      return points[index++];
		    },
		    get sealed() {
		      if (sealedIndex >= sealedPoints.length) throw Error('out of range');
		      return sealedPoints[sealedIndex++];
		    },
		    reset() {
		      sealedIndex = 0;
		    }
		  }
		})();

		var resetTree = function resetTree() {
		  tree = _.assign({}, treeBase, {children: []});
		};

		var simpleCommit = function simpleCommit(fillStyle) {
		  return function(canvasCtx, op) {
		    canvasCtx.beginPath();
		    op();
		    canvasCtx.fillStyle = fillStyle ? fillStyle : '#34AB88';
		    canvasCtx.fill();
		  };
		};

		var getCCWPerpendicularVector = function getCCWPerpendicularVector(out, v) {
		  out[0] = -v[1];
		  out[1] = v[0];
		  return out;
		};

		var buildSegment = function buildSegment(out, root, angle, targetLength) {
		  out = out || {};
		  out.root = vec2.copy([], root);
		  out.normal = [Math.cos(angle), Math.sin(angle)];
		  out.length = 0;
		  out.targetLength = targetLength;
		  out.orignalLength = 0;
		  out.t = -1;
		  out.children = [];
		  out.isComplete = false;

		  return out;
		};

		var computeTipPoint = function computeTipPoint(out, root, normal, length) {
		  return vec2.add(out, root, vec2.scale(pointCache.point, normal, length));
		};

		const computeCornerNormal = function computeCornerNormal(out, inNormal, outNormal) {
		  var n = vec2.normalize(cornerNormalCache, vec2.add(pointCache.point, inNormal, outNormal));
		  return getCCWPerpendicularVector(out, n);
		};

		var computeSegmentProgress = function computeSegmentProgress(children) {
		  var globalTarget = 0;
		  var globalLength = 0;
		  _.forEach(children, function(c) {
		    globalLength += c.length;
		    if (c.targetLength >= 0) {
		      globalTarget += c.targetLength;
		    } else globalTarget += c.length;
		  });
		  return globalLength / globalTarget;
		};

		var lerpNormals = function lerpNormals(out, normalA, normalB, t) {
		  return vec2.normalize(out, vec2.lerp(pointCache.point, normalA, normalB, t));
		};

		var pushPathJoint = function pushPathJoint(joints, jointIndex, tip, normal) {
		  var position = vec2.add(pointCache.point, tip, vec2.scale(pointCache.point, normal, branchWidth));
		  joints[jointIndex] = position[0];
		  joints[jointIndex + 1] = position[1];
		  joints[jointIndex + 2] = normal[0];
		  joints[jointIndex + 3] = normal[1];
		  return jointIndex + 4;
		};

		var walkSegment = function walkSegment(segment, normal, jointIndex) {
		  var tip = computeTipPoint(pointCache.sealed, segment.root, normal, segment.length);

		  var ccwNormal = getCCWPerpendicularVector(pointCache.point, normal);
		  var cwNormal = vec2.negate(pointCache.point, ccwNormal);

		  var normalA = lerpNormals(pointCache.sealed, normal, ccwNormal, 0.2);
		  var normalB = lerpNormals(pointCache.sealed, normal, cwNormal, 0.2);

		  if (segment.isComplete === true && !_.isEmpty(segment.children)) {

		    var t = computeSegmentProgress(segment.children);
		    var lastNormal = vec2.copy(pointCache.sealed, normal);
		    _.forEach(segment.children, function (c, i) {
		      var childNormal = lerpNormals(pointCache.sealed, normal, c.normal, t);
		      var cornerNormal = computeCornerNormal(pointCache.sealed, lastNormal, childNormal);
		      if (i == 0) cornerNormal = lerpNormals(cornerNormal, normalA, cornerNormal, t);
		      else cornerNormal = lerpNormals(cornerNormal, normal, cornerNormal, t);
		      lastNormal = vec2.negate(lastNormal, childNormal);

		      jointIndex = pushPathJoint(joints, jointIndex, tip, cornerNormal);
		      jointIndex = walkSegment(c, childNormal, jointIndex);
		    });

		    var cornerNormal = computeCornerNormal(pointCache.sealed, lastNormal, vec2.negate(pointCache.point, normal));
		    cornerNormal = lerpNormals(cornerNormal, normalB, cornerNormal, t);
		    jointIndex = pushPathJoint(joints, jointIndex, tip, cornerNormal);

		  } else {
		    jointIndex = pushPathJoint(joints, jointIndex, tip, normalA);
		    jointIndex = pushPathJoint(joints, jointIndex, tip, normalB);
		  }
		  return jointIndex;
		};

		var seqPath = function seqPath(ctx, state) {
		  if (state.index < state.maxIndex && state.isContinue !== false) {
		    var position = [joints[state.index], joints[state.index + 1]];
		    var normal = [joints[state.index + 2], joints[state.index + 3]];

		    ctx.lineTo(vec2.add(pointCache.point, position, vec2.scale(pointCache.point, normal, lineHalfWidth)));

		    state.index += 4;
		    ctx.sequence(seqPath, state);

		    ctx.lineTo(vec2.add(pointCache.point, position, vec2.scale(pointCache.point, normal, -lineHalfWidth)));
		  }
		};

		var seqCore = function seqCore(ctx, state) {
		  if (state.index < state.maxIndex) {
		    var position = [joints[state.index], joints[state.index + 1]];
		    var normal = [joints[state.index + 2], joints[state.index + 3]];
		    ctx.lineTo(vec2.add(pointCache.point, position, vec2.scale(pointCache.point, normal, -lineHalfWidth)));

		    state.index += 4;
		    ctx.sequence(seqCore, state);
		  }
		};

		var sinInterpolate = function sinInterpolate(a, b, t) {
		  t = (Math.sin((t * Math.PI) - (Math.PI * 0.5)) * 0.5) + 0.5;
		  return ((b - a) * t) + a
		};

		var updateSegment = function updateSegment(segment, delta, depth) {
		  var isGrowing = false;
		  if (segment.targetLength >= 0) {
		    if (segment.t < 0) {
		      segment.t = 0;
		      segment.orignalLength = segment.length
		    }

		    segment.t = Math.min(segment.t + delta * (0.01 / Math.abs(segment.targetLength - segment.orignalLength)), 1);
		    segment.length = sinInterpolate(segment.orignalLength, segment.targetLength, segment.t);

		    if (segment.t === 1) {
		      segment.t = -1;
		      segment.targetLength = -1;
		    }

		    isGrowing = true;
		  } else {
		    if (depth <= maxDepth) {
		      if (segment.isComplete === true) {
		        _.forEach(segment.children, function(c) {
		          isGrowing = updateSegment(c, delta, depth + 1) || isGrowing;
		        });
		      } else {
		        segment.isComplete = true;

		        if (depth === 0 || Math.random() > 0.4 / (depth + 1)) {
		          var tip = computeTipPoint([], segment.root, segment.normal, segment.length);

		          var angle = Math.atan2(segment.normal[1], segment.normal[0]);

		          var angleA = angle + ((Math.PI * 0.2) + ((Math.random() * 0.2) - 0.1 ));
		          var angleB = angle - ((Math.PI * 0.2) + ((Math.random() * 0.2) - 0.1));

		          var lenA = ((Math.random() * 20) + 10) * 0.5;
		          var lenB = ((Math.random() * 20) + 10) * 0.5;

		          segment.children.push(buildSegment({}, tip, angleA, lenA));
		          segment.children.push(buildSegment({}, tip, angleB, lenB));

		          isGrowing = true;
		        }
		      }
		    }
		  }
		  return isGrowing;
		};

		var copyJointIntoArray = function copyJointIntoArray(joints, jointIndex, joint) {
		  joints[jointIndex] = joint[0][0];
		  joints[jointIndex + 1] = joint[0][1];
		  joints[jointIndex + 2] = joint[1][0];
		  joints[jointIndex + 3] = joint[1][1];
		  return jointIndex + 4;
		};

		resetTree();

		return {

	  	render: function render(ctx, state) {

		    var jointIndex = 0;
		    jointIndex = copyJointIntoArray(joints, jointIndex, firstJoint);
		    jointIndex = copyJointIntoArray(joints, jointIndex, leftCorner);
		    jointIndex = walkSegment(tree, tree.normal, jointIndex);
		    jointIndex = copyJointIntoArray(joints, jointIndex, rightCorner);
		    jointIndex = copyJointIntoArray(joints, jointIndex, lastJoint);

		    pointCache.reset();

		    ctx.pushTransform([0, -40])
		      .sequence(seqPath, {index: 0, maxIndex: jointIndex, distance: 0})
		      .commit(simpleCommit(opacity === 1 ? 'blue' : 'rgba(20, 20, 250,' + opacity + ')'))
		      .sequence(seqCore, {index: 0, maxIndex: jointIndex, distance: 0})
		      .commit(function (canvasCtx, op) {
		        canvasCtx.beginPath();
		        op();
		        canvasCtx.globalCompositeOperation = 'destination-out';
		        canvasCtx.fill();
		        canvasCtx.globalCompositeOperation = 'source-over';
		      })
		      .popTransform();

		  },
		  update: function update(delta) {
		    if(isGrowing) {
		      if(opacity < 1){
		        opacity = Math.min(opacity + delta * 0.001, 1);
		      }
		      if (!updateSegment(tree, delta, 0)) {
		        // resetTree();
		        isGrowing = false;
		      }
		    } else {
		      opacity = Math.max(opacity - delta * 0.002, 0);
		      if(opacity === 0){
		        isGrowing = true;
		        resetTree();
		      }
		    }
		  }
		}
	}
}));