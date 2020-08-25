import "./third_party/font.js/lib/inflate.js";
import "./third_party/font.js/lib/unbrotli.js";
import { Font, getFontCSSFormat } from "./third_party/font.js/Font.js";
import Fondue from "./src/fondue/Fondue.js";

export function fromDataBuffer(buffer, fontFilename) {
	return new Promise((resolve, reject) => {
		const fontType = getFontCSSFormat(fontFilename);

		const font = new Font(fontFilename);
		font.onload = () => resolve(new Fondue(font));
		font.onerror = (error) => reject(error);

		font.fromDataBuffer(buffer, fontType);
	});
}

export default function loadFondue(fontUrl, filename) {
	return new Promise((resolve, reject) => {
		const fontExt =
			fontUrl.indexOf("data:") !== 0 &&
			(fontUrl.match(/[^\.\\/:\*"<>|]+?$/) || [])[0];
		let fontName =
			filename ||
			(fontUrl.indexOf("data:") !== 0 ? fontUrl : "unknown.ttf");
		fontName = `${fontName}${
			fontExt &&
			filename &&
			(filename.match(/[^\.\\/:\*"<>|]+?$/) || [])[0] !== fontExt
				? "." + fontExt
				: ""
		}`;
		const font = new Font(fontName);
		font.onload = () => resolve(new Fondue(font));
		font.onerror = (error) => reject(error);
		font.__src = fontUrl;
		font.defineFontFace(font.name, fontName, font.options);
		font.loadFont(fontUrl, fontName);
	});
}
