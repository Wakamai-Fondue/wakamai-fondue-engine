import { Font } from "./third_party/font.patched.js";
import Fondue from "./src/fondue/Fondue.js";

export default function loadFondue(fontPath) {
	return new Promise((resolve, reject) => {
		const font = new Font(fontPath);
		font.onload = () => resolve(new Fondue(font));
		font.onerror = (e) => reject(e.detail.message);
		font.src = fontPath;
	});
}
