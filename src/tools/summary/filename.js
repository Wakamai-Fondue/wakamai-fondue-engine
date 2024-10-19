export default function getFilename(fondue) {
	return (
		(fondue._font.name &&
			fondue._font.name.indexOf("data:") !== 0 &&
			(fondue._font.name.match(/[^\\/:*"<>|]+?$/) || [])[0]) ||
		""
	);
}
