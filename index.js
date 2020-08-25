import Font from "./third_party/font.js/FontNode.js";
import Fondue from "./src/fondue/Fondue.js";

export default function loadFondue(fontPath) {
	return new Promise((resolve, reject) => {
		const font = new Font(fontPath);
		font.onload = () => resolve(new Fondue(font));
		font.onerror = (error) => reject(error);
		font.src = fontPath;
	});
}
