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

export const createType6Summary = (feature, randomize) => {
	let allInputs = [];
	let allBacktracks = [];
	let allLookaheads = [];

	const limit = 10; // Summary will be limited to a max of limit³ (e.g. 20*20*20 = 8000)

	const shuffleArray = (array) => {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	};

	// Create some kind of "all backtracks" or "all lookaheads"
	for (const lookup of feature["lookups"]) {
		if (lookup.type !== 6) continue;

		// Create all possible combinations of input, backtrack and lookahead
		for (const key in Object.entries(lookup["input"])) {
			allInputs = [...new Set(allInputs.concat(lookup["input"][key]))];

			if (lookup["backtrack"][key]) {
				allBacktracks = [
					...new Set(allBacktracks.concat(lookup["backtrack"][key])),
				];
			}

			if (lookup["lookahead"][key]) {
				allLookaheads = [
					...new Set(allLookaheads.concat(lookup["lookahead"][key])),
				];
			}
		}
	}

	if (randomize) {
		allInputs = shuffleArray(allInputs);

		if (allBacktracks.length) {
			allBacktracks = shuffleArray(allBacktracks);
		}

		if (allLookaheads.length) {
			allLookaheads = shuffleArray(allLookaheads);
		}
	}

	let allCombinations = [allInputs.slice(0, limit)];

	if (allBacktracks.length) {
		allCombinations.unshift(allBacktracks.slice(0, limit));
	}

	if (allLookaheads.length) {
		allCombinations.push(allLookaheads.slice(0, limit));
	}

	let summarizedCombinations = allCombinations
		.reduce((a, b) =>
			a.reduce((r, v) => r.concat(b.map((w) => [].concat(v, w))), [])
		)
		.map((a) => {
			if (Array.isArray(a)) {
				return a.join("");
			} else {
				return a;
			}
		});

	return {
		allInputs: allInputs.sort(),
		allBacktracks: allBacktracks.sort(),
		allLookaheads: allLookaheads.sort(),
		summarizedCombinations: summarizedCombinations.sort(),
	};
};
