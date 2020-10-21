import loadFondue from "../index";

const otfFont = async () => {
	return await loadFondue(
		"./third_party/font.js/fonts/SourceCodePro-Regular.otf"
	);
};

const WFTestFont = async () => {
	return await loadFondue("./test/fixtures/WFTestFont/WFTestFont.ttf");
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
		const fondue = await WFTestFont();
		expect(fondue.format).toBe("TrueType");
	});
});

describe("isVariable", () => {
	test("variable font", async () => {
		const fondue = await variableFont();
		expect(fondue.isVariable).toBe(true);
	});

	test("nonvariable font", async () => {
		const fondue = await WFTestFont();
		expect(fondue.isVariable).toBe(false);
	});
});

describe("isColor", () => {
	test("color font", async () => {
		const fondue = await colorFont();
		expect(fondue.isColor).toBe(true);
	});

	test("non color font", async () => {
		const fondue = await WFTestFont();
		expect(fondue.isColor).toBe(false);
	});
});

describe("hasColorTable", () => {
	test("color font", async () => {
		const fondue = await colorFont();
		expect(fondue.colorFormats).toContain("COLR");
	});

	test("non color font", async () => {
		const fondue = await WFTestFont();
		expect(fondue.colorFormats).toStrictEqual([]);
	});
});

describe("hasColorPaletteTable", () => {
	test("CPAL entries", async () => {
		const fondue = await colorFont();
		expect(fondue.colorPalettes).toEqual([
			[
				"#34343fff",
				"#fcc200ff",
				"#e541414d",
				"#ffffffff",
				"#9f4f00ff",
				"#592700ff",
				"#e54141ff",
				"#69b2ccff",
			],
		]);
	});

	test("non color font", async () => {
		const fondue = await WFTestFont();
		expect(fondue.colorPalettes).toStrictEqual([]);
	});
});

describe("hasAxes", () => {
	test("variable font axes", async () => {
		const fondue = await variableFont();
		expect(fondue.variable.axes).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: "wght",
				}),
			])
		);
	});

	test("variable font instances", async () => {
		const fondue = await variableFont();
		expect(fondue.variable.instances).toEqual(
			expect.objectContaining({
				ExtraLight: { wght: 200 },
			})
		);
	});

	test("nonvariable font", async () => {
		const fondue = await WFTestFont();
		expect(fondue.variable).toBeUndefined();
	});
});

describe("hasFeatures", () => {
	test("has layout features", async () => {
		const fondue = await variableFont();
		expect(fondue.features.find((f) => f.tag == "ccmp")).toBeDefined();
	});

	test("has no layout features", async () => {
		const fondue = await WFTestFont();
		expect(fondue.features).toEqual([]);
	});
});

describe("supportedCharacters", () => {
	test("returns characters of best cmap", async () => {
		const fondue = await WFTestFont();
		expect(fondue.supportedCharacters).toEqual(
			expect.arrayContaining(["41"]) // 0x41 = letter Z
		);
	});

	test("does not return non-unicode char", async () => {
		const fondue = await WFTestFont();
		expect(fondue.supportedCharacters).not.toEqual(
			expect.arrayContaining(["ffff"]) // 0x41 = letter Z
		);
	});
});

describe("supportedLanguages", () => {
	test("returns supported languages", async () => {
		const fondue = await variableFont();
		expect(fondue.languageSystems).toEqual(
			expect.arrayContaining([
				{ ot: "ATH", html: "ath", name: "Athapascan" },
			])
		);
	});
});

describe("nameTable", () => {
	test("return sample text", async () => {
		const fondue = await WFTestFont();
		expect(fondue.customText).toContain("Wakamai Fondue rules!");
	});
});

test("null bytes are omitted", async () => {
	const fondue = await WFTestFont();

	for (const prop in fondue.summary) {
		const value = fondue.summary[prop];
		const nullBytes = value.split("").filter((c) => c == "\u0000");

		expect(nullBytes.length).toBe(0);
	}
});

describe("Language support", () => {
	test("supports no languages", async () => {
		const fondue = await WFTestFont();
		expect(fondue.languageSupport).toStrictEqual([]);
	});

	// This test can't currently work because of a bug in Font.js
	// It's commented out so you know I didn't forgot, and should
	// be restored to working order once FOnt.js properly reports
	// on supported characters for its test fonts
	// test("supports various languages", async () => {
	// 	const fondue = await variableFont();
	// 	expect(fondue.languageSupport).toStrictEqual(["somelanguage"]);
	// });
});
