import { describe, it } from 'bun:test';
import assert from 'node:assert/strict';
import Buffer from '.';

declare global {
	type Float16Array = Float32Array;
	const Float16Array: Float32ArrayConstructor;
	interface Math {
		f16round(value: number): number;
	}
	interface DataView {
		setFloat16(byteOffset: number, value: number, littleEndian?: boolean): number;
		getFloat16(byteOffset: number, littleEndian?: boolean): number;
	}
}

function runTests(view: Buffer) {
	it('ViewBuffer.seek', () => {
		assert.strictEqual(view.pointer, 0);
		view.seek(10);
		assert.strictEqual(view.pointer, 10);
		assert.throws(() => view.seek(-1), 'Seek before zero');
		assert.throws(() => view.seek(view.length), 'Seek after end');
		assert.strictEqual(view.pointer, 10);
	});

	const v_f16 = Math.f16round(0.123456789);
	const v_f32 = Math.fround(0.123456789);
	const v_f64 = 0.123456789;

	it('ViewBuffer Write (single)', () => {
		view.seek(0);
		view.write_u8(0xAB);
		view.write_u16(0xABCD);
		view.write_u32(0x1234ABCD);
		view.write_u64(0xABCD1234ABCD1234n);
		view.write_i8(0xAB);
		view.write_i16(0xABCD);
		view.write_i32(0xABCD1234);
		view.write_i64(0xABCD1234ABCD1234n);
		assert.strictEqual(view.pointer, 30);

		view.write_f16(v_f16);
		view.write_f32(v_f32);
		view.write_f64(v_f64);
		assert.strictEqual(view.pointer, 44);
	});

	it('ViewBuffer Read  (single)', () => {
		view.seek(0);
		assert.strictEqual(view.read_u8(), 0xAB);
		assert.strictEqual(view.read_u16(), 0xABCD);
		assert.strictEqual(view.read_u32(), 0x1234ABCD);
		assert.strictEqual(view.read_u64(), 0xABCD1234ABCD1234n);
		assert.strictEqual(view.read_i8(), -85);
		assert.strictEqual(view.read_i16(), -21555);
		assert.strictEqual(view.read_i32(), -1412623820);
		assert.strictEqual(view.read_i64(), -6067173105568247244n);
		assert.strictEqual(view.pointer, 30);

		assert.strictEqual(view.read_f16(), v_f16);
		assert.strictEqual(view.read_f32(), v_f32);
		assert.strictEqual(view.read_f64(), v_f64);
		assert.strictEqual(view.pointer, 44);
	});

	const i8_array  =   new Int8Array([0xAA, 0xBB, 0xCC, 0xDD]);
	const u8_array  =  new Uint8Array([0xAA, 0xBB, 0xCC, 0xDD]);
	const i16_array =  new Int16Array([0xAABB, 0xCCDD, 0xDEAD, 0xBEEF]);
	const u16_array = new Uint16Array([0xAABB, 0xCCDD, 0xDEAD, 0xBEEF]);
	const i32_array =  new Int32Array([0xDEADBEEF, 0xABADCAFE, 0xFEEDFACE, 0xFADEDEAD]);
	const u32_array = new Uint32Array([0xDEADBEEF, 0xABADCAFE, 0xFEEDFACE, 0xFADEDEAD]);
	const i64_array = new BigInt64Array([0xDEADBEEFDEADBEEFn, 0xABADCAFEABADCAFEn, 0xFEEDFACEFEEDFACEn, 0xFADEDEADFADEDEADn]);
	const u64_array = new BigUint64Array([0xDEADBEEFDEADBEEFn, 0xABADCAFEABADCAFEn, 0xFEEDFACEFEEDFACEn, 0xFADEDEADFADEDEADn]);
	
	const f16_array = new Float16Array([0.123456789, 0.123456789 * 2, 0.123456789 * 3, 0.123456789 * 4]);
	const f32_array = new Float32Array([0.123456789, 0.123456789 * 2, 0.123456789 * 3, 0.123456789 * 4]);
	const f64_array = new Float64Array([0.123456789, 0.123456789 * 2, 0.123456789 * 3, 0.123456789 * 4]);

	it('ViewBuffer Write (array)', () => {
		view.seek(0);
		view.write_u8(u8_array);
		view.write_u16(u16_array);
		view.write_u32(u32_array);
		view.write_u64(u64_array);
		view.write_i8(i8_array);
		view.write_i16(i16_array);
		view.write_i32(i32_array);
		view.write_i64(i64_array);
		assert.strictEqual(view.pointer, 120);

		view.write_f16(f16_array);
		view.write_f32(f32_array);
		view.write_f64(f64_array);
		assert.strictEqual(view.pointer, 176);
	});

	it('ViewBuffer Read  (array)', () => {
		view.seek(0);
		assert.deepStrictEqual(view.read_u8(4), u8_array);
		assert.deepStrictEqual(view.read_u16(4), u16_array);
		assert.deepStrictEqual(view.read_u32(4), u32_array);
		assert.deepStrictEqual(view.read_u64(4), u64_array);
		assert.deepStrictEqual(view.read_i8(4), i8_array);
		assert.deepStrictEqual(view.read_i16(4), i16_array);
		assert.deepStrictEqual(view.read_i32(4), i32_array);
		assert.deepStrictEqual(view.read_i64(4), i64_array);
		assert.strictEqual(view.pointer, 120);

		assert.deepStrictEqual(view.read_f16(4), f16_array);
		assert.deepStrictEqual(view.read_f32(4), f32_array);
		assert.deepStrictEqual(view.read_f64(4), f64_array);
		assert.strictEqual(view.pointer, 176);
	});

	it('ViewBuffer Write (string)', () => {
		view.seek(0);
		view.write_str('This is a\nnull-"terminated" string.');
		assert.strictEqual(view.pointer, 36);
		view.write_str('Another null string.');
		assert.strictEqual(view.pointer, 57);
		view.write_str('Fixed-length \0string', 20);
		assert.strictEqual(view.pointer, 77);

		// Bad length
		assert.throws(() => view.write_str('ABCD', 3));
		// OOB
		assert.throws(() => view.write_str('ABCD'.repeat(30)));
	});

	it('ViewBuffer Read  (string)', () => {
		view.seek(0);
		assert.strictEqual(view.read_str(), 'This is a\nnull-"terminated" string.');
		assert.strictEqual(view.pointer, 36);
		assert.strictEqual(view.read_str(), 'Another null string.');
		assert.strictEqual(view.pointer, 57);
		assert.strictEqual(view.read_str(20), 'Fixed-length \0string');
		assert.strictEqual(view.pointer, 77);
	});
}


describe('Big Endian   ', () => {
	const view = new Buffer(176);
	view.set_endian(false);
	runTests(view);
});

describe('Little Endian', () => {
	const view = new Buffer(176);
	view.set_endian(true);
	runTests(view);
});
