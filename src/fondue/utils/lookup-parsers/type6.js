import { mergeUniqueCoverage } from "../lookup-utils.js";

function extractFormat1Sequences(subtable, charFor) {
	let inputChars = [];
	let backtrackChars = [];
	let lookaheadChars = [];

	for (
		let setIndex = 0;
		setIndex < subtable.chainSubRuleSetCount;
		setIndex++
	) {
		const chainSubRuleSet = subtable.getChainSubRuleSet(setIndex);
		for (
			let ruleIndex = 0;
			ruleIndex < chainSubRuleSet.chainSubRuleCount;
			ruleIndex++
		) {
			const chainSubRule = chainSubRuleSet.getSubRule(ruleIndex);

			if (
				chainSubRule.inputGlyphCount > 0 &&
				chainSubRule.inputSequence
			) {
				const inputGlyphs = chainSubRule.inputSequence
					.filter((g) => charFor(g) !== undefined)
					.map(charFor);
				inputChars = mergeUniqueCoverage(inputChars, inputGlyphs);
			}

			if (
				chainSubRule.backtrackGlyphCount > 0 &&
				chainSubRule.backtrackSequence
			) {
				const backtrackGlyphs = chainSubRule.backtrackSequence
					.filter((g) => charFor(g) !== undefined)
					.map(charFor);
				backtrackChars = mergeUniqueCoverage(
					backtrackChars,
					backtrackGlyphs
				);
			}

			if (
				chainSubRule.lookaheadGlyphCount > 0 &&
				chainSubRule.lookAheadSequence
			) {
				const lookaheadGlyphs = chainSubRule.lookAheadSequence
					.filter((g) => charFor(g) !== undefined)
					.map(charFor);
				lookaheadChars = mergeUniqueCoverage(
					lookaheadChars,
					lookaheadGlyphs
				);
			}
		}
	}

	return { inputChars, backtrackChars, lookaheadChars };
}

function extractFormat2Sequences(subtable) {
	let inputChars = [];
	let backtrackChars = [];
	let lookaheadChars = [];

	for (
		let setIndex = 0;
		setIndex < subtable.chainSubClassSetCount;
		setIndex++
	) {
		const chainSubClassSet = subtable.getChainSubClassSet(setIndex);
		console.log(`ChainSubClassSet ${setIndex}:`, chainSubClassSet);
	}

	return { inputChars, backtrackChars, lookaheadChars };
}

function extractFormat3Sequences(subtable, charFor, charactersFromGlyphs) {
	let inputChars = [];
	let backtrackChars = [];
	let lookaheadChars = [];

	if (subtable.inputGlyphCount > 0) {
		subtable.inputCoverageOffsets.forEach((offset) => {
			const coverage = subtable.getCoverageFromOffset(offset);
			inputChars = charactersFromGlyphs(coverage, charFor);
		});
	}

	if (subtable.backtrackGlyphCount > 0) {
		subtable.backtrackCoverageOffsets.forEach((offset) => {
			const coverage = subtable.getCoverageFromOffset(offset);
			backtrackChars = charactersFromGlyphs(coverage, charFor);
		});
	}

	if (subtable.lookaheadGlyphCount > 0) {
		subtable.lookaheadCoverageOffsets.forEach((offset) => {
			const coverage = subtable.getCoverageFromOffset(offset);
			lookaheadChars = charactersFromGlyphs(coverage, charFor);
		});
	}

	return { inputChars, backtrackChars, lookaheadChars };
}

