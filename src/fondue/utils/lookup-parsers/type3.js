import { mergeUniqueCoverage } from "../lookup-utils.js";

// Alternate substitution
export function parseLookupType3(lookup, charFor, charactersFromGlyphs) {
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

		// It's possible to have AlternateSets with different lengths
		// inside the same lookup (e.g. 10 alternates for "A", 5 for
		// "B"), so we keep track of the alternateCount per glyph.
		subtable.alternateSetOffsets.forEach((_, j) => {
			const { characters, alreadyAlternateCount } = charactersFromGlyphs(
				coverage,
				charFor,
				j
			);
			parsedData.input = mergeUniqueCoverage(
				parsedData.input,
				characters
			);
			parsedData.alreadyAlternateCount += alreadyAlternateCount;

			const altset = subtable.getAlternateSet(j);
			parsedData.alternateCount.push(altset.alternateGlyphIDs.length);
		});
	});

	return parsedData;
}
