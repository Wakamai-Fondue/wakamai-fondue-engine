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

export const NAME_TABLE = [
	{
		id: 0,
		name: "Copyright notice",
		description: "Copyright notice.",
	},
	{
		id: 1,
		name: "Font family",
		description: "Font family.",
	},
	{
		id: 2,
		name: "Font subfamily",
		description: "Font Subfamily.",
	},
	{
		id: 3,
		name: "Unique font identifier",
		description: "Unique subfamily identification.",
	},
	{
		id: 4,
		name: "Font name",
		description: "Full name of the font.",
	},
	{
		id: 5,
		name: "Version string",
		description: "Version of the name table.",
	},
	{
		id: 6,
		name: "PostScript name",
		description:
			"PostScript name of the font. All PostScript names in a font must be identical. They may not be longer than 63 characters and the characters used are restricted to the set of printable ASCII characters (U+0021 through U+007E), less the ten characters '[', ']', '(', ')', '{', '}', '<', '>', '/', and '%'.",
	},
	{
		id: 7,
		name: "Trademark",
		description: "Trademark notice.",
	},
	{
		id: 8,
		name: "Manufacturer name",
		description: "Manufacturer name.",
	},
	{
		id: 9,
		name: "Designer",
		description: "Designer; name of the designer of the typeface.",
	},
	{
		id: 10,
		name: "Description",
		description:
			"Description; description of the typeface. Can contain revision information, usage recommendations, history, features, and so on.",
	},
	{
		id: 11,
		name: "URL vendor",
		description:
			"URL of the font vendor (with procotol, e.g., http://, ftp://). If a unique serial number is embedded in the URL, it can be used to register the font.",
	},
	{
		id: 12,
		name: "URL designer",
		description:
			"URL of the font designer (with protocol, e.g., http://, ftp://)",
	},
	{
		id: 13,
		name: "License description",
		description:
			"License description; description of how the font may be legally used, or different example scenarios for licensed use. This field should be written in plain language, not legalese.",
	},
	{
		id: 14,
		name: "URL license info",
		description:
			"License information URL, where additional licensing information can be found.",
	},
	{
		id: 15,
		name: "Reserved",
		description: "Reserved.",
	},
	{
		id: 16,
		name: "Typographic family name",
		description:
			"Preferred Family. In Windows, the Family name is displayed in the font menu, and the Subfamily name is presented as the Style name. For historical reasons, font families have contained a maximum of four styles, but font designers may group more than four fonts to a single family. The Preferred Family and Preferred Subfamily IDs allow font designers to include the preferred family/subfamily groupings. These IDs are only present if they are different from IDs 1 and 2.",
	},
	{
		id: 17,
		name: "Typographic subfamily name",
		description:
			"Preferred Subfamily. In Windows, the Family name is displayed in the font menu, and the Subfamily name is presented as the Style name. For historical reasons, font families have contained a maximum of four styles, but font designers may group more than four fonts to a single family. The Preferred Family and Preferred Subfamily IDs allow font designers to include the preferred family/subfamily groupings. These IDs are only present if they are different from IDs 1 and 2.",
	},
	{
		id: 18,
		name: "Compatible full",
		description:
			"Compatible Full (Macintosh only). In QuickDraw, the menu name for a font is constructed using the FOND resource. This usually matches the Full Name. If you want the name of the font to appear differently than the Full Name, you can insert the Compatible Full Name in ID 18. This name is not used by OS X itself, but may be used by application developers (e.g., Adobe).",
	},
	{
		id: 19,
		name: "Sample text",
		description:
			"Sample text. This can be the font name, or any other text that the designer thinks is the best sample text to show what the font looks like.",
	},
	{
		id: 20,
		name: "PostScript CID findfont name",
		description:
			"Its presence in a font means that the nameID 6 holds a PostScript font name that is meant to be used with the “composefont” invocation in order to invoke the font in a PostScript interpreter.",
	},
	{
		id: 21,
		name: "WWS family name",
		description:
			"Used to provide a WWS-conformant family name in case the entries for IDs 16 and 17 do not conform to the WWS model.",
	},
	{
		id: 22,
		name: "WWS subfamily name",
		description:
			"Used in conjunction with ID 21, this ID provides a WWS-conformant subfamily name (reflecting only weight, width and slope attributes) in case the entries for IDs 16 and 17 do not conform to the WWS model.",
	},
	{
		id: 23,
		name: "Light background palette",
		description:
			"This ID, if used in the CPAL table’s Palette Labels Array, specifies that the corresponding color palette in the CPAL table is appropriate to use with the font when displaying it on a light background such as white. Strings for this ID are for use as user interface strings associated with this palette.",
	},
	{
		id: 24,
		name: "Dark background palette",
		description:
			"This ID, if used in the CPAL table’s Palette Labels Array, specifies that the corresponding color palette in the CPAL table is appropriate to use with the font when displaying it on a dark background such as black. Strings for this ID are for use as user interface strings associated with this palette.",
	},
	{
		id: 25,
		name: "Variations PostScript name prefix",
		description:
			" If present in a variable font, it may be used as the family prefix in the PostScript Name Generation for Variation Fonts algorithm. The character set is restricted to ASCII-range uppercase Latin letters, lowercase Latin letters, and digits. All name strings for name ID 25 within a font, when converted to ASCII, must be identical.",
	},
];

