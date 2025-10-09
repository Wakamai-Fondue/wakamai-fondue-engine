import { mergeUniqueCoverage } from "../lookup-utils.js";

// Ligature substitution
export function parseLookupType4(lookup, charFor) {
	const parsedData = {
		input: [],
		backtrack: [],
		lookahead: [],
		alternateCount: [],
	};

	lookup.subtableOffsets.forEach((_, i) => {
		const subtable = lookup.getSubTable(i);
		const coverage = subtable.getCoverageTable();
		const results = [];

		if (coverage.glyphArray !== undefined) {
			subtable.ligatureSetOffsets.forEach((_, setIndex) => {
				const ligatureSet = subtable.getLigatureSet(setIndex);

				ligatureSet.ligatureOffsets.forEach((_, ligIndex) => {
					const ligatureTable = ligatureSet.getLigature(ligIndex);

					const sequence = [
						coverage.glyphArray[setIndex],
						...ligatureTable.componentGlyphIDs,
					].map(charFor);

					// Only keep sequences with glyphs mapped to letters
					if (!sequence.includes(undefined)) {
						results.push(sequence.join(""));
					}
				});
			});
		}

		parsedData.input = mergeUniqueCoverage(parsedData.input, results);
	});

	return parsedData;
}
