const TE = new TextEncoder();
const TD = new TextDecoder();

// Until float16 becomes standardized, we have to insert
// these types to allow this package to compile.
/** @internal */
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

export class ViewBuffer extends Uint8Array {
	pointer = 0;
	protected view: DataView;
	protected little = false;

	constructor(length: number);
	constructor(array: ArrayLike<number> | ArrayBufferLike);
	constructor(buffer: ArrayBufferLike, byteOffset?: number, length?: number);
	constructor(buffer: number|ArrayLike<number>|ArrayBufferLike, byteOffset?: number, length?: number) {

		// @ts-expect-error When initializing a Uint8Array from another array, byteOffset and length
		// are disregarded for some reason. This is just a quick hack to make it work as expected.
		if (typeof buffer === 'object' && 'buffer' in buffer && byteOffset !== 0 && length !== undefined) buffer = buffer.buffer;

		// @ts-expect-error JUST MAKE IT WORK.
		super(buffer, byteOffset, length);
		this.view = new DataView(this.buffer, this.byteOffset, this.byteLength);
	}

	/** Sets the default endianness of the DataBuffer. */
	set_endian(little: boolean) {
		this.little = little;
	}

	/** Creates a new DataBuffer within the specified bounds. */
	ref(start: number=0, length: number=this.length - start) {
		const buf = new ViewBuffer(this.buffer, start, length);
		buf.set_endian(this.little);
		return buf;
	}

	/** Moves the pointer to the specified position. */
	seek(position: number) {
		if (position < 0 || position >= this.length)
			throw RangeError('Cannot seek outside of buffer! ('+position+')');
		this.pointer = position;
	}

	/** Increments the pointer by the specified number of bytes. */
	pad(length: number): void {
		this.pointer += length;
	}

	/** Aligns the pointer to the nearest multiple specified, and pads a number of bytes if specified. */
	align(multiple: number, offset?: number): void {
		this.pointer = (offset ?? 0) + this.pointer + (multiple - this.pointer % multiple) % multiple;
	}

	read_u8(): number;
	read_u8(length: number): Uint8Array;
	read_u8(length?: number): number|Uint8Array {
		const start = this.pointer;

		if (length === undefined) {
			this.pointer ++;
			return this.view.getUint8(start);
		}

		this.pointer += length;
		return new Uint8Array(this.slice(start, this.pointer));
	}

	write_u8(value: number|Uint8Array) {
		const start = this.pointer;

		if (typeof value === 'number') {
			this.pointer ++;
			return this.view.setUint8(start, value);
		}

		this.pointer += value.length;
		this.set(value, start);
		return;
	}

	read_u16(): number;
	read_u16(length: number, little?: boolean): Uint16Array;
	read_u16(length?: number, little: boolean=this.little): number|Uint16Array {
		const start = this.pointer;

		if (length === undefined) {
			this.pointer += 2;
			return this.view.getUint16(start, little);
		}

		this.pointer += length * 2;
		const arr = new Uint16Array(length);
		for ( let i=0; i<length; i++ ) arr[i] = this.view.getUint16(start + i*2, little);
		return arr;
	}

	write_u16(value: number|Uint16Array, little: boolean=this.little) {
		const start = this.pointer;

		if (typeof value === 'number') {
			this.pointer += 2;
			return this.view.setUint16(start, value, little);
		}

		this.pointer += value.length * 2;
		for ( let i=0; i<value.length; i++ ) this.view.setUint16(start + i*2, value[i], little);
		return;
	}

	read_u32(): number;
	read_u32(length: number, little?: boolean): Uint32Array;
	read_u32(length?: number, little: boolean=this.little): number|Uint32Array {
		const start = this.pointer;

		if (length === undefined) {
			this.pointer += 4;
			return this.view.getUint32(start, little);
		}

		this.pointer += length * 4;
		const arr = new Uint32Array(length);
		for ( let i=0; i<length; i++ ) arr[i] = this.view.getUint32(start + i*4, little);
		return arr;
	}