// When a lookup has a lookahead or backtrack with *only* glyphs (so
// no direct characters), we should ignore this lookup. Otherwise it will
// result in a lookup that *looks* okay, but isn't.
// Example: backtrack [a, b, c], input [n], lookahead[x.alt, y.alt, z.alt]
// Since the lookhead contains no chars, it will be reduced to [], and the
// lookup with look like this: backtrack [a, b, c], input [n]. This is
// wrong, as that only the backtrack+input will not result in any changed
// chars
function shouldIncludeSequences(sequences, subtable, substFormat) {
	const { backtrackChars, lookaheadChars } = sequences;
	const hasBacktrackData = backtrackChars.length > 0;
	const hasLookaheadData = lookaheadChars.length > 0;

	let shouldIncludeLookup = true;

	if (substFormat === 1) {
		for (
			let setIndex = 0;
			setIndex < subtable.chainSubRuleSetCount && shouldIncludeLookup;
			setIndex++
		) {
			const chainSubRuleSet = subtable.getChainSubRuleSet(setIndex);

			for (
				let ruleIndex = 0;
				ruleIndex < chainSubRuleSet.chainSubRuleCount &&
				shouldIncludeLookup;
				ruleIndex++
			) {
				const chainSubRule = chainSubRuleSet.getSubRule(ruleIndex);

				if (chainSubRule.backtrackGlyphCount > 0 && !hasBacktrackData) {
					shouldIncludeLookup = false;
				}
				if (chainSubRule.lookaheadGlyphCount > 0 && !hasLookaheadData) {
					shouldIncludeLookup = false;
				}
			}
		}
	} else if (substFormat === 2) {
		console.log(subtable);
	} else if (substFormat === 3) {
		if (subtable.backtrackGlyphCount > 0 && !hasBacktrackData) {
			shouldIncludeLookup = false;
		}
		if (subtable.lookaheadGlyphCount > 0 && !hasLookaheadData) {
			shouldIncludeLookup = false;
		}
	}

	return shouldIncludeLookup;
}

function mergeParsedData(parsedData, sequences, index) {
	const { inputChars, backtrackChars, lookaheadChars } = sequences;

	parsedData.input[index] = mergeUniqueCoverage(
		parsedData.input[index],
		inputChars
	);

	if (backtrackChars) {
		parsedData.backtrack[index] = mergeUniqueCoverage(
			parsedData.backtrack[index],
			backtrackChars
		);
	}

	if (lookaheadChars) {
		parsedData.lookahead[index] = mergeUniqueCoverage(
			parsedData.lookahead[index],
			lookaheadChars
		);
	}
}

// Chained context substitution
export function parseLookupType6(lookup, charFor, charactersFromGlyphs) {
	const parsedData = {
		input: [],
		backtrack: [],
		lookahead: [],
		alternateCount: [],
	};

	// Note that currently if a ChainContextSubst contains multiple coverages,
	// we merge them all into one and remove duplicates. This is purely to keep
	// a "data dump" less overwhelming, but isn't a perfect treatment of a type
	// 6 lookup, as this can suggest character combinations that aren't
	// possible.
	// Possible future improvement: add the chars as an array to an array of
	// input/backtrack/lookahead, then let a front decide whether to merge
	// them or dump everything as-is.
	lookup.subtableOffsets.forEach((_, i) => {
		try {
			const subtable = lookup.getSubTable(i);
			const substFormat = subtable.substFormat;

			let inputChars = [];
			let backtrackChars = [];
			let lookaheadChars = [];

			if (substFormat === 1) {
				// Format 1: nested in chainSubRules
				({ inputChars, backtrackChars, lookaheadChars } =
					extractFormat1Sequences(subtable, charFor));
			} else if (substFormat === 2) {
				// Format 2: class-based rules
				({ inputChars, backtrackChars, lookaheadChars } =
					extractFormat2Sequences(subtable));
			} else if (substFormat === 3) {
				// Format 3: direct access
				({ inputChars, backtrackChars, lookaheadChars } =
					extractFormat3Sequences(
						subtable,
						charFor,
						charactersFromGlyphs
					));
			} else {
				// Yeah, now what?
				console.warn(
					"No implementation for type 6, format",
					substFormat
				);
			}

			const sequences = { inputChars, backtrackChars, lookaheadChars };

			if (shouldIncludeSequences(sequences, subtable, substFormat)) {
				mergeParsedData(parsedData, sequences, i);
			}
		} catch (error) {
			console.warn(
				`Failed to parse GSUB lookup type 6, subtable ${i}:`,
				error.message
			);
		}
	});

	return parsedData;
}
