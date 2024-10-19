/*
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { NAME_TABLE, NAME_RECORD, CMAP_RECORD } from "../tools/variables.js";
import getCSS, { getCSSAsJSON } from "../tools/css/get-css.js";
import slugify from "../tools/css/slugify.js";
import featureMapping from "../tools/features/layout-features.js";
import languageMapping from "../tools/ot-to-html-lang.js";
import languageCharSets from "../tools/languageCharSets.js";
import getFormat from "../tools/summary/format.js";
import getFileSize from "../tools/summary/file-size.js";
import getFilename from "../tools/summary/filename.js";
import glyphData from "../tools/GlyphData.json";

export default class Fondue {
	_removeNullBytes(value) {
		// Currently lib-font returns null bytes in name table
		// strings, we filter them here.
		// https://github.com/Pomax/lib-font/issues/74
		/* eslint-disable no-control-regex */
		return value.replace(/\x00/g, "");
	}

	_toUnicodeValue(value) {
		// Return neatly formatted Unicode value for a character
		return value.toString(16).padStart(4, "0").toUpperCase();
	}

	constructor(font) {
		this._font = font;
	}

	get outlines() {
		let outlines = [];
		if (this._font.opentype.tables.CFF) {
			outlines.push("OpenType CFF");
		}
		if (this._font.opentype.tables.CFF2) {
			outlines.push("OpenType CFF2");
		}
		if (this._font.opentype.tables.glyf) {
			outlines.push("TrueType glyf");
		}
		return outlines;
	}

	get isVariable() {
		return this._font.opentype.tables.fvar != undefined;
	}

	get isColor() {
		return this.colorFormats.length > 0;
	}

	get hasFeatures() {
		return this.features.length > 0;
	}

	get hasLanguages() {
		return this.languageSystems.length > 0;
	}

	get hasOpticalSize() {
		return (
			this.isVariable &&
			this.variable.axes.find((o) => o.id === "opsz") !== undefined
		);
	}

	get isHinted() {
		// Ideally we should (also) check for hinting data to be present
		// for individual glyphs. For now the presence of these "helper
		// tables" is a good enough indication of a hinted font.
		const hintingTables = ["cvt", "cvar", "fpgm", "hdmx", "VDMX"];
		for (const hintingTable of hintingTables) {
			if (hintingTable in this._font.opentype.tables) {
				return true;
			}
		}
		// Some (Google) fonts contain a simple `prep` table, which seems
		// to be an artifact of a build/verification process.
		// This is considered a false positive, so we're ignoring `prep`
		// tables with this specific content.
		// Also see https://github.com/googlefonts/fontbakery/issues/3076
		const simplePrep = [184, 1, 255, 133, 176, 4, 141].toString();
		if (
			"prep" in this._font.opentype.tables &&
			this._font.opentype.tables.prep.instructions.toString() !==
				simplePrep
		) {
			return true;
		}
		return false;
	}

	get charCount() {
		return this.supportedCharacters.length;
	}

	get glyphCount() {
		return this._font.opentype.tables.maxp.numGlyphs;
	}

	// Return an object of all language systems supported by
	// either GSUB or GPOS. Tags are stripped ("ROM " → "ROM").
	get languageSystems() {
		const getLangs = (table) => {
			if (table) {
				return table
					.getSupportedScripts()
					.reduce((acc, script) => {
						const scriptTable = table.getScriptTable(script);
						return acc.concat(
							table.getSupportedLangSys(scriptTable)
						);
					}, [])
					.map((lang) => lang.trim());
			} else {
				return [];
			}
		};

		const gsubLangs = getLangs(this._font.opentype.tables.GSUB);
		const gposLangs = getLangs(this._font.opentype.tables.GPOS);
		const allLangs = new Set([...gsubLangs, ...gposLangs]);

		const langSys = languageMapping.filter((l) => allLangs.has(l.ot));
		return langSys;
	}

	// Gets all information about a table.
	// Examples:
	//   fondue.get('name') -> gets all relevant information from the name table.
	//   fondue.get() -> gets all relevant information about this font.
	get(tableString) {
		const tableStr = tableString || "";
		let table = undefined;
		if (this._font.opentype.tables) {
			table = this._raw(tableStr);
			if (table) {
				switch (tableStr) {
					case "":
						return {
							summary: this.summary,
							features: this.features,
							color: undefined,
							variable: this.variable,
							tables: this.tables,
							characters: undefined,
							css: this.css,
							cssString: this.cssString,
						};
					case "GPOS":
					case "GSUB": {
						let features = table.featureList.featureRecords.map(
							(record) => record.featureTag
						);
						features = features.filter(
							(feature, index) =>
								features.indexOf(feature) === index
						); // remove doubles
						let scripts = table.scriptList.scriptRecords.map(
							(record) => record.scriptTag
						);
						scripts = scripts.filter(
							(script, index) => scripts.indexOf(script) === index
						); // remove doubles
						return {
							features,
							scripts,
						};
					}
					case "cmap": {
						return table.encodingRecords.map((record) => {
							const cmapRecord = CMAP_RECORD[record.platformID];
							if (cmapRecord) {
								const platformId = cmapRecord.id,
									platformName = cmapRecord.name,
									encoding =
										cmapRecord.encoding &&
										cmapRecord.encoding[record.encodingID];
								return {
									platformId,
									platformName,
									encoding,
								};
							}
						});
					}
					case "fvar": {
						const instances = {};
						const axes = table
							.getSupportedAxes()
							.map((axis, index) => {
								const axisRaw = table.getAxis(axis);
								table.instances.map((instance) => {
									const name = this.name(
										instance.subfamilyNameID
									);
									if (!instances[name]) {
										instances[name] = {};
									}
									instances[name][axis] =
										instance.coordinates[index];
								});
								return {
									name: this.name(axisRaw.axisNameID),
									id: axisRaw.tag,
									min: axisRaw.minValue,
									max: axisRaw.maxValue,
									default: axisRaw.defaultValue,
									current: axisRaw.defaultValue,
								};
							});
						return { axes, instances };
					}
					case "name": {
						return table.nameRecords.map((record) => {
							const nameId = record.nameID;
							const platformId =
								NAME_RECORD[record.platformID].id;
							const platformName =
								NAME_RECORD[record.platformID].name;
							let predefined = undefined;
							if (NAME_TABLE[nameId]) {
								predefined = {
									name: NAME_TABLE[nameId].name,
									description: NAME_TABLE[nameId].description,
								};
							}
							const encoding =
								NAME_RECORD[record.platformID].encoding[
									record.encodingID
								];
							const language =
								NAME_RECORD[record.platformID].language[
									record.languageID
								];
							const value = this._removeNullBytes(
								this.name(nameId)
							);
							return {
								id: nameId,
								platformId,
								platformName,
								predefined,
								encoding,
								language,
								value,
							};
						});
					}
					default:
						break;
				}
			}
		}
		return undefined;
	}

	// Gets the raw Font object data from a specific table.
	// Examples:
	//   fondue._raw('fvar') -> gets the Font object table "fvar".
	//   fondue._raw() -> gets the raw Font object.
	_raw(tableString) {
		if (tableString) {
			if (
				this._font.opentype.tables[tableString] &&
				Object.keys(this._font.opentype.tables[tableString]).length
			) {
				return this._font.opentype.tables[tableString];
			}
			return undefined;
		}
		return this._font.opentype.tables;
	}

	// Gets all information about the font tables.
	// Usage:
	//   fondue.tables
	get tables() {
		const tables = Object.keys(this._raw());
		return tables.map((item) => {
			return {
				name: item,
				value: this.get(item),
				_raw: this._raw(item),
			};
		});
	}

	// Gets all information about the font features.
	// TODO: if feature has a UI Name ID, return its name
	//       https://github.com/Pomax/lib-font/issues/73
	// Usage:
	//   fondue.features
	get features() {
		const getRawFeatures = (table) => {
			if (!table) return [];
			return table.featureList.featureRecords.map(
				(record) => record.featureTag
			);
		};

		const getFeatureIndex = (rawFeature) => {
			const featureInitial = rawFeature.substring(0, 2);
			if (featureInitial == "ss" || featureInitial == "cv") {
				return `${featureInitial}##`;
			} else {
				return rawFeature;
			}
		};

		const rawFeatures = new Set([
			...getRawFeatures(this._raw("GSUB")),
			...getRawFeatures(this._raw("GPOS")),
		]);

		return [...rawFeatures].reduce((features, rawFeature) => {
			const featureIndex = getFeatureIndex(rawFeature);
			const feature = {
				...featureMapping.find((f) => f.tag == featureIndex),
			};
			if (feature) {
				// Restore original tag in case of enumerated tag (ss## or cv##)
				feature.tag = rawFeature;
				features.push(feature);
			}
			return features;
		}, []);
	}

	// Gets all information about the font's variable features.
	// Usage:
	//   fondue.variable
	get variable() {
		const fvar = this.get("fvar");
		return fvar;
	}

	// Return all color format tables.
	// Usage:
	//   fondue.colorFormats -> return e.g. ["SVG "] or empty array
	get colorFormats() {
		const colorTables = ["COLR", "sbix", "CBDT", "SVG"];
		const tables = this._font.opentype.directory.map((d) => d.tag.trim());
		return tables.filter((table) => colorTables.includes(table));
	}

	get colorPalettes() {
		const cpal = this._font.opentype.tables.CPAL;
		if (!cpal) return [];

		// Create padded hex value for color string
		const hex = (d) => Number(d).toString(16).padStart(2, "0");

		// CPAL's colorRecords is one large, flat array of colors.
		// We need to chop these up depending on numPaletteEntries
		// (the number of colors per palette) so we can return an
		// array of color-arrays.
		return cpal.colorRecords.reduce((colors, clr, index) => {
			const groupIndex = Math.floor(index / cpal.numPaletteEntries);

			if (!colors[groupIndex]) {
				colors[groupIndex] = [];
			}

			colors[groupIndex].push(
				`#${hex(clr.red)}` +
					`${hex(clr.green)}` +
					`${hex(clr.blue)}` +
					`${hex(clr.alpha)}`
			);

			return colors;
		}, []);
	}

	// Gets all information about the font summary.
	// Usage:
	//   fondue.summary
	get summary() {
		const summary = {};
		summary.Filename = getFilename(this);
		summary.Filesize = getFileSize(this);
		summary.Format = getFormat(this);
		this.get("name").forEach((record) => {
			if (record.value && record.predefined) {
				summary[record.predefined.name] = record.value;
			}
		});
		return summary;
	}

	// Returns a "slug" for the font.
	// Example:
	//   Comic Sans → comic-sans
	get slug() {
		return slugify(this.summary["Font name"]);
	}

	// Gets the parsed CSS as an object, for this font.
	// Usage:
	//   fondue.css
	get css() {
		return getCSSAsJSON(this);
	}

	// Gets the parsed CSS as a string, for this font.
	// Usage:
	//   fondue.cssString
	get cssString() {
		return getCSS(this);
	}

	// Get CSS as string, but with the option to exclude parts
	fontCSS(exclude) {
		return getCSS(this, exclude);
	}

	// Returns whether a specific character is supported by this font.
	// Example:
	//   fondue.supports('A') -> returns whether the character 'A' is supported by this font.
	supports(char) {
		return this._font.supports(char);
	}

	// Returns a name table entry by its nameID.
	// Example:
	//   fondue.name(0) -> returns the copyright notice.
	name(id) {
		const name = this._font.opentype.tables.name;
		if (name) {
			return name.get(id) || "";
		} else {
			return "";
		}
	}

	// Returns an array of all supported Unicode characters
	// from the "best" cmap.
	get supportedCharacters() {
		let chars = [];
		const cmap = this.getBestCmap();
		if (cmap) {
			for (const chunk of cmap) {
				for (let i = chunk.start; i < chunk.end + 1; i++) {
					// Skip 0xFFFF, lib-font currently reports this
					// as a supported character
					// https://github.com/Pomax/lib-font/issues/68
					if (i == 65535) continue;
					chars.push(this._toUnicodeValue(i));
				}
			}
		}
		return chars;
	}

	// Returns an array of all supported Unicode characters
	// from the "best" cmap as Unicode ranges.
	get unicodeRange() {
		let ranges = [],
			rstart,
			rend;
		for (var i = 0; i < this.supportedCharacters.length; i++) {
			rstart = this.supportedCharacters[i];
			rend = rstart;
			while (
				parseInt(this.supportedCharacters[i + 1], 16) -
					parseInt(this.supportedCharacters[i], 16) ==
				1
			) {
				rend = this.supportedCharacters[i + 1]; // increment the index if the numbers sequential
				i++;
			}
			ranges.push(rstart == rend ? `${rstart}` : `${rstart}-${rend}`);
		}

		return ranges;
	}

	// Return the "best" unicode cmap dictionary available in the font,
	// or false, if no unicode cmap subtable is available.
	// Implementation of the awesome FontTools getBestCmap function.
	getBestCmap() {
		const cmapPreferences = [
			[3, 10],
			[0, 6],
			[0, 4],
			[3, 1],
			[0, 3],
			[0, 2],
			[0, 1],
			[0, 0],
		];
		for (const [platformID, platEncID] of cmapPreferences) {
			const cmapSubtable =
				this._font.opentype.tables.cmap.getSupportedCharCodes(
					platformID,
					platEncID
				);
			if (cmapSubtable) {
				return cmapSubtable;
			}
		}
		return null;
	}

	get customText() {
		const text = this._font.opentype.tables.name.get(19);
		return text ? this._removeNullBytes(text) : null;
	}

	// Language support (from old Wakamai Fondue)
	get languageSupport() {
		const fontCharSet = this.supportedCharacters;
		let result = [],
			language,
			chars,
			charCode,
			found,
			i,
			total,
			ignoreList;

		ignoreList = [
			167, // section sign
			8208, // hyphen
			8224, // dagger
			8225, // double dagger
			8242, // prime
			8243, // double prime
			8274, // commercial minus sign
			10216, // mathematical left angle bracket
			10217, // mathematical right angle bracket
		];

		for (language in languageCharSets) {
			chars = languageCharSets[language];
			found = 0;
			total = chars.length;

			for (i = 0; i < total; i++) {
				charCode = this._toUnicodeValue(chars.codePointAt(i));
				if (
					ignoreList.includes(charCode) ||
					fontCharSet.includes(charCode)
				) {
					found += 1;
				}
			}

			// We consider a language supported when *all* of the
			// required characters are present in the font (except
			// those in the ignoreList of course)
			if (found === total) {
				result.push(language);
			}
		}

		return result.sort();
	}

	get categorisedCharacters() {
		const fontCharSet = this.supportedCharacters;

		// undefined = no subcategory
		const categories = {
			Letter: [
				undefined,
				"Uppercase",
				"Lowercase",
				"Superscript",
				"Modifier",
				"Ligature",
				"Halfform",
				"Matra",
				"Spacing",
				"Jamo",
				"Syllable",
				"Number",
			],
			Number: [
				undefined,
				"Decimal Digit",
				"Small",
				"Fraction",
				"Spacing",
				"Letter",
			],
			Punctuation: [
				undefined,
				"Quote",
				"Parenthesis",
				"Dash",
				"Spacing",
				"Modifier",
			],
			Symbol: [
				undefined,
				"Currency",
				"Math",
				"Modifier",
				"Superscript",
				"Format",
				"Ligature",
				"Spacing",
				"Arrow",
				"Geometry",
			],
			Separator: [undefined, "Space", "Format", "Nonspace"],
			Mark: [
				undefined,
				"Modifier",
				"Spacing",
				"Nonspacing",
				"Enclosing",
				"Spacing Combining",
				"Ligature",
			],
			Other: [undefined, "Format"],
		};

		let charset = [];
		let allScriptChars = [];
		for (const category in categories) {
			for (const subCategory of categories[category]) {
				// Get all scripts in this subcategory
				let scripts = new Set();
				const subcatScripts = glyphData.filter(
					(f) =>
						f.category === category && f.subCategory === subCategory
				);
				subcatScripts.map((sc) => {
					scripts.add(sc.script);
				});

				// Loop over each script and see which chars are in the font
				for (const script of scripts) {
					const chars = glyphData.filter(
						(f) =>
							f.category === category &&
							f.subCategory === subCategory &&
							f.script === script
					);

					// Which chars are in the font?
					const presentChars = chars.filter((g) =>
						fontCharSet.includes(g.unicode)
					);

					// We only need the unicode values
					const scriptChars = presentChars.map((g) => g.unicode);
					allScriptChars = [...allScriptChars, ...scriptChars];

					if (scriptChars.length !== 0) {
						const subCharset = {
							category: category,
							subCategory: subCategory || null,
							script: script || null,
							chars: scriptChars || null,
						};

						if (
							charset.find(
								(c) =>
									c.category == subCharset.category &&
									c.subCategory == subCharset.subCategory &&
									c.script == subCharset.script
							) === undefined
						) {
							charset.push(subCharset);
						}
					}
				}
			}
		}

		// List all chars not grouped under scripts in a misc category
		// Also, ignore 0xFFFF which is erroneously reported as a char
		// by Fontkit
		const uncategorisedChars = fontCharSet.filter(
			(g) => !allScriptChars.includes(g) && g != "FFFF"
		);
		if (uncategorisedChars.length !== 0) {
			charset.push({
				category: "Uncategorised",
				subCategory: null,
				script: null,
				chars: uncategorisedChars || null,
			});
		}

		return charset;
	}

	// Return characters per feature
	// Only GSUB for now, TODO: GPOS
	get featureChars() {
		const { cmap, GSUB } = this._font.opentype.tables;

		// Human readable names for lookup types
		const lookupTypes = {
			1: "Single Substitution",
			2: "Multiple Substitution",
			3: "Alternate Substitution",
			4: "Ligature Substitution",
			5: "Contextual Substitution",
			6: "Chained Contexts Substitution",
			7: "Extension Substitution",
			8: "Reverse Chaining Contextual Single Substitution",
		};

		if (!GSUB) return {};

		function letterFor(glyphid) {
			return cmap.reverse(glyphid).unicode;
		}

		// [1,2,3] + [3,4,5] = [1,2,3,4,5]
		function mergeUniqueCoverage(existing, addition) {
			return [...new Set([...(existing || []), ...addition])];
		}

		// Returns glyphs that are mapped directly to characters for
		// this coverage. If a glyph maps to another glyph, it's
		// ignored.
		// If only a specific rangeRecord needs to be processed, e.g.
		// for lookup type 3, you can pass the desired index.
		function charactersFromGlyphs(coverage, index) {
			let results = [];

			if (!coverage.glyphArray) {
				let records;
				if (index >= 0) {
					records = coverage.rangeRecords.filter(
						(_, i) => index !== i
					);
				} else {
					records = coverage.rangeRecords;
				}
				// Glyphs in start/end ranges
				for (const range of records) {
					for (
						let g = range.startGlyphID;
						g < range.endGlyphID + 1;
						g++
					) {
						const char = letterFor(g);
						if (char !== undefined) {
							results.push(char);
						}
					}
				}
			} else {
				// Individual glyphs
				results = coverage.glyphArray
					.filter((g) => letterFor(g) !== undefined)
					.map(letterFor);
			}
			return results;
		}

		function parseLookup(lookup) {
			const parsedLookup = {
				type: lookup.lookupType,
				typeName:
					lookupTypes[lookup.lookupType] || "Unknown lookup type",
				input: [],
				backtrack: [],
				lookahead: [],
				alternateCount: [],
			};

			// Single substitution
			if (lookup.lookupType === 1) {
				lookup.subtableOffsets.forEach((_, i) => {
					const subtable = lookup.getSubTable(i);
					const coverage = subtable.getCoverageTable();
					const results = charactersFromGlyphs(coverage);

					if (results.length > 0) {
						parsedLookup["input"] = results;
					}
				});
			}

			// Alternate substitution
			if (lookup.lookupType === 3) {
				lookup.subtableOffsets.forEach((_, i) => {
					const subtable = lookup.getSubTable(i);
					const coverage = subtable.getCoverageTable();

					// It's possible to have AlternateSets with different lengths
					// inside the same lookup (e.g. 10 alternates for "A", 5 for
					// "B"), so we keep track of the alternateCount per glyph.
					subtable.alternateSetOffsets.forEach((_, j) => {
						parsedLookup["input"] = charactersFromGlyphs(
							coverage,
							j
						);

						const altset = subtable.getAlternateSet(j);
						parsedLookup["alternateCount"].push(
							altset.alternateGlyphIDs.length
						);
					});
				});
			}

			// Ligature substitution
			if (lookup.lookupType === 4) {
				lookup.subtableOffsets.forEach((_, i) => {
					const subtable = lookup.getSubTable(i);
					const coverage = subtable.getCoverageTable();

					if (coverage.glyphArray !== undefined) {
						subtable.ligatureSetOffsets.forEach((_, setIndex) => {
							const ligatureSet =
								subtable.getLigatureSet(setIndex);

							ligatureSet.ligatureOffsets.forEach(
								(_, ligIndex) => {
									const ligatureTable =
										ligatureSet.getLigature(ligIndex);

									const sequence = [
										coverage.glyphArray[setIndex],
										...ligatureTable.componentGlyphIDs,
									].map(letterFor);

									// Only keep sequences with glyphs mapped to letters
									if (!sequence.includes(undefined)) {
										parsedLookup["input"].push(
											sequence.join("")
										);
									}
								}
							);
						});
					}
				});
			}

			// Chained context substitution
			// Note that currently if a ChainContextSubst contains multiple coverages,
			// we merge them all into one and remove duplicates. This is purely to keep
			// a "data dump" less overwhelming, but isn't a perfect treatment of a type
			// 6 lookup, as this can suggest character combinations that aren't
			// possible.
			// Possible future improvement: add the chars as an array to an array of
			// input/backtrack/lookahead, then let a front decide whether to merge
			// them or dump everything as-is.

			// TODO: When a lookup has a lookahead or backtrack with *only* glyphs (so
			// no direct characters), we should ignore this lookup. Otherwise it will
			// result in a lookup that *looks* okay, but isn't.
			// Example: backtrack [a, b, c], input [n], lookahead[x.alt, y.alt, z.alt]
			// Since the lookhead contains no chars, it will be reduced to [], and the
			// lookup with look like this: backtrack [a, b, c], input [n]. This is
			// wrong, as that only the backtrack+input will not result in any changed
			// chars
			if (lookup.lookupType === 6) {
				lookup.subtableOffsets.forEach((_, i) => {
					const subtable = lookup.getSubTable(i);

					let inputChars;
					let backtrackChars;
					let lookaheadChars;

					if (subtable.inputGlyphCount > 0) {
						subtable.inputCoverageOffsets.forEach((offset) => {
							const coverage =
								subtable.getCoverageFromOffset(offset);
							inputChars = charactersFromGlyphs(coverage);
						});
					}

					if (subtable.backtrackGlyphCount > 0) {
						subtable.backtrackCoverageOffsets.forEach((offset) => {
							const coverage =
								subtable.getCoverageFromOffset(offset);
							backtrackChars = charactersFromGlyphs(coverage);
						});
					}

					if (subtable.lookaheadGlyphCount > 0) {
						subtable.lookaheadCoverageOffsets.forEach((offset) => {
							const coverage =
								subtable.getCoverageFromOffset(offset);
							lookaheadChars = charactersFromGlyphs(coverage);
						});
					}

					// Are there glyphs for each sequence?
					const preCheck = [
						subtable.inputGlyphCount > 0,
						subtable.backtrackGlyphCount > 0,
						subtable.lookaheadGlyphCount > 0,
					].join();

					// Are there chars for each sequence?
					const postCheck = [
						inputChars.length > 0,
						backtrackChars !== undefined &&
							backtrackChars.length > 0,
						lookaheadChars !== undefined &&
							lookaheadChars.length > 0,
					].join();

					// Check if we didn't lose a lookup because it contained only glyphs that
					// were replaced in a previous lookup (in other words, didn't contain
					// unicode characters).
					// Example: backtrack [a, b, c], input [n], lookahead[x.alt, y.alt, z.alt]
					if (preCheck === postCheck) {
						parsedLookup["input"][i] = mergeUniqueCoverage(
							parsedLookup["input"][i],
							inputChars
						);

						if (backtrackChars) {
							parsedLookup["backtrack"][i] = mergeUniqueCoverage(
								parsedLookup["backtrack"][i],
								backtrackChars
							);
						}

						if (lookaheadChars) {
							parsedLookup["lookahead"][i] = mergeUniqueCoverage(
								parsedLookup["lookahead"][i],
								lookaheadChars
							);
						}
					}
				});
			}

			// Return lookup if input contains actual characters
			// (It can be empty if it replaces non-unicode glyphs)
			if (parsedLookup["input"].length > 0) {
				return parsedLookup;
			} else {
				return false;
			}
		}

		const scripts = GSUB.getSupportedScripts();
		let allGlyphs = {};

		scripts.forEach((script) => {
			let langsys = GSUB.getSupportedLangSys(script);

			allGlyphs[script] = {};

			langsys.forEach((lang) => {
				let langSysTable = GSUB.getLangSysTable(script, lang);
				let features = GSUB.getFeatures(langSysTable);

				allGlyphs[script][lang] = {};

				features.forEach((feature) => {
					const lookupIDs = feature.lookupListIndices;
					allGlyphs[script][lang][feature.featureTag] = {};
					allGlyphs[script][lang][feature.featureTag]["lookups"] = [];

					lookupIDs.forEach((id) => {
						const lookup = GSUB.getLookup(id);
						const parsedLookup = parseLookup(lookup);

						if (parsedLookup) {
							allGlyphs[script][lang][feature.featureTag][
								"lookups"
							].push(parsedLookup);
						}

						allGlyphs[script][lang][feature.featureTag]["summary"] =
							createType6Summary(
								allGlyphs[script][lang][feature.featureTag],
								true
							);
					});
				});
			});
		});

		return allGlyphs;
	}
}