	write_u32(value: number|Uint32Array, little: boolean=this.little) {
		const start = this.pointer;

		if (typeof value === 'number') {
			this.pointer += 4;
			return this.view.setUint32(start, value, little);
		}

		this.pointer += value.length * 4;
		for ( let i=0; i<value.length; i++ ) this.view.setUint32(start + i*4, value[i], little);
		return;
	}


	read_u64(): bigint;
	read_u64(length: number, little?: boolean): BigUint64Array;
	read_u64(length?: number, little: boolean=this.little): bigint|BigUint64Array {
		const start = this.pointer;

		if (length === undefined) {
			this.pointer += 8;
			return this.view.getBigUint64(start, little);
		}

		this.pointer += length * 8;
		const arr = new BigUint64Array(length);
		for ( let i=0; i<length; i++ ) arr[i] = this.view.getBigUint64(start + i*8, little);
		return arr;
	}

	write_u64(value: bigint|BigUint64Array, little: boolean=this.little) {
		const start = this.pointer;

		if (typeof value === 'bigint') {
			this.pointer += 8;
			return this.view.setBigUint64(start, value, little);
		}

		this.pointer += value.length * 8;
		for ( let i=0; i<value.length; i++ ) this.view.setBigUint64(start + i*8, value[i], little);
		return;
	}

	read_i8(): number;
	read_i8(length: number): Int8Array;
	read_i8(length?: number): number|Int8Array {
		const start = this.pointer;

		if (length === undefined) {
			this.pointer ++;
			return this.view.getInt8(start);
		}

		this.pointer += length;
		return new Int8Array(this.slice(start, this.pointer));
	}

	write_i8(value: number|Int8Array) {
		const start = this.pointer;

		if (typeof value === 'number') {
			this.pointer ++;
			return this.view.setInt8(start, value);
		}

		this.pointer += value.length;
		this.set(value, start);
		return;
	}

	read_i16(): number;
	read_i16(length: number, little?: boolean): Int16Array;
	read_i16(length?: number, little: boolean=this.little): number|Int16Array {
		const start = this.pointer;

		if (length === undefined) {
			this.pointer += 2;
			return this.view.getInt16(start, little);
		}

		this.pointer += length * 2;
		const arr = new Int16Array(length);
		for ( let i=0; i<length; i++ ) arr[i] = this.view.getInt16(start + i*2, little);
		return arr;
	}

	write_i16(value: number|Int16Array, little: boolean=this.little) {
		const start = this.pointer;

		if (typeof value === 'number') {
			this.pointer += 2;
			return this.view.setInt16(start, value, little);
		}

		this.pointer += value.length * 2;
		for ( let i=0; i<value.length; i++ ) this.view.setInt16(start + i*2, value[i], little);
		return;
	}

	read_i32(): number;
	read_i32(length: number, little?: boolean): Int32Array;
	read_i32(length?: number, little: boolean=this.little): number|Int32Array {
		const start = this.pointer;

		if (length === undefined) {
			this.pointer += 4;
			return this.view.getInt32(start, little);
		}

		this.pointer += length * 4;
		const arr = new Int32Array(length);
		for ( let i=0; i<length; i++ ) arr[i] = this.view.getInt32(start + i*4, little);
		return arr;
	}

	write_i32(value: number|Int32Array, little: boolean=this.little) {
		const start = this.pointer;

		if (typeof value === 'number') {
			this.pointer += 4;
			return this.view.setInt32(start, value, little);
		}

		this.pointer += value.length * 4;
		for ( let i=0; i<value.length; i++ ) this.view.setInt32(start + i*4, value[i], little);
		return;
	}

	read_i64(): bigint;
	read_i64(length: number, little?: boolean): BigInt64Array;
	read_i64(length?: number, little: boolean=this.little): bigint|BigInt64Array {
		const start = this.pointer;

		if (length === undefined) {
			this.pointer += 8;
			return this.view.getBigInt64(start, little);
		}

		this.pointer += length * 8;
		const arr = new BigInt64Array(length);
		for ( let i=0; i<length; i++ ) arr[i] = this.view.getBigInt64(start + i*8, little);
		return arr;
	}

