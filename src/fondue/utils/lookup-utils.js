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

export const createType6Summary = (feature, randomize, uniqueOnly) => {
	let allInputs = [];
	let allBacktracks = [];
	let allLookaheads = [];

	const shuffleArray = (array) => {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	};

	// Create unique combinations of backtrack+input and input+lookahead
	const uniqueCombinationsSet = new Set();

	for (const lookup of feature["lookups"]) {
		if (lookup.type !== 6) continue;

		// Create combinations based on position
		for (const key in Object.entries(lookup["input"])) {
			const inputChars = lookup["input"][key] || [];
			const backtrackChars = lookup["backtrack"][key] || [];
			const lookaheadChars = lookup["lookahead"][key] || [];

			// Collect all characters for the full summary
			allInputs = [...new Set(allInputs.concat(inputChars))];
			if (backtrackChars.length > 0) {
				allBacktracks = [
					...new Set(allBacktracks.concat(backtrackChars)),
				];
			}
			if (lookaheadChars.length > 0) {
				allLookaheads = [
					...new Set(allLookaheads.concat(lookaheadChars)),
				];
			}

			// Create backtrack + input combinations
			for (const backtrackChar of backtrackChars) {
				for (const inputChar of inputChars) {
					uniqueCombinationsSet.add(backtrackChar + inputChar);
				}
			}

			// Create input + lookahead combinations
			for (const inputChar of inputChars) {
				for (const lookaheadChar of lookaheadChars) {
					uniqueCombinationsSet.add(inputChar + lookaheadChar);
				}
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

	let allCombinations = [...allInputs, ...allBacktracks, ...allLookaheads];

	const uniqueCombinations = Array.from(uniqueCombinationsSet).sort();
	const totalCombinations = uniqueCombinations.length;
	const isCapped = totalCombinations > 1000;
	const cappedCombinations = uniqueCombinations.slice(0, 1000);

	// Return a small, de-duplicated list of features
	if (uniqueOnly) {
		return {
			uniqueCombinations: cappedCombinations,
			totalCombinations: totalCombinations,
			isCapped: isCapped,
		};
	}

	// Create a list of all combinations of the characters involved in
	// this lookup
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

	// Return the full monty
	return {
		allInputs: allInputs.sort(),
		allBacktracks: allBacktracks.sort(),
		allLookaheads: allLookaheads.sort(),
		summarizedCombinations: summarizedCombinations.sort(),
		uniqueCombinations: cappedCombinations,
		totalCombinations: totalCombinations,
		isCapped: isCapped,
	};
};