export const NAME_RECORD = [
	{
		id: 0,
		name: "Unicode",
		encoding: [
			{
				id: 0,
				name: "Unicode 1.0 schematics",
			},
			{
				id: 1,
				name: "Unicode 1.1 schematics",
			},
			{
				id: 2,
				name: "ISO/IEC 10646 semantics",
			},
			{
				id: 3,
				name: "Unicode 2.0 and onwards semantics, Unicode BMP only",
			},
			{
				id: 4,
				name: "Unicode 2.0 and onwards semantics, Unicode full repertoire",
			},
			{
				id: 5,
				name: "Unicode Variation Sequences",
			},
			{
				id: 6,
				name: "Unicode full repertoire",
			},
		],
		language: [],
	},
	{
		id: 1,
		name: "Macintosh",
		encoding: [
			{
				id: 0,
				name: "Roman",
			},
			{
				id: 1,
				name: "Japanese",
			},
			{
				id: 2,
				name: "Chinese",
			},
			{
				id: 3,
				name: "Korean",
			},
			{
				id: 4,
				name: "Arabic",
			},
			{
				id: 5,
				name: "Hebrew",
			},
			{
				id: 6,
				name: "Greek",
			},
			{
				id: 7,
				name: "Russian",
			},
			{
				id: 8,
				name: "RSymbol",
			},
			{
				id: 9,
				name: "Devanagari",
			},
			{
				id: 10,
				name: "Gurmukhi",
			},
			{
				id: 11,
				name: "Gujarati",
			},
			{
				id: 12,
				name: "Oriya",
			},
			{
				id: 13,
				name: "Bengali",
			},
			{
				id: 14,
				name: "Tamil",
			},
			{
				id: 15,
				name: "Telugu",
			},
			{
				id: 17,
				name: "Malayalam",
			},
			{
				id: 18,
				name: "Sinhalese (Traditional)",
			},
			{
				id: 19,
				name: "Burmese",
			},
			{
				id: 20,
				name: "Khmer",
			},
			{
				id: 21,
				name: "Thai",
			},
			{
				id: 22,
				name: "Laotian",
			},
			{
				id: 23,
				name: "Georgian",
			},
			{
				id: 24,
				name: "Armenian",
			},
			{
				id: 25,
				name: "Chinese (Simplified)",
			},
			{
				id: 26,
				name: "Tibetan",
			},
			{
				id: 27,
				name: "Mongolian",
			},
			{
				id: 28,
				name: "Geez",
			},
			{
				id: 29,
				name: "Slavic",
			},
			{
				id: 30,
				name: "Vietnamese",
			},
			{
				id: 31,
				name: "Sindhi",
			},
			{
				id: 32,
				name: "Uninterpreted",
			},
			{
				id: 16,
				name: "Kannada",
			},
		],
		language: [
			{
				id: 0,
				name: "English",
			},
			{
				id: 1,
				name: "French",
			},
			{
				id: 2,
				name: "German",
			},
			{
				id: 3,
				name: "Italian",
			},
			{
				id: 4,
				name: "Dutch",
			},
			{
				id: 5,
				name: "Swedish",
			},
			{
				id: 6,
				name: "Spanish",
			},
			{
				id: 7,
				name: "Danish",
			},
			{
				id: 8,
				name: "Portuguese",
			},
			{
				id: 9,
				name: "Norwegian",
			},
			{
				id: 10,
				name: "Hebrew",
			},
			{
				id: 11,
				name: "Japanese",
			},
			{
				id: 12,
				name: "Arabic",
			},
			{
				id: 13,
				name: "Finnish",
			},
			{
				id: 14,
				name: "Greek",
			},
			{
				id: 15,
				name: "Icelandic",
			},
			{
				id: 16,
				name: "Maltese",
			},
			{
				id: 17,
				name: "Turkish",
			},
			{
				id: 18,
				name: "Croatian",
			},
			{
				id: 19,
				name: "Chinese (Traditional)",
			},
			{
				id: 20,
				name: "Urdu",
			},
			{
				id: 21,
				name: "Hindi",
			},
			{
				id: 22,
				name: "Thai",
			},
			{
				id: 23,
				name: "Korean",
			},
			{
				id: 24,
				name: "Lithuanian",
			},
			{
				id: 25,
				name: "Polish",
			},
			{
				id: 26,
				name: "Hungarian",
			},
			{
				id: 27,
				name: "Estonian",
			},
			{
				id: 28,
				name: "Latvian",
			},
			{
				id: 29,
				name: "Sami",
			},
			{
				id: 30,
				name: "Faroese",
			},
			{
				id: 31,
				name: "Farsi/Persian",
			},
			{
				id: 32,
				name: "Russian",
			},
			{
				id: 33,
				name: "Chinese (Simplified)",
			},
			{
				id: 34,
				name: "Flemish",
			},
			{
				id: 35,
				name: "Irish Gaelic",
			},
			{
				id: 36,
				name: "Albanian",
			},
			{
				id: 37,
				name: "Romanian",
			},
			{
				id: 38,
				name: "Czech",
			},
			{
				id: 39,
				name: "Slovak",
			},
			{
				id: 40,
				name: "Slovenian",
			},
			{
				id: 41,
				name: "Yiddish",
			},
			{
				id: 42,
				name: "Serbian",
			},
			{
				id: 43,
				name: "Macedonian",
			},
			{
				id: 44,
				name: "Bulgarian",
			},
			{
				id: 45,
				name: "Ukrainian",
			},
			{
				id: 46,
				name: "Byelorussian",
			},
			{
				id: 47,
				name: "Uzbek",
			},
			{
				id: 48,
				name: "Kazakh",
			},
			{
				id: 49,
				name: "Azerbaijani (Cyrillic script)",
			},
			{
				id: 50,
				name: "Azerbaijani (Arabic script)",
			},
			{
				id: 51,
				name: "Armenian",
			},
			{
				id: 52,
				name: "Georgian",
			},
			{
				id: 53,
				name: "Moldavian",
			},
			{
				id: 54,
				name: "Kirghiz",
			},
			{
				id: 55,
				name: "Tajiki",
			},
			{
				id: 56,
				name: "Turkmen",
			},
			{
				id: 57,
				name: "Mongolian (Mongolian script)",
			},
			{
				id: 58,
				name: "Mongolian (Cyrillic script)",
			},
			{
				id: 59,
				name: "Pashto",
			},
			{
				id: 60,
				name: "Kurdish",
			},
			{
				id: 61,
				name: "Kashmiri",
			},
			{
				id: 62,
				name: "Sindhi",
			},
			{
				id: 63,
				name: "Tibetan",
			},
			{
				id: 64,
				name: "Nepali",
			},
			{
				id: 65,
				name: "Sanskrit",
			},
			{
				id: 66,
				name: "Marathi",
			},
			{
				id: 67,
				name: "Bengali",
			},
			{
				id: 68,
				name: "Assamese",
			},
			{
				id: 69,
				name: "Gujarati",
			},
			{
				id: 70,
				name: "Punjabi",
			},
			{
				id: 71,
				name: "Oriya",
			},
			{
				id: 72,
				name: "Malayalam",
			},
			{
				id: 73,
				name: "Kannada",
			},
			{
				id: 74,
				name: "Tamil",
			},
			{
				id: 75,
				name: "Telugu",
			},
			{
				id: 76,
				name: "Sinhalese",
			},
			{
				id: 77,
				name: "Burmese",
			},
			{
				id: 78,
				name: "Khmer",
			},
			{
				id: 79,
				name: "Lao",
			},
			{
				id: 80,
				name: "Vietnamese",
			},
			{
				id: 81,
				name: "Indonesian",
			},
			{
				id: 82,
				name: "Tagalog",
			},
			{
				id: 83,
				name: "Malay (Roman script)",
			},
			{
				id: 84,
				name: "Malay (Arabic script)",
			},
			{
				id: 85,
				name: "Amharic",
			},
			{
				id: 86,
				name: "Tigrinya",
			},
			{
				id: 87,
				name: "Galla",
			},
			{
				id: 88,
				name: "Somali",
			},
			{
				id: 89,
				name: "Swahili",
			},
			{
				id: 90,
				name: "Kinyarwanda/Ruanda",
			},
			{
				id: 91,
				name: "Rundi",
			},
			{
				id: 92,
				name: "Nyanja/Chewa",
			},
			{
				id: 93,
				name: "Malagasy",
			},
			{
				id: 94,
				name: "Esperanto",
			},
			{
				id: 128,
				name: "Welsh",
			},
			{
				id: 129,
				name: "Basque",
			},
			{
				id: 130,
				name: "Catalan",
			},
			{
				id: 131,
				name: "Latin",
			},
			{
				id: 132,
				name: "Quechua",
			},
			{
				id: 133,
				name: "Guarani",
			},
			{
				id: 134,
				name: "Aymara",
			},
			{
				id: 135,
				name: "Tatar",
			},
			{
				id: 136,
				name: "Uighur",
			},
			{
				id: 137,
				name: "Dzongkha",
			},
			{
				id: 138,
				name: "Javanese (Roman script)",
			},
			{
				id: 139,
				name: "Sundanese (Roman script)",
			},
			{
				id: 140,
				name: "Galician",
			},
			{
				id: 141,
				name: "Afrikaans",
			},
			{
				id: 142,
				name: "Breton",
			},
			{
				id: 143,
				name: "Inuktitut",
			},
			{
				id: 144,
				name: "Scottish Gaelic",
			},
			{
				id: 145,
				name: "Manx Gaelic",
			},
			{
				id: 146,
				name: "Irish Gaelic (with dot above)",
			},
			{
				id: 147,
				name: "Tongan",
			},
			{
				id: 148,
				name: "Greek (polytonic)",
			},
			{
				id: 149,
				name: "Greenlandic",
			},
			{
				id: 150,
				name: "Azerbaijani (Roman script)",
			},
		],
	},
	{
		id: 2,
		name: "ISO",
		encoding: [
			{
				id: 0,
				name: "7-bit ASCII",
			},
			{
				id: 1,
				name: "ISO 10646",
			},
			{
				id: 2,
				name: "ISO 8859-1",
			},
		],
	},
	{
		id: 3,
		name: "Windows",
		encoding: [
			{
				id: 0,
				name: "Symbol",
			},
			{
				id: 1,
				name: "Unicode BMP",
			},
			{
				id: 2,
				name: "ShiftJIS",
			},
			{
				id: 3,
				name: "PRC",
			},
			{
				id: 4,
				name: "Big5",
			},
			{
				id: 5,
				name: "Wansung",
			},
			{
				id: 6,
				name: "Johab",
			},
			{
				id: 7,
				name: "Reserved",
			},
			{
				id: 8,
				name: "Reserved",
			},
			{
				id: 9,
				name: "Reserved",
			},
			{
				id: 10,
				name: "Unicode full repertoire",
			},
		],
		language: [
			{
				name: "Afrikaans",
				region: "South Africa",
				id: "0436",
			},
			{
				name: "Albanian",
				region: "Albania",
				id: "041C",
			},
			{
				name: "Alsatian",
				region: "France",
				id: "0484",
			},
			{
				name: "Amharic",
				region: "Ethiopia",
				id: "045E",
			},
			{
				name: "Arabic",
				region: "Algeria",
				id: "1401",
			},
			{
				name: "Arabic",
				region: "Bahrain",
				id: "3C01",
			},
			{
				name: "Arabic",
				region: "Egypt",
				id: "0C01",
			},
			{
				name: "Arabic",
				region: "Iraq",
				id: "0801",
			},
			{
				name: "Arabic",
				region: "Jordan",
				id: "2C01",
			},
			{
				name: "Arabic",
				region: "Kuwait",
				id: "3401",
			},
			{
				name: "Arabic",
				region: "Lebanon",
				id: "3001",
			},
			{
				name: "Arabic",
				region: "Libya",
				id: "1001",
			},
			{
				name: "Arabic",
				region: "Morocco",
				id: "1801",
			},
			{
				name: "Arabic",
				region: "Oman",
				id: "2001",
			},
			{
				name: "Arabic",
				region: "Qatar",
				id: "4001",
			},
			{
				name: "Arabic",
				region: "Saudi Arabia",
				id: "0401",
			},
			{
				name: "Arabic",
				region: "Syria",
				id: "2801",
			},
			{
				name: "Arabic",
				region: "Tunisia",
				id: "1C01",
			},
			{
				name: "Arabic",
				region: "U.A.E.",
				id: "3801",
			},
			{
				name: "Arabic",
				region: "Yemen",
				id: "2401",
			},
			{
				name: "Armenian",
				region: "Armenia",
				id: "042B",
			},
			{
				name: "Assamese",
				region: "India",
				id: "044D",
			},
			{
				name: "Azeri (Cyrillic)",
				region: "Azerbaijan",
				id: "082C",
			},
			{
				name: "Azeri (Latin)",
				region: "Azerbaijan",
				id: "042C",
			},
			{
				name: "Bashkir",
				region: "Russia",
				id: "046D",
			},
			{
				name: "Basque",
				region: "Basque",
				id: "042D",
			},
			{
				name: "Belarusian",
				region: "Belarus",
				id: "0423",
			},
			{
				name: "Bengali",
				region: "Bangladesh",
				id: "0845",
			},
			{
				name: "Bengali",
				region: "India",
				id: "0445",
			},
			{
				name: "Bosnian (Cyrillic)",
				region: "Bosnia and Herzegovina",
				id: "201A",
			},
			{
				name: "Bosnian (Latin)",
				region: "Bosnia and Herzegovina",
				id: "141A",
			},
			{
				name: "Breton",
				region: "France",
				id: "047E",
			},
			{
				name: "Bulgarian",
				region: "Bulgaria",
				id: "0402",
			},
			{
				name: "Catalan",
				region: "Catalan",
				id: "0403",
			},
			{
				name: "Chinese",
				region: "Hong Kong S.A.R.",
				id: "0C04",
			},
			{
				name: "Chinese",
				region: "Macao S.A.R.",
				id: "1404",
			},
			{
				name: "Chinese",
				region: "People’s Republic of China",
				id: "0804",
			},
			{
				name: "Chinese",
				region: "Singapore",
				id: "1004",
			},
			{
				name: "Chinese",
				region: "Taiwan",
				id: "0404",
			},
			{
				name: "Corsican",
				region: "France",
				id: "0483",
			},
			{
				name: "Croatian",
				region: "Croatia",
				id: "041A",
			},
			{
				name: "Croatian (Latin)",
				region: "Bosnia and Herzegovina",
				id: "101A",
			},
			{
				name: "Czech",
				region: "Czech Republic",
				id: "0405",
			},
			{
				name: "Danish",
				region: "Denmark",
				id: "0406",
			},
			{
				name: "Dari",
				region: "Afghanistan",
				id: "048C",
			},
			{
				name: "Divehi",
				region: "Maldives",
				id: "0465",
			},
			{
				name: "Dutch",
				region: "Belgium",
				id: "0813",
			},
			{
				name: "Dutch",
				region: "Netherlands",
				id: "0413",
			},
			{
				name: "English",
				region: "Australia",
				id: "0C09",
			},
			{
				name: "English",
				region: "Belize",
				id: "2809",
			},
			{
				name: "English",
				region: "Canada",
				id: "1009",
			},
			{
				name: "English",
				region: "Caribbean",
				id: "2409",
			},
			{
				name: "English",
				region: "India",
				id: "4009",
			},
			{
				name: "English",
				region: "Ireland",
				id: "1809",
			},
			{
				name: "English",
				region: "Jamaica",
				id: "2009",
			},
			{
				name: "English",
				region: "Malaysia",
				id: "4409",
			},
			{
				name: "English",
				region: "New Zealand",
				id: "1409",
			},
			{
				name: "English",
				region: "Republic of the Philippines",
				id: "3409",
			},
			{
				name: "English",
				region: "Singapore",
				id: "4809",
			},
			{
				name: "English",
				region: "South Africa",
				id: "1C09",
			},
			{
				name: "English",
				region: "Trinidad and Tobago",
				id: "2C09",
			},
			{
				name: "English",
				region: "United Kingdom",
				id: "0809",
			},
			{
				name: "English",
				region: "United States",
				id: "0409",
			},
			{
				name: "English",
				region: "Zimbabwe",
				id: "3009",
			},
			{
				name: "Estonian",
				region: "Estonia",
				id: "0425",
			},
			{
				name: "Faroese",
				region: "Faroe Islands",
				id: "0438",
			},
			{
				name: "Filipino",
				region: "Philippines",
				id: "0464",
			},
			{
				name: "Finnish",
				region: "Finland",
				id: "040B",
			},
			{
				name: "French",
				region: "Belgium",
				id: "080C",
			},
			{
				name: "French",
				region: "Canada",
				id: "0C0C",
			},
			{
				name: "French",
				region: "France",
				id: "040C",
			},
			{
				name: "French",
				region: "Luxembourg",
				id: "140c",
			},
			{
				name: "French",
				region: "Principality of Monaco",
				id: "180C",
			},
			{
				name: "French",
				region: "Switzerland",
				id: "100C",
			},
			{
				name: "Frisian",
				region: "Netherlands",
				id: "0462",
			},
			{
				name: "Galician",
				region: "Galician",
				id: "0456",
			},
			{
				name: "Georgian",
				region: "Georgia",
				id: "0437",
			},
			{
				name: "German",
				region: "Austria",
				id: "0C07",
			},
			{
				name: "German",
				region: "Germany",
				id: "0407",
			},
			{
				name: "German",
				region: "Liechtenstein",
				id: "1407",
			},
			{
				name: "German",
				region: "Luxembourg",
				id: "1007",
			},
			{
				name: "German",
				region: "Switzerland",
				id: "0807",
			},
			{
				name: "Greek",
				region: "Greece",
				id: "0408",
			},
			{
				name: "Greenlandic",
				region: "Greenland",
				id: "046F",
			},
			{
				name: "Gujarati",
				region: "India",
				id: "0447",
			},
			{
				name: "Hausa (Latin)",
				region: "Nigeria",
				id: "0468",
			},
			{
				name: "Hebrew",
				region: "Israel",
				id: "040D",
			},
			{
				name: "Hindi",
				region: "India",
				id: "0439",
			},
			{
				name: "Hungarian",
				region: "Hungary",
				id: "040E",
			},
			{
				name: "Icelandic",
				region: "Iceland",
				id: "040F",
			},
			{
				name: "Igbo",
				region: "Nigeria",
				id: "0470",
			},
			{
				name: "Indonesian",
				region: "Indonesia",
				id: "0421",
			},
			{
				name: "Inuktitut",
				region: "Canada",
				id: "045D",
			},
			{
				name: "Inuktitut (Latin)",
				region: "Canada",
				id: "085D",
			},
			{
				name: "Irish",
				region: "Ireland",
				id: "083C",
			},
			{
				name: "isiXhosa",
				region: "South Africa",
				id: "0434",
			},
			{
				name: "isiZulu",
				region: "South Africa",
				id: "0435",
			},
			{
				name: "Italian",
				region: "Italy",
				id: "0410",
			},
			{
				name: "Italian",
				region: "Switzerland",
				id: "0810",
			},
			{
				name: "Japanese",
				region: "Japan",
				id: "0411",
			},
			{
				name: "Kannada",
				region: "India",
				id: "044B",
			},
			{
				name: "Kazakh",
				region: "Kazakhstan",
				id: "043F",
			},
			{
				name: "Khmer",
				region: "Cambodia",
				id: "0453",
			},
			{
				name: "K’iche",
				region: "Guatemala",
				id: "0486",
			},
			{
				name: "Kinyarwanda",
				region: "Rwanda",
				id: "0487",
			},
			{
				name: "Kiswahili",
				region: "Kenya",
				id: "0441",
			},
			{
				name: "Konkani",
				region: "India",
				id: "0457",
			},
			{
				name: "Korean",
				region: "Korea",
				id: "0412",
			},
			{
				name: "Kyrgyz",
				region: "Kyrgyzstan",
				id: "0440",
			},
			{
				name: "Lao",
				region: "Lao P.D.R.",
				id: "0454",
			},
			{
				name: "Latvian",
				region: "Latvia",
				id: "0426",
			},
			{
				name: "Lithuanian",
				region: "Lithuania",
				id: "0427",
			},
			{
				name: "Lower Sorbian",
				region: "Germany",
				id: "082E",
			},
			{
				name: "Luxembourgish",
				region: "Luxembourg",
				id: "046E",
			},
			{
				name: "Macedonian (FYROM)",
				region: "Former Yugoslav Republic of Macedonia",
				id: "042F",
			},
			{
				name: "Malay",
				region: "Brunei Darussalam",
				id: "083E",
			},
			{
				name: "Malay",
				region: "Malaysia",
				id: "043E",
			},
			{
				name: "Malayalam",
				region: "India",
				id: "044C",
			},
			{
				name: "Maltese",
				region: "Malta",
				id: "043A",
			},
			{
				name: "Maori",
				region: "New Zealand",
				id: "0481",
			},
			{
				name: "Mapudungun",
				region: "Chile",
				id: "047A",
			},
			{
				name: "Marathi",
				region: "India",
				id: "044E",
			},
			{
				name: "Mohawk",
				region: "Mohawk",
				id: "047C",
			},
			{
				name: "Mongolian (Cyrillic)",
				region: "Mongolia",
				id: "0450",
			},
			{
				name: "Mongolian (Traditional)",
				region: "People’s Republic of China",
				id: "0850",
			},
			{
				name: "Nepali",
				region: "Nepal",
				id: "0461",
			},
			{
				name: "Norwegian (Bokmal)",
				region: "Norway",
				id: "0414",
			},
			{
				name: "Norwegian (Nynorsk)",
				region: "Norway",
				id: "0814",
			},
			{
				name: "Occitan",
				region: "France",
				id: "0482",
			},
			{
				name: "Odia (formerly Oriya)",
				region: "India",
				id: "0448",
			},
			{
				name: "Pashto",
				region: "Afghanistan",
				id: "0463",
			},
			{
				name: "Polish",
				region: "Poland",
				id: "0415",
			},
			{
				name: "Portuguese",
				region: "Brazil",
				id: "0416",
			},
			{
				name: "Portuguese",
				region: "Portugal",
				id: "0816",
			},
			{
				name: "Punjabi",
				region: "India",
				id: "0446",
			},
			{
				name: "Quechua",
				region: "Bolivia",
				id: "046B",
			},
			{
				name: "Quechua",
				region: "Ecuador",
				id: "086B",
			},
			{
				name: "Quechua",
				region: "Peru",
				id: "0C6B",
			},
			{
				name: "Romanian",
				region: "Romania",
				id: "0418",
			},
			{
				name: "Romansh",
				region: "Switzerland",
				id: "0417",
			},
			{
				name: "Russian",
				region: "Russia",
				id: "0419",
			},
			{
				name: "Sami (Inari)",
				region: "Finland",
				id: "243B",
			},
			{
				name: "Sami (Lule)",
				region: "Norway",
				id: "103B",
			},
			{
				name: "Sami (Lule)",
				region: "Sweden",
				id: "143B",
			},
			{
				name: "Sami (Northern)",
				region: "Finland",
				id: "0C3B",
			},
			{
				name: "Sami (Northern)",
				region: "Norway",
				id: "043B",
			},
			{
				name: "Sami (Northern)",
				region: "Sweden",
				id: "083B",
			},
			{
				name: "Sami (Skolt)",
				region: "Finland",
				id: "203B",
			},
			{
				name: "Sami (Southern)",
				region: "Norway",
				id: "183B",
			},
			{
				name: "Sami (Southern)",
				region: "Sweden",
				id: "1C3B",
			},
			{
				name: "Sanskrit",
				region: "India",
				id: "044F",
			},
			{
				name: "Serbian (Cyrillic)",
				region: "Bosnia and Herzegovina",
				id: "1C1A",
			},
			{
				name: "Serbian (Cyrillic)",
				region: "Serbia",
				id: "0C1A",
			},
			{
				name: "Serbian (Latin)",
				region: "Bosnia and Herzegovina",
				id: "181A",
			},
			{
				name: "Serbian (Latin)",
				region: "Serbia",
				id: "081A",
			},
			{
				name: "Sesotho sa Leboa",
				region: "South Africa",
				id: "046C",
			},
			{
				name: "Setswana",
				region: "South Africa",
				id: "0432",
			},
			{
				name: "Sinhala",
				region: "Sri Lanka",
				id: "045B",
			},
			{
				name: "Slovak",
				region: "Slovakia",
				id: "041B",
			},
			{
				name: "Slovenian",
				region: "Slovenia",
				id: "0424",
			},
			{
				name: "Spanish",
				region: "Argentina",
				id: "2C0A",
			},
			{
				name: "Spanish",
				region: "Bolivia",
				id: "400A",
			},
			{
				name: "Spanish",
				region: "Chile",
				id: "340A",
			},
			{
				name: "Spanish",
				region: "Colombia",
				id: "240A",
			},
			{
				name: "Spanish",
				region: "Costa Rica",
				id: "140A",
			},
			{
				name: "Spanish",
				region: "Dominican Republic",
				id: "1C0A",
			},
			{
				name: "Spanish",
				region: "Ecuador",
				id: "300A",
			},
			{
				name: "Spanish",
				region: "El Salvador",
				id: "440A",
			},
			{
				name: "Spanish",
				region: "Guatemala",
				id: "100A",
			},
			{
				name: "Spanish",
				region: "Honduras",
				id: "480A",
			},
			{
				name: "Spanish",
				region: "Mexico",
				id: "080A",
			},
			{
				name: "Spanish",
				region: "Nicaragua",
				id: "4C0A",
			},
			{
				name: "Spanish",
				region: "Panama",
				id: "180A",
			},
			{
				name: "Spanish",
				region: "Paraguay",
				id: "3C0A",
			},
			{
				name: "Spanish",
				region: "Peru",
				id: "280A",
			},
			{
				name: "Spanish",
				region: "Puerto Rico",
				id: "500A",
			},
			{
				name: "Spanish (Modern Sort)",
				region: "Spain",
				id: "0C0A",
			},
			{
				name: "Spanish (Traditional Sort)",
				region: "Spain",
				id: "040A",
			},
			{
				name: "Spanish",
				region: "United States",
				id: "540A",
			},
			{
				name: "Spanish",
				region: "Uruguay",
				id: "380A",
			},
			{
				name: "Spanish",
				region: "Venezuela",
				id: "200A",
			},
			{
				name: "Sweden",
				region: "Finland",
				id: "081D",
			},
			{
				name: "Swedish",
				region: "Sweden",
				id: "041D",
			},
			{
				name: "Syriac",
				region: "Syria",
				id: "045A",
			},
			{
				name: "Tajik (Cyrillic)",
				region: "Tajikistan",
				id: "0428",
			},
			{
				name: "Tamazight (Latin)",
				region: "Algeria",
				id: "085F",
			},
			{
				name: "Tamil",
				region: "India",
				id: "0449",
			},
			{
				name: "Tatar",
				region: "Russia",
				id: "0444",
			},
			{
				name: "Telugu",
				region: "India",
				id: "044A",
			},
			{
				name: "Thai",
				region: "Thailand",
				id: "041E",
			},
			{
				name: "Tibetan",
				region: "PRC",
				id: "0451",
			},
			{
				name: "Turkish",
				region: "Turkey",
				id: "041F",
			},
			{
				name: "Turkmen",
				region: "Turkmenistan",
				id: "0442",
			},
			{
				name: "Uighur",
				region: "PRC",
				id: "0480",
			},
			{
				name: "Ukrainian",
				region: "Ukraine",
				id: "0422",
			},
			{
				name: "Upper Sorbian",
				region: "Germany",
				id: "042E",
			},
			{
				name: "Urdu",
				region: "Islamic Republic of Pakistan",
				id: "0420",
			},
			{
				name: "Uzbek (Cyrillic)",
				region: "Uzbekistan",
				id: "0843",
			},
			{
				name: "Uzbek (Latin)",
				region: "Uzbekistan",
				id: "0443",
			},
			{
				name: "Vietnamese",
				region: "Vietnam",
				id: "042A",
			},
			{
				name: "Welsh",
				region: "United Kingdom",
				id: "0452",
			},
			{
				name: "Wolof",
				region: "Senegal",
				id: "0488",
			},
			{
				name: "Yakut",
				region: "Russia",
				id: "0485",
			},
			{
				name: "Yi",
				region: "PRC",
				id: "0478",
			},
			{
				name: "Yoruba",
				region: "Nigeria",
				id: "046A",
			},
		],
	},
	{
		id: 4,
		name: "Custom",
		encoding: "OTF Windows NT compatibility mapping",
		language: [],
	},
];

