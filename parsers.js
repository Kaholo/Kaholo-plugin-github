function parseArray(value) {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof (value) === "string") {
    return value.split("\n").map((line) => line.trim()).filter((line) => line);
  }
  throw new Error("Unsupported array format");
}

module.exports = {
  boolean: (value) => {
    if (!value || value === "false") { return false; }
    return true;
  },
  text: (value) => {
    if (value) { return value.split("\n"); }
    return undefined;
  },
  number: (value) => {
    if (!value) {
      return undefined;
    }
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      throw new Error(`Value ${value} is not a valid number`);
    }
    return parsed;
  },
  autocomplete: (value, getVal) => {
    if (!value) {
      return undefined;
    }
    if (typeof (value) === "object") {
      return (getVal ? value.value : value.id) || value;
    }
    return value;
  },
  autocompleteOrArray: (value) => {
    if (!value) {
      return [];
    }
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof (value) === "object") {
      return [value.id || value];
    }
    return [value];
  },
  object: (value) => {
    if (!value) {
      return undefined;
    }
    if (typeof (value) !== "object") {
      throw new Error(`Value ${value} is not an object`);
    }
    return value;
  },
  string: (value) => {
    if (!value) {
      return undefined;
    }
    if (typeof (value) === "string") {
      return value.trim();
    }
    throw new Error(`Value ${value} is not a valid string`);
  },
  pullRequest: (value) => {
    if (typeof (value) === "string") {
      if (Number.isNaN(value)) {
        // treat string as url
        try {
          const url = new URL(value);
          const [paramType, id] = url.pathname.match(/\/(issues|pulls)\/([0-9]+)/).slice(1);
          return { paramType, id, url };
        } catch (err) {
          throw new Error(`Problem with pull request value format: ${err.message}`);
        }
      }
      return { paramType: "pulls", id: value };
    }
    if (typeof (value) === "object") { // if autocomplete param
      return { paramType: "pulls", id: value.id };
    }
    if (typeof (value) === "number") { // if provided ID as number from code
      return { paramType: "pulls", id: value.toString() };
    }
    throw new Error("Unsupported pull request value format");
  },
  array: parseArray,
};
