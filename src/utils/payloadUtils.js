const isObjectLike = (value) => value !== null && typeof value === 'object';

const enqueueCandidates = (queue, value) => {
  if (!value) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => {
      if (isObjectLike(item)) {
        queue.push(item);
      }
    });
    return;
  }

  if (isObjectLike(value)) {
    queue.push(value);
  }
};

export const collectCandidateObjects = (input) => {
  const result = [];
  const queue = [];
  const visited = new WeakSet();

  enqueueCandidates(queue, input);

  while (queue.length > 0) {
    const current = queue.shift();

    if (!isObjectLike(current) || visited.has(current)) {
      continue;
    }

    visited.add(current);

    if (!Array.isArray(current)) {
      result.push(current);
    }

    const values = Array.isArray(current) ? current : Object.values(current);
    values.forEach((value) => {
      enqueueCandidates(queue, value);
    });
  }

  return result;
};

export const extractValueByKeys = (input, keys, { predicate, transform } = {}) => {
  const safeKeys = Array.isArray(keys) ? keys : [];
  if (safeKeys.length === 0) {
    return undefined;
  }

  const objects = collectCandidateObjects(input);

  for (const object of objects) {
    for (const key of safeKeys) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        const value = object[key];
        const isValid = predicate ? predicate(value, object, key) : value != null;

        if (isValid) {
          return transform ? transform(value, object, key) : value;
        }
      }
    }
  }

  return undefined;
};

export const extractObjectsFromPayload = (input, keys) => {
  const safeKeys = Array.isArray(keys) ? keys : [];
  const objects = collectCandidateObjects(input);
  const result = [];
  const collected = new WeakSet();

  const pushUnique = (value) => {
    if (isObjectLike(value) && !collected.has(value)) {
      collected.add(value);
      result.push(value);
    }
  };

  objects.forEach((object) => {
    safeKeys.forEach((key) => {
      const value = object[key];

      if (Array.isArray(value)) {
        value.forEach(pushUnique);
      } else {
        pushUnique(value);
      }
    });
  });

  if (result.length === 0 && objects.length > 0) {
    pushUnique(objects[0]);
  }

  return result;
};

export const extractArrayFromPayload = (input, keys) => {
  const safeKeys = Array.isArray(keys) ? keys : [];
  const objects = collectCandidateObjects(input);
  const result = [];
  const collected = new WeakSet();

  const pushUnique = (value) => {
    if (isObjectLike(value) && !collected.has(value)) {
      collected.add(value);
      result.push(value);
    }
  };

  objects.forEach((object) => {
    safeKeys.forEach((key) => {
      const value = object[key];
      if (Array.isArray(value)) {
        value.forEach(pushUnique);
      }
    });
  });

  return result;
};
