// Single substitution
export function parseLookupType1(
	lookup,
	charFor,
	charactersFromGlyphs,
	mergeUniqueCoverage
) {
	const parsedData = {
		input: [],
		backtrack: [],
		lookahead: [],
		alternateCount: [],
	};

	lookup.subtableOffsets.forEach((_, i) => {
		const subtable = lookup.getSubTable(i);
		const coverage = subtable.getCoverageTable();
		const results = charactersFromGlyphs(coverage, charFor);

		if (results.length > 0) {
			parsedData.input = results;
		}
	});

	return parsedData;
}
