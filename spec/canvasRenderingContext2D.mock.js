let mock = () => {
  return {
    canvas: {width: 100, height: 50},

    _storage: [],
    get storage() {
      return this._storage;
    },
    reset: function () {
      this._storage = [];
    },

    moveTo: function (x, y) {
      this.storage.push({type: 'moveTo', point: [x, y]});
    },
    lineTo: function (x, y) {
      this.storage.push({type: 'lineTo', point: [x, y]});
    },
    bezierCurveTo: function (xCA, yCA, xCB, yCB, x, y) {
      this.storage.push({type: 'bezierCurveTo', controlA: [xCA, yCA], controlB: [xCB, yCB], point: [x, y]});
    },
    quadraticCurveTo: function (xC, yC, x, y) {
      this.storage.push({type: 'quadraticCurveTo', control: [xC, yC], point: [x, y]});
    }
  };
};

export {mock as canvasRenderingContext2DMock}