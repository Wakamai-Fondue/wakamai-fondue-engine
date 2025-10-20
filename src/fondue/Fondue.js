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
import glyphData from "../tools/GlyphData.json" with { type: "json" };
import {
	createGlyphToCharMapper,
	charactersFromGlyphs,
	createType6Summary,
} from "./utils/lookup-utils.js";
import {
	parseLookupType1,
	parseLookupType3,
	parseLookupType4,
	parseLookupType6,
} from "./utils/lookup-parsers/index.js";
import {
	isVariable,
	isColor,
	hasFeatures,
	hasLanguages,
	hasOpticalSize,
	isHinted,
	getCharCount,
	getGlyphCount,
} from "./utils/font-properties.js";
import {
	COLOR_TABLES,
	CMAP_PREFERENCES,
	LANGUAGE_SUPPORT_IGNORE_LIST,
	UNICODE_CATEGORIES,
	LOOKUP_TYPE_NAMES,
} from "./utils/font-data.js";

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
		this._supportedCharactersCache = null;
		this._unicodeRangeCache = null;
		this._featuresCache = null;
	}

	get isVariable() {
		return isVariable(this._font);
	}

	get isColor() {
		return isColor(this._font);
	}

	get hasFeatures() {
		return hasFeatures(this._font);
	}

	get hasLanguages() {
		return hasLanguages(this._font);
	}

	get hasOpticalSize() {
		return hasOpticalSize(this._font);
	}

	get isHinted() {
		return isHinted(this._font);
	}

	get charCount() {
		return getCharCount(this._font);
	}

	get glyphCount() {
		return getGlyphCount(this._font);
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
	// Usage:
	//   fondue.features
	get features() {
		if (this._featuresCache !== null) {
			return this._featuresCache;
		}

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

		const getFeatureUIName = (featureTag) => {
			const gsub = this._raw("GSUB");
			if (!gsub) return null;
			const feature = gsub.getFeature(featureTag);
			if (feature && feature.featureParams && feature.featureParams > 0) {
				const params = feature.getFeatureParams();
				if (params && params.UINameID) {
					const uiName = this.name(params.UINameID);
					if (uiName) {
						return this._removeNullBytes(uiName);
					}
				}
			}

			return null;
		};

		const rawFeatures = new Set([
			...getRawFeatures(this._raw("GSUB")),
			...getRawFeatures(this._raw("GPOS")),
		]);

		const result = [...rawFeatures].reduce((features, rawFeature) => {
			const featureIndex = getFeatureIndex(rawFeature);
			const feature = {
				...featureMapping.find((f) => f.tag == featureIndex),
			};
			if (feature) {
				// Restore original tag in case of enumerated tag (ss## or cv##)
				feature.tag = rawFeature;

				// See if there's a human readable name
				const uiName = getFeatureUIName(rawFeature);
				if (uiName) {
					feature.uiName = uiName;
				}

				features.push(feature);
			}
			return features;
		}, []);

		this._featuresCache = result;
		return this._featuresCache;
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
		const tables = this._font.opentype.directory.map((d) => d.tag.trim());
		return tables.filter((table) => COLOR_TABLES.includes(table));
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
		if (this._supportedCharactersCache !== null) {
			return this._supportedCharactersCache;
		}
		const chars = new Set();
		const cmap = this.getBestCmap();
		if (cmap) {
			for (const chunk of cmap) {
				for (let i = chunk.start; i <= chunk.end; i++) {
					// Skip 0xFFFF, lib-font currently reports this
					// as a supported character
					// https://github.com/Pomax/lib-font/issues/68
					if (i == 65535) continue;
					chars.add(this._toUnicodeValue(i));
				}
			}
		}
		this._supportedCharactersCache = Array.from(chars);
		return this._supportedCharactersCache;
	}

	// Returns an array of all supported Unicode characters
	// from the "best" cmap as Unicode ranges.
	get unicodeRange() {
		if (this._unicodeRangeCache !== null) {
			return this._unicodeRangeCache;
		}
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
		this._unicodeRangeCache = ranges;
		return this._unicodeRangeCache;
	}

	// Return the "best" unicode cmap dictionary available in the font,
	// or false, if no unicode cmap subtable is available.
	// Implementation of the awesome FontTools getBestCmap function.
	getBestCmap() {
		for (const [platformID, platEncID] of CMAP_PREFERENCES) {
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

		ignoreList = LANGUAGE_SUPPORT_IGNORE_LIST;

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

		const categories = UNICODE_CATEGORIES;

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
		const uncategorisedChars = fontCharSet.filter(
			(g) => !allScriptChars.includes(g)
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

		const lookupTypes = LOOKUP_TYPE_NAMES;

		if (!GSUB) return {};

		const charFor = createGlyphToCharMapper(cmap);

		// Lookup table for parser functions
		const LOOKUP_PARSERS = {
			1: parseLookupType1,
			3: parseLookupType3,
			4: parseLookupType4,
			6: parseLookupType6,
		};

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

			const parser = LOOKUP_PARSERS[lookup.lookupType];
			if (parser) {
				const parsedData = parser(
					lookup,
					charFor,
					charactersFromGlyphs
				);

				// Add the lookup results
				Object.assign(parsedLookup, parsedData);
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
					if (!feature || !feature.lookupListIndices) {
						console.error(
							`Couldn't handle feature ${(script, lang)}`
						);
						return;
					}
					const lookupIDs = feature.lookupListIndices;
					allGlyphs[script][lang][feature.featureTag] = {};
					allGlyphs[script][lang][feature.featureTag]["lookups"] = [];

					lookupIDs.forEach((id) => {
						const lookup = GSUB.getLookup(id);
						const parsedLookup = parseLookup(lookup);
						const randomize = false;
						const uniqueOnly = true;

						if (parsedLookup) {
							allGlyphs[script][lang][feature.featureTag][
								"lookups"
							].push(parsedLookup);
						}

						allGlyphs[script][lang][feature.featureTag]["summary"] =
							createType6Summary(
								allGlyphs[script][lang][feature.featureTag],
								randomize,
								uniqueOnly
							);
					});
				});
			});
		});

		return allGlyphs;
	}
}
