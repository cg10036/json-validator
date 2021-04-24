```js
required can be boolean, string, array, null, undefined
boolean is null or undefined or false: not required
data[string] is null or undefined or false: not required
data[array[0]][array[1]]... is null or undefined or false: not required

object can be validate with "content"

number, integer, float must not be more than Number.MAX_SAFE_INTEGER (num <= Number.MAX_SAFE_INTEGER)
number, integer, float must be more than -Number.MAX_SAFE_INTEGER + 1 (num >= -Number.MAX_SAFE_INTEGER + 1)
string length must not be more than Number.MAX_SAFE_INTEGER (str.length <= Number.MAX_SAFE_INTEGER)

returns true or error string when validation is complete
```
