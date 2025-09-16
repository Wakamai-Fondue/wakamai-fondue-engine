// Color font table names
export const COLOR_TABLES = ["COLR", "sbix", "CBDT", "SVG"];

// Cmap platform preferences for getBestCmap (FontTools implementation)
export const CMAP_PREFERENCES = [
	[3, 10],
	[0, 6],
	[0, 4],
	[3, 1],
	[0, 3],
	[0, 2],
	[0, 1],
	[0, 0],
];

// Characters to ignore when checking language support
export const LANGUAGE_SUPPORT_IGNORE_LIST = [
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

// Unicode character categories for categorisedCharacters
// undefined = no subcategory
export const UNICODE_CATEGORIES = {
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

// Human readable names for GSUB lookup types
export const LOOKUP_TYPE_NAMES = {
	1: "Single Substitution",
	2: "Multiple Substitution",
	3: "Alternate Substitution",
	4: "Ligature Substitution",
	5: "Contextual Substitution",
	6: "Chained Contexts Substitution",
	7: "Extension Substitution",
	8: "Reverse Chaining Contextual Single Substitution",
};
