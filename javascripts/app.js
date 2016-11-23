var carve = carvecanvas.carve;

var pointProjector = {
	offset: 50,
	multiplier: 1,
	createProjector: function createProjector(out, p) {
		var self = this;
		return function doProjection(out, p){
			out[0] = (p[0] * self.multiplier) + self.offset;
			out[1] = (-p[1] * self.multiplier) + self.offset;
			return out;
		};
	}
}

var resizeCanvasElements = function resizeCanvasElements() {
	$('canvas').each(function applySize() {
		var size = Math.floor($(this).parent().width());
		if($(this).attr('width') !== size){
			$(this).attr('width', size);
		}
		if($(this).attr('height') !== size){
			$(this).attr('height', size);
		}
		pointProjector.offset = size * 0.5;
		pointProjector.multiplier = size/100;
	});
	doRendering();
};

var throttledResizeCanvasElements = _.throttle(resizeCanvasElements, 200, 
	{leading: false, trailing: true});


$(window).on('resize', throttledResizeCanvasElements);

$(window).on('load', resizeCanvasElements);

var instructions = [];
var transforms = [];

var crossupSystem = crossup();
var carveCrossup = carve(document.querySelector('#canvas-crossup').getContext('2d'), 
	{ 
		projection: pointProjector.createProjector(), 
		instructions: instructions, 
		transforms: transforms 
	});

var blobBlockSystem = blobBlock();
var carveBlobBlock = carve(document.querySelector('#canvas-blobblock').getContext('2d'),
	{
		projection: pointProjector.createProjector(),
		instructions: instructions,
		transforms: transforms
	});

var doRendering = function doRendering() {

	carveCrossup.sequence(function renderCrossover(ctx) {
		ctx.commit(function clear(canvasCtx) {
			canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);
		});
		crossupSystem.render(ctx);
	});

	carveBlobBlock.sequence(function renderBlobBlock(ctx) {
		ctx.commit(function clear(canvasCtx) {
			canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);
		});


		blobBlockSystem.render(ctx);
	});
};

var isUpdating = false;
var doUpdate = (function() {
	let lastTimestamp;

	return function updateSystems(timestamp) {
		var delta = 0;
		if(lastTimestamp !== undefined){
			delta = timestamp - lastTimestamp;
		}
		lastTimestamp = timestamp;

		crossupSystem.update(delta);
		blobBlockSystem.update(delta);

		doRendering();

		if(isUpdating === true) { window.requestAnimationFrame(doUpdate); }
		else lastTimestamp = undefined;
	};
})();

$('canvas').on('click', function() {
	isUpdating = !isUpdating;
	if(isUpdating === true){
		window.requestAnimationFrame(doUpdate);
	}
});