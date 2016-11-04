# Carve Canvas v0.2.0

## What is it?

   A small JS library to help make drawing dynamic paths into `<canvas>` elements easier.

## Examples

   A simple example
   **Note: Within this library 2D vectors are expected as two element arrays, so \[x, y\]**

```javascript
import carve from 'carve-canvas'
let canvasCtx = document.querySelector('#my-canvas').getContext('2d');
let carveCtx = carve(canvasCtx);

canvasCtx.beginPath();

carveCtx
    .moveTo([10, 10])
    .lineTo([50, 50) 
    .lineTo([50, 10])
    .commit(); //This will send our stored instructions into the 2D context object.
    
canvasCtx.fillStyle = '#4A4';
canvasCtx.fill();
```

   Ok, so that's the very basics.
   Now, let's add some transformations that are applied to subsequent input operations.

```javascript
import carve from 'carve-canvas'
let canvasCtx = document.querySelector('#my-canvas').getContext('2d');
let carveCtx = carve(canvasCtx);

carveCtx
    // The carve 'context' object has a transform stack we can push offsets to.
    .pushTransform([0, 10]) 
    .moveTo([0, -10])
    .lineTo([-10, 0])
    
    // Transforms combine as we push them to the stack,
    //     so our current global transform point is [0, 50].
    .pushTransform([0, 40]) 
    .lineTo([-10, 0])
    .lineTo([0, 10])
    .lineTo([10, 0])
    
    // And now we're back to [0, 10].
    .popTransform()
    .lineTo([10, 0])
    .commit((canvasCtx, trigger) => { //we can pass a function to .commit
        // The predicate we pass to .commit gets the original CanvasRenderingContext2D
        //     object we passed in when we created carveCtx.
        canvasCtx.beginPath();

        // By calling this trigger function, all our stored instructions get dumped into the canvas context
        trigger();

        // We can do our canvas context drawing configuration/execution in this predicate function
        canvasCtx.fillStyle = '#0C0'; 
        canvasCtx.fill();
    });
```

   And now, we can break our paths up into sequences that can be chained together
   
```
import carve from 'carve-canvas'
let canvasCtx = document.querySelector('#my-canvas').getContext('2d');
let carveCtx = carve(canvasCtx);

carveCtx.pushTransform([-40, 0])
    .moveTo([-10, 0])
    // The .sequence method takes a handler function
    .sequence((seqCtx) => {
        // The first argument passed into the sequence handler funtion is our carveCtx object
        //     unless that behavior has been overridden
        
        seqCtx.pushTransform([40, 40])
            .lineTo([-20, 10])
            .lineTo([20, 10]);
            
        seqCtx.sequence((seqCtx) => {
            seqCtx.pushTransform([40, -40])
                .lineTo([10, 0])
                .lineTo([-10, 0]);
        });
        
        // When we exit from a sequence, our transform is right where we left it.
        seqCtx.lineTo([0, -10]);
    })
```

