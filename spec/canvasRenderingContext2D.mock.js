let mock = {
  _storage: [],
  get storage() {
    return this._storage;
  },
  clearStorage: function () {
    this._storage = [];
  },

  moveTo: function (x, y) {
    this.storage.push({type: 'moveTo', point: [x, y]});
  },
  lineTo: function (x, y) {
    this.storage.push({type: 'lineTo', point: [x, y]});
  },
  bezierCurveTo: function (xA, yA, xB, yB, x, y) {
    this.storage.push({type: 'bezierCurveTo', controlA: [xA, yA], controlB: [xB, yB], point: [x, y]});
  },
  quadraticCurveTo: function (cA, cB, x, y) {
    this.storage.push({type: 'quadraticCurveTo', control: [cX, cY], point: [x, y]});
  }
};

export {mock as canvasRenderingContext2DMock}