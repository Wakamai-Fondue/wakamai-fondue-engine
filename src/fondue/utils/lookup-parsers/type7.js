// Extension Substitution
// For type 7, we get the underlying lookup type, which we then parse
export function parseLookupType7(
	lookup,
	charFor,
	charactersFromGlyphs,
	parsers
) {
	const parsedData = {
		input: [],
		backtrack: [],
		lookahead: [],
		alternateCount: [],
	};

	const subtable = lookup.getSubTable(0);
	const underlyingType = subtable.type;

	// Get the parser for the underlying type and return that
	const parser = parsers[underlyingType];
	if (parser) {
		return parser(lookup, charFor, charactersFromGlyphs);
	}

	return parsedData;
}
