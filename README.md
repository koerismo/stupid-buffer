# stupid-buffer
A stupid simple buffer interface, inspired by smart-buffer.

```
npm i stupid-buffer
```

### Writing Data
```ts
import Buffer from 'stupid-buffer';
import assert from 'node:assert';

const myBuffer = new Buffer(48);

// Singular values can be written by providing a number
myBuffer.write_u8(0xAB);
myBuffer.write_i32(1234);

// Arrays are also accepted as a value
const myArray = new Uint16Array([ 1, 2, 3, 4 ]);
myBuffer.write_u16(myArray);

// Strings can be written by providing a string and its length
const myStr = 'hello world';
myBuffer.write_str(myStr, myStr.length);

// Alignment can be forced with the align(...) method.
myBuffer.align(0x10);

// Null-terminated strings can be written by not providing a length
myBuffer.write_str('Somestring');
```
### Reading Data
```ts
// Go back to the start of the buffer...
myBuffer.seek(0);

// Read the ints and check if they match
assert(myBuffer.read_u8() === 171);
assert(myBuffer.read_i32() === 1234);

// Read the array and compare it with the original
assert.deepEqual(myBuffer.read_u16(4), myArray);

// Read the fixed-length string and compare
assert(myBuffer.read_str(myStr.length) == myStr);

// Re-align the pointer to the nearest 16-byte step
myBuffer.align(0x10);

// Read the zstring and compare. Tada!
assert(myBuffer.read_str() == 'Somestring');
```
