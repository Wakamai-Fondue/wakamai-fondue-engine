export default function getFormat(fondue) {
	const formats = {
		wOF2: "WOFF2",
		wOFF: "WOFF",
	};
	let sig =
		fondue._font.opentype &&
		fondue._font.opentype.signature &&
		(formats[fondue._font.opentype.signature] ||
			fondue._font.opentype.signature);
	sig =
		sig ||
		(
			((fondue._font.name.indexOf("data:") !== 0 &&
				fondue._font.name.match(/[^.\\/:*"<>|]+?$/)) ||
				[])[0] || ""
		).toUpperCase();
	return sig;
}
