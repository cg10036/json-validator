/**
 * required can be boolean, string, array, null, undefined
 * boolean is null or undefined or false: not required
 * data[string] is null or undefined or false: not required
 * data[array[0]][array[1]]... is null or undefined or false: not required
 *
 * object can be validate with "content"
 *
 * number, integer, float must not be more than Number.MAX_SAFE_INTEGER (num <= Number.MAX_SAFE_INTEGER)
 * number, integer, float must be more than -Number.MAX_SAFE_INTEGER + 1 (num >= -Number.MAX_SAFE_INTEGER + 1)
 * string length must not be more than Number.MAX_SAFE_INTEGER (str.length <= Number.MAX_SAFE_INTEGER)
 *
 * returns true or error string when validation is complete
 */

let data = {
  key1: "13112312312312312312312323",
  boolean: true,
  inside: {
    boolean: true,
  },
  relatedBoolean: "asdf",
  relatedInsideBoolean: "asdf",
  integer: 134,
  float: 134.1,
  array: [],
};
let struct = {
  key1: {
    type: "string",
    required: true,
    minLength: 7,
    maxLength: 10000000,
  },
  boolean: {
    type: "boolean",
    required: true,
  },
  inside: {
    type: "object",
    content: {
      boolean: {
        type: "boolean",
        required: true,
      },
    },
    required: true,
  },
  relatedBoolean: {
    type: "string",
    required: "boolean",
  },
  relatedInsideBoolean: {
    type: "string",
    required: ["inside", "boolean"],
  },
  integer: {
    type: "integer",
    required: true,
    min: 123,
    max: 456,
  },
  float: {
    type: "float",
    required: true,
    min: 123,
    max: 456,
  },
  array: {
    type: "array",
    required: true,
  },
};
console.log(objectValidate(data, struct));
console.log(jsonValidate(JSON.stringify(data), struct));

const Error = {
  parse: "데이터에 오류가 있습니다.", // "There was an error in the data."
  require: "을(를) 입력해주세요.", // " should be typed."
  bigNumber: "가 너무 큽니다.", // " is too big"
  type: ["은(는) ", "만 입력해주세요."], // [" must be an ", ""]
  range: [
    ["은(는) ", "보다 작아야합니다."], // [" must smaller than ", ""]
    ["은(는) ", "보다 커야합니다."], // [" must bigger than ", ""]
  ],
  length: [
    ["은(는) ", "글자보다 작아야합니다."], // [" length must smaller than ", ""]
    ["은(는) ", "글자보다 커야합니다."], // [" length must bigger than ", ""]
  ],
};
const Types = {
  integer: "정수", // "integer"
  float: "실수", // "float"
  number: "숫자", // "number"
  string: "문자열", // "string"
  object: "객체", // "object"
  array: "배열", // "array"
};

function parseJson(json) {
  try {
    return JSON.parse(json);
  } catch (err) {
    return false;
  }
}

function jsonValidate(json, structs) {
  let data = parseJson(json);
  if (data === false) {
    return Error.parse;
  }
  return objectValidate(data, structs);
}

function getType(data) {
  if (Array.isArray(data)) {
    return ["array"];
  }
  let type = typeof data;
  if (type != "number") {
    return [type];
  }
  if (
    data > Number.MAX_SAFE_INTEGER ||
    data < -Number.MAX_SAFE_INTEGER + 1 ||
    data !== (data | 0)
  ) {
    return [type, "float"];
  }
  return [type, "integer"];
}

function objectValidate(object, structs, oriObject) {
  oriObject = oriObject ?? object;
  let keys = Object.keys(structs);
  for (let i = 0; i < keys.length; i++) {
    let data = object[keys[i]];
    let struct = structs[keys[i]];
    if (data == null) {
      if (struct.required === true) {
        return `${struct.name ?? keys[i]}${Error.require}`;
      } else if (
        typeof struct.required == "string" &&
        (oriObject[struct.required] == null ||
          oriObject[struct.required] === false)
      ) {
        return `${struct.name ?? keys[i]}${Error.require}`;
      } else if (Array.isArray(struct.required)) {
        let tmp = oriObject;
        for (let i = 0; i < struct.required.length; i++) {
          tmp = tmp[struct.required[i]];
          if (typeof tmp != "object" && i != struct.required.length - 1) {
            return `${struct.name ?? keys[i]}${Error.require}`;
          }
        }
        if (tmp == null || tmp === false) {
          return `${struct.name ?? keys[i]}${Error.require}`;
        }
        continue;
      } else {
        continue;
      }
    }
    let type = getType(data);
    if ((struct.type ?? "any") == "any") {
      continue;
    }
    if (type.indexOf(struct.type) == -1) {
      if (
        (data > Number.MAX_SAFE_INTEGER ||
          data < -Number.MAX_SAFE_INTEGER + 1) &&
        struct.type == "integer"
      ) {
        return `${struct.name ?? keys[i]}${Error.bigNumber}`;
      }
      return `${struct.name ?? keys[i]}${Error.type[0]}${Types[struct.type]}${
        Error.type[1]
      }`;
    }
    if (type == "object") {
      let result = objectValidate(data, struct.content ?? {}, oriObject);
      if (result !== true) {
        return result;
      }
    } else if (
      type.indexOf("number") != -1 ||
      type.indexOf("integer") != -1 ||
      type.indexOf("float") != -1
    ) {
      if (data > (struct.max ?? Number.MAX_SAFE_INTEGER)) {
        return `${struct.name ?? keys[i]}${Error.range[0][0]}${
          struct.max ?? Number.MAX_SAFE_INTEGER
        }${Error.range[0][1]}`;
      } else if (data < (struct.min ?? -Number.MAX_SAFE_INTEGER + 1)) {
        return `${struct.name ?? keys[i]}${Error.range[1][0]}${
          struct.min ?? -Number.MAX_SAFE_INTEGER + 1
        }${Error.range[1][1]}`;
      }
    } else if (type == "bigint") {
      if (struct.max && data > struct.max) {
        return `${struct.name ?? keys[i]}${Error.range[0][0]}${struct.max}${
          Error.range[0][1]
        }`;
      } else if (struct.min && data < struct.min) {
        return `${struct.name ?? keys[i]}${Error.range[1][0]}${struct.min}${
          Error.range[1][1]
        }`;
      }
    } else if (type == "string") {
      if (data.length > (struct.maxLength ?? Number.MAX_SAFE_INTEGER)) {
        return `${struct.name ?? keys[i]}${Error.length[0][0]}${
          struct.maxLength ?? Number.MAX_SAFE_INTEGER
        }${Error.length[0][1]}`;
      } else if (data.length < (struct.minLength ?? 0)) {
        return `${struct.name ?? keys[i]}${Error.length[1][0]}${
          struct.minLength ?? 0
        }${Error.length[1][1]}`;
      }
    }
  }
  return true;
}
