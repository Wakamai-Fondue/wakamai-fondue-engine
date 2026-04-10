import { mergeUniqueCoverage } from "../lookup-utils.js";

// Single substitution
export function parseLookupType1(lookup, charFor, charactersFromGlyphs) {
	const parsedData = {
		input: [],
		backtrack: [],
		lookahead: [],
		alternateCount: [],
		alreadyAlternateCount: 0,
	};

	lookup.subtableOffsets.forEach((_, i) => {
		const subtable = lookup.getSubTable(i);
		const coverage = subtable.getCoverageTable();
		const { characters, alreadyAlternateCount } = charactersFromGlyphs(
			coverage,
			charFor
		);

		parsedData.input = mergeUniqueCoverage(parsedData.input, characters);
		parsedData.alreadyAlternateCount += alreadyAlternateCount;
	});

	return parsedData;
}