	write_i64(value: bigint|BigInt64Array, little: boolean=this.little) {
		const start = this.pointer;

		if (typeof value === 'bigint') {
			this.pointer += 8;
			return this.view.setBigInt64(start, value, little);
		}

		this.pointer += value.length * 8;
		for ( let i=0; i<value.length; i++ ) this.view.setBigInt64(start + i*8, value[i], little);
		return;
	}

	read_f16(): number;
	read_f16(length: number, little?: boolean): Float16Array;
	read_f16(length?: number, little: boolean=this.little): number|Float16Array {
		const start = this.pointer;

		if (length === undefined) {
			this.pointer += 2;
			return this.view.getFloat16(start, little);
		}

		this.pointer += length * 2;
		const arr = new Float16Array(length);
		for ( let i=0; i<length; i++ ) arr[i] = this.view.getFloat16(start + i*2, little);
		return arr;
	}

	write_f16(value: number|Float16Array, little: boolean=this.little) {
		const start = this.pointer;

		if (typeof value === 'number') {
			this.pointer += 2;
			return this.view.setFloat16(start, value, little);
		}

		this.pointer += value.length * 2;
		for ( let i=0; i<value.length; i++ ) this.view.setFloat16(start + i*2, value[i], little);
		return;
	}

	read_f32(): number;
	read_f32(length: number, little?: boolean): Float32Array;
	read_f32(length?: number, little: boolean=this.little): number|Float32Array {
		const start = this.pointer;

		if (length === undefined) {
			this.pointer += 4;
			return this.view.getFloat32(start, little);
		}

		this.pointer += length * 4;
		const arr = new Float32Array(length);
		for ( let i=0; i<length; i++ ) arr[i] = this.view.getFloat32(start + i*4, little);
		return arr;
	}

	write_f32(value: number|Float32Array, little: boolean=this.little) {
		const start = this.pointer;

		if (typeof value === 'number') {
			this.pointer += 4;
			return this.view.setFloat32(start, value, little);
		}

		this.pointer += value.length * 4;
		for ( let i=0; i<value.length; i++ ) this.view.setFloat32(start + i*4, value[i], little);
		return;
	}

	read_f64(): number;
	read_f64(length: number, little?: boolean): Float64Array;
	read_f64(length?: number, little: boolean=this.little): number|Float64Array {
		const start = this.pointer;

		if (length === undefined) {
			this.pointer += 8;
			return this.view.getFloat64(start, little);
		}

		this.pointer += length * 8;
		const arr = new Float64Array(length);
		for ( let i=0; i<length; i++ ) arr[i] = this.view.getFloat64(start + i*8, little);
		return arr;
	}

	write_f64(value: number|Float64Array, little: boolean=this.little) {
		const start = this.pointer;

		if (typeof value === 'number') {
			this.pointer += 8;
			return this.view.setFloat64(start, value, little);
		}

		this.pointer += value.length * 8;
		for ( let i=0; i<value.length; i++ ) this.view.setFloat64(start + i*8, value[i], little);
		return;
	}

	read_str(): string;
	read_str(length: number): string;
	read_str(length?: number) {
		const start = this.pointer;
		let end = start + <number>length;

		if (length === undefined) {
			for (end = start; end < this.length; end++) {
				if (this.view.getUint8(end) == 0) break;
			}
			this.pointer ++;
		}

		this.pointer += end - start;
		return TD.decode(this.slice(start, end));
	}

	write_str(str: string, length?: number) {
		const start = this.pointer;
		this.pointer += str.length;

		this.set(TE.encode(str), start);

		if (length === undefined) {
			this.view.setUint8(this.pointer, 0);
			this.pointer ++;
		}
		else if (str.length !== length) {
			throw RangeError('String of length '+str.length+' does not match write length of '+length+'!');
		}
	}
}

export default ViewBuffer;
