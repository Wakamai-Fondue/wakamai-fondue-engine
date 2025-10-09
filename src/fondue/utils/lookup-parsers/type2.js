import { mergeUniqueCoverage } from "../lookup-utils.js";

// Multiple substitution
export function parseLookupType2(lookup, charFor, charactersFromGlyphs) {
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

		parsedData.input = mergeUniqueCoverage(parsedData.input, results);
	});

	return parsedData;
}
