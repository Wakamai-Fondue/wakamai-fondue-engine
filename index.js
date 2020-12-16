import { Font } from "./src/lib-font/lib-font-wrapper";
import Fondue from "./src/fondue/Fondue.js";

export function fromPath(fontPath) {
	return new Promise((resolve, reject) => {
		const font = new Font(fontPath);
		font.onload = () => resolve(new Fondue(font));
		font.onerror = (e) => reject(e.detail.message);

		font.src = fontPath;
	});
}

export function fromDataBuffer(buffer, fontFilename) {
	return new Promise((resolve, reject) => {
		const font = new Font(fontFilename);
		font.onload = () => resolve(new Fondue(font));

		font.fromDataBuffer(buffer, fontFilename).catch(reject);
	});
}
