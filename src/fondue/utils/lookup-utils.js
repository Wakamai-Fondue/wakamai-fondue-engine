export function createGlyphToCharMapper(cmap) {
	const charForCache = new Map();

	return function charFor(glyphid) {
		if (charForCache.has(glyphid)) {
			return charForCache.get(glyphid);
		}
		const result = cmap.reverse(glyphid).unicode;
		charForCache.set(glyphid, result);
		return result;
	};
}

// [1,2,3] + [3,4,5] = [1,2,3,4,5]
export function mergeUniqueCoverage(existing, addition) {
	return [...new Set([...(existing || []), ...addition])];
}

// Returns glyphs that are mapped directly to characters for
// this coverage. If a glyph maps to another glyph, it's
// ignored.
// If only a specific rangeRecord needs to be processed, e.g.
// for lookup type 3, you can pass the desired index.
export function charactersFromGlyphs(coverage, charFor, index) {
	let results = [];

	if (!coverage.glyphArray) {
		let records;
		if (index >= 0) {
			records = coverage.rangeRecords.filter((_, i) => index !== i);
		} else {
			records = coverage.rangeRecords;
		}
		// Glyphs in start/end ranges
		for (const range of records) {
			for (let g = range.startGlyphID; g < range.endGlyphID + 1; g++) {
				const char = charFor(g);
				if (char !== undefined) {
					results.push(char);
				}
			}
		}
	} else {
		// Individual glyphs
		results = coverage.glyphArray
			.filter((g) => charFor(g) !== undefined)
			.map(charFor);
	}
	return results;
}
