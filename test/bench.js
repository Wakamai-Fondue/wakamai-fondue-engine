const loadFondue = require("../lib");

const loadFont = () =>
	loadFondue("./third_party/font.js/fonts/SourceCodePro-Regular.otf");

const bench = (name, fn) => {
	const start = process.hrtime();
	fn();
	const diff = process.hrtime(start);

	console.info("%s → %dms", name, diff[0] * 1000 + diff[1] / 1000000);
};

/* Benchmarks the operation on fondue, excluding loading Fondue itself */
const benchFondue = async (name, fn) => {
	const fondue = await loadFont();
	bench(name, () => fn(fondue));
};

const getGetters = (obj) => {
	const prototype = Object.getPrototypeOf(obj);
	const properties = Object.getOwnPropertyDescriptors(prototype);

	return Object.keys(properties)
		.map((p) => properties[p])
		.filter((p) => p.get);
};

async function benchGetters() {
	const fondue = await loadFont();

	getGetters(fondue).forEach((getter) => {
		benchFondue(getter.get.name, (fondue) => getter.get.call(fondue));
	});
}

benchGetters();

benchFondue("get('GSUB')", (fondue) => fondue.get("GSUB"));
benchFondue("get()", (fondue) => fondue.get());
