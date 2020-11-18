import { fromPath, fromDataBuffer } from "../index";
import { toArrayBuffer } from "./support/utils";

import fs from "fs";
const readFile = fs.promises.readFile;

const otfFont = async () => {
	return await fromPath(
		"./third_party/font.js/fonts/SourceCodePro/SourceCodePro-Regular.otf"
	);
};

const WFTestFont = async () => {
	return await fromPath("./test/fixtures/WFTestFont/WFTestFont.ttf");
};

const variableFont = async () => {
	return await fromPath(
		"./third_party/font.js/fonts/SourceCodePro/SourceCodeVariable-Roman.ttf"
	);
};

const colorFont = async () => {
	return await fromPath("./test/fixtures/ss-emoji/ss-emoji-microsoft.ttf");
};

const complexFont = async () => {
	return await fromPath("./third_party/font.js/fonts/AthenaRuby_b018.ttf");
};

const xxx = async () => {
	return await fromPath(
		"./third_party/font.js/fonts/OpenSans/OpenSans-Regular.ttf"
	);
};

describe("The loaded font", () => {
	test("is loaded succesfully.", async () => {
		const fondue = await fromPath(
			"./third_party/font.js/fonts/SourceCodePro/SourceCodeVariable-Roman.ttf"
		);
		expect(fondue._font).toBeDefined();
	});

	test("throws an error when it doesn't exist.", async () => {
		await expect(() => fromPath("./fonts/foo.ttf")).rejects.toEqual(
			"ENOENT: no such file or directory, open './fonts/foo.ttf'"
		);
	});

	test("returns data from the name table.", async () => {
		const fondue = await fromPath(
			"./third_party/font.js/fonts/SourceCodePro/SourceCodeVariable-Roman.ttf"
		);
		expect(fondue.name(1)).toContain("Source Code Variable");
	});

	test("returns empty data from an empty name table.", async () => {
		const fondue = await fromPath(
			"./third_party/font.js/fonts/SourceCodePro/SourceCodeVariable-Roman.ttf"
		);
		const subfamily = fondue.name("sample");
		expect(subfamily).toContain("");
	});

	test("returns CSS information.", async () => {
		const fondue = await fromPath(
			"./third_party/font.js/fonts/SourceCodePro/SourceCodeVariable-Roman.ttf"
		);
		expect(fondue.cssString).toContain(
			'font-variation-settings: "wght" 900;'
		);
	});

	test("without variations should return CSS information.", async () => {
		const fondue = await fromPath(
			"./third_party/font.js/fonts/SourceCodePro/SourceCodePro-Regular.otf"
		);
		expect(fondue.cssString).toContain(
			"font-feature-settings: var(--source-code-pro-case)"
		);
	});

	test("supports WOFF", async () => {
		const fondue = await fromPath(
			"./third_party/font.js/fonts/SourceCodePro/SourceCodePro-Regular.ttf.woff"
		);

		/* Need to access an actual table here, because gzip decoding happens lazily */
		expect(fondue._font.opentype.tables.cmap).toBeDefined();
	});

	test("supports WOFF2", async () => {
		const fondue = await fromPath(
			"./third_party/font.js/fonts/SourceCodePro/SourceCodePro-Regular.ttf.woff2"
		);

		expect(fondue).toBeDefined();
	});
});

describe("fromDataBuffer", () => {
	it("loads a font from an ArrayBuffer", async () => {
		const buf = await readFile(
			"./third_party/font.js/fonts/SourceCodePro/SourceCodeVariable-Roman.ttf"
		);
		const arrayBuf = toArrayBuffer(buf);

		const fondue = await fromDataBuffer(
			arrayBuf,
			"SourceCodeVariable-Roman.ttf"
		);
		expect(fondue._font).toBeDefined();
		expect(fondue._font.opentype).toBeDefined();
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
	test("supports various languages", async () => {
		const fondue = await variableFont();
		expect(fondue.languageSupport).toEqual(
			expect.arrayContaining(["English", "Dutch"])
		);
	});
});

describe("Detect charset support", () => {
	test("Detect latin uppercase letters", async () => {
		const fondue = await WFTestFont();

		expect(fondue.categorisedCharacters).toEqual([
			{
				category: "Letter",
				chars: ["0041"],
				script: "latin",
				subCategory: "Uppercase",
			},
		]);
	});

	test("Detect uncategorised chars", async () => {
		const fondue = await otfFont();

		expect(fondue.categorisedCharacters).toEqual(
			expect.arrayContaining([
				{
					category: "Uncategorised",
					chars: [
						"E0A0",
						"E0A1",
						"E0A2",
						"E0B0",
						"E0B1",
						"E0B2",
						"E0B3",
					],
					script: null,
					subCategory: null,
				},
			])
		);
	});
});

describe("Layout features", () => {
	test("returns lookup 1 layout features", async () => {
		const fondue = await otfFont();

		expect(fondue.featureChars["DFLT"]["dflt"]).toEqual(
			expect.objectContaining({
				onum: {
					type: 1,
					input: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
					alternateCount: [],
				},
			})
		);
	});

	test("returns lookup 3 layout features", async () => {
		const fondue = await complexFont();

		expect(fondue.featureChars["DFLT"]["dflt"]).toEqual(
			expect.objectContaining({
				cv01: {
					type: 3,
					input: ["Α"], // Note this is U+0391 : GREEK CAPITAL LETTER ALPHA
					alternateCount: [27],
				},
			})
		);
	});

	test("returns lookup 4 layout features", async () => {
		const fondue = await xxx();

		expect(fondue.featureChars["latn"]["dflt"]).toEqual(
			expect.objectContaining({
				liga: {
					alternateCount: [],
					input: ["ffl", "ffi", "ff", "fl", "fi"],
					type: 4,
				},
			})
		);
	});

	test("has no GSUB layout features", async () => {
		const fondue = await WFTestFont();

		expect(fondue.featureChars).toEqual({});
	});
});
