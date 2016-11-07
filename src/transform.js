let push = (outTransformArray, index, offset) => {
  outTransformArray[index] = offset[0];
  outTransformArray[index + 1] = offset[1];
  return index + 2;
};

let pop = (index, lowerBound = 0) => {
  return Math.max(index - 2, Math.max(lowerBound, 0));
};

let merge = (transformA, transformB) => {
  return [transformA[0] + transformB[0], transformA[1] + transformB[1]];
};

let apply = (transform, point) => {
  return merge(transform, point);
};

export {push, pop, merge, apply};
export default {push, pop, merge};