import { fromDataBuffer } from "../browser";
import fs from "fs";

const readFile = fs.promises.readFile;

function toArrayBuffer(buffer) {
	const ab = new ArrayBuffer(buffer.length);
	const view = new Uint8Array(ab);
	for (let i = 0; i < buffer.length; ++i) {
		view[i] = buffer[i];
	}
	return ab;
}

describe("fromDataBuffer", () => {
	it("loads a font from an ArrayBuffer", async () => {
		const buf = await readFile(
			"./third_party/font.js/fonts/SourceCodeVariable-Roman.ttf"
		);
		const arrayBuf = toArrayBuffer(buf);

		const fondue = await fromDataBuffer(
			arrayBuf,
			"SourceCodeVariable-Roman.ttf"
		);
		expect(fondue._font).toBeDefined();
		expect(fondue._font.opentype).toBeDefined();
	});
});