export const CMAP_RECORD = [
	{
		id: 0,
		name: "Unicode",
		encoding: [
			{
				id: 0,
				name: "Default",
			},
			{
				id: 1,
				name: "Version 1.1",
			},
			{
				id: 2,
				name: "ISO 10646 1993",
			},
			{
				id: 3,
				name: "Unicode 2.0 (BMP only)",
			},
			{
				id: 4,
				name: "Unicode 2.0 (non-BMP allowed)",
			},
			{
				id: 5,
				name: "Unicode Variation Sequences",
			},
			{
				id: 6,
				name: "Full Unicode coverage",
			},
		],
	},
	{
		id: 1,
		name: "Macintosh",
		encoding: undefined,
	},
	{
		id: 2,
		name: "ISO",
		encoding: undefined,
	},
	{
		id: 3,
		name: "Windows",
		encoding: [
			{
				id: 0,
				name: "Symbol",
			},
			{
				id: 1,
				name: "Unicode BMP",
			},
			{
				id: 2,
				name: "ShiftJIS",
			},
			{
				id: 3,
				name: "PRC",
			},
			{
				id: 4,
				name: "Big5",
			},
			{
				id: 5,
				name: "Wansung",
			},
			{
				id: 6,
				name: "Johab",
			},
			{
				id: 7,
				name: "Reserved",
			},
			{
				id: 8,
				name: "Reserved",
			},
			{
				id: 9,
				name: "Reserved",
			},
			{
				id: 10,
				name: "Unicode UCS-4",
			},
		],
	},
	{
		id: 4,
		name: "Custom",
		encoding: undefined,
	},
];
