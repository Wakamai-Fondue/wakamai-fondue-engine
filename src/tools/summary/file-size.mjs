export default function getFileSize(fondue) {
	const bytes = fondue._font.fontData.byteLength;
	return bytes > 1024 * 1024
		? `${Math.floor(bytes / (1024 * 1024))} MB`
		: bytes > 1024
		? `${Math.floor(bytes / 1024)} KB`
		: `${Math.floor(bytes)} B`;
}
