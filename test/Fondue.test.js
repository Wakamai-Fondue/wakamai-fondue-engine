import loadFondue from "../index";

const otfFont = async () => {
	return await loadFondue(
		"./third_party/font.js/fonts/SourceCodePro-Regular.otf"
	);
};

const ttfFont = async () => {
	return await loadFondue(
		"./third_party/font.js/fonts/SourceCodePro-Regular.ttf"
	);
};

const variableFont = async () => {
	return await loadFondue(
		"./third_party/font.js/fonts/SourceCodeVariable-Roman.ttf"
	);
};

const colorFont = async () => {
	return await loadFondue("./test/fixtures/ss-emoji/ss-emoji-microsoft.ttf");
};

describe("The loaded font", () => {
	test("is loaded succesfully.", async () => {
		const fondue = await loadFondue(
			"./third_party/font.js/fonts/SourceCodeVariable-Roman.ttf"
		);
		expect(fondue._font).toBeDefined();
	});

	test("throws an error when it doesn't exist.", async () => {
		await expect(() => loadFondue("./fonts/foo.ttf")).rejects.toThrow(
			"ENOENT: no such file or directory, open './fonts/foo.ttf'"
		);
	});

	test("returns data from the name table.", async () => {
		const fondue = await loadFondue(
			"./third_party/font.js/fonts/SourceCodeVariable-Roman.ttf"
		);
		expect(fondue.name(1)).toContain("Source Code Variable");
	});

	test("returns empty data from an empty name table.", async () => {
		const fondue = await loadFondue(
			"./third_party/font.js/fonts/SourceCodeVariable-Roman.ttf"
		);
		const subfamily = fondue.name("sample");
		expect(subfamily).toContain("");
	});

	test("returns CSS information.", async () => {
		const fondue = await loadFondue(
			"./third_party/font.js/fonts/SourceCodeVariable-Roman.ttf"
		);
		expect(fondue.cssString).toContain(
			'font-variation-settings: "wght" 900;'
		);
	});

	test("without variations should return CSS information.", async () => {
		const fondue = await loadFondue(
			"./third_party/font.js/fonts/SourceCodePro-Regular.otf"
		);
		expect(fondue.cssString).toContain(
			"font-feature-settings: var(--source-code-pro-case)"
		);
	});
});

describe("format", () => {
	test("OTF font", async () => {
		const fondue = await otfFont();
		expect(fondue.format).toBe("OpenType/CFF");
	});

	test("TTF font", async () => {
		const fondue = await ttfFont();
		expect(fondue.format).toBe("TrueType");
	});
});

describe("isVariable", () => {
	test("variable font", async () => {
		const fondue = await variableFont();
		expect(fondue.isVariable).toBe(true);
	});

	test("nonvariable font", async () => {
		const fondue = await ttfFont();
		expect(fondue.isVariable).toBe(false);
	});
});

describe("isColor", () => {
	test("color font", async () => {
		const fondue = await colorFont();
		expect(fondue.isColor).toBe(true);
	});

	test("non color font", async () => {
		const fondue = await ttfFont();
		expect(fondue.isColor).toBe(false);
	});
});