const createType6Summary = (feature, randomize) => {
	let allInputs = [];
	let allBacktracks = [];
	let allLookaheads = [];

	const limit = 10; // Summary will be limited to a max of limit³ (e.g. 20*20*20 = 8000)

	const shuffleArray = (array) => {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	};

	// Create some kind of "all backtracks" or "all lookaheads"
	for (const lookup of feature["lookups"]) {
		if (lookup.type !== 6) continue;

		// Create all possible combinations of input, backtrack and lookahead
		for (const key in Object.entries(lookup["input"])) {
			allInputs = [...new Set(allInputs.concat(lookup["input"][key]))];

			if (lookup["backtrack"][key]) {
				allBacktracks = [
					...new Set(allBacktracks.concat(lookup["backtrack"][key])),
				];
			}

			if (lookup["lookahead"][key]) {
				allLookaheads = [
					...new Set(allLookaheads.concat(lookup["lookahead"][key])),
				];
			}
		}
	}

	if (randomize) {
		allInputs = shuffleArray(allInputs);

		if (allBacktracks.length) {
			allBacktracks = shuffleArray(allBacktracks);
		}

		if (allLookaheads.length) {
			allLookaheads = shuffleArray(allLookaheads);
		}
	}

	let allCombinations = [allInputs.slice(0, limit)];

	if (allBacktracks.length) {
		allCombinations.unshift(allBacktracks.slice(0, limit));
	}

	if (allLookaheads.length) {
		allCombinations.push(allLookaheads.slice(0, limit));
	}

	let summarizedCombinations = allCombinations
		.reduce((a, b) =>
			a.reduce((r, v) => r.concat(b.map((w) => [].concat(v, w))), [])
		)
		.map((a) => a.join(""));

	return {
		allInputs: allInputs.sort(),
		allBacktracks: allBacktracks.sort(),
		allLookaheads: allLookaheads.sort(),
		summarizedCombinations: summarizedCombinations.sort(),
	};
};
