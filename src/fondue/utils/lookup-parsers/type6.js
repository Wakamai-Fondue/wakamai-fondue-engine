import { mergeUniqueCoverage } from "../lookup-utils.js";

function filterGlyphsToChars(glyphs, charFor) {
	const chars = [];
	let alreadyAlternateCount = 0;
	for (const g of glyphs) {
		const char = charFor(g);
		if (char !== undefined) {
			chars.push(char);
		} else {
			alreadyAlternateCount++;
		}
	}
	return { chars, alreadyAlternateCount };
}

function extractFormat1Sequences(subtable, charFor) {
	let inputChars = [];
	let backtrackChars = [];
	let lookaheadChars = [];
	let alreadyAlternateCount = 0;

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
				const result = filterGlyphsToChars(
					chainSubRule.inputSequence,
					charFor
				);
				inputChars = mergeUniqueCoverage(inputChars, result.chars);
				alreadyAlternateCount += result.alreadyAlternateCount;
			}

			if (
				chainSubRule.backtrackGlyphCount > 0 &&
				chainSubRule.backtrackSequence
			) {
				const result = filterGlyphsToChars(
					chainSubRule.backtrackSequence,
					charFor
				);
				backtrackChars = mergeUniqueCoverage(
					backtrackChars,
					result.chars
				);
				alreadyAlternateCount += result.alreadyAlternateCount;
			}

			if (
				chainSubRule.lookaheadGlyphCount > 0 &&
				chainSubRule.lookaheadSequence
			) {
				const result = filterGlyphsToChars(
					chainSubRule.lookaheadSequence,
					charFor
				);
				lookaheadChars = mergeUniqueCoverage(
					lookaheadChars,
					result.chars
				);
				alreadyAlternateCount += result.alreadyAlternateCount;
			}
		}
	}

	return {
		inputChars,
		backtrackChars,
		lookaheadChars,
		alreadyAlternateCount,
	};
}

function extractFormat2Sequences(subtable, charFor) {
	let alreadyAlternateCount = 0;

	const inputClassDef = subtable.getInputClassDef();
	const backtrackClassDef = subtable.getBacktrackClassDef();
	const lookaheadClassDef = subtable.getLookaheadClassDef();

	function glyphsFromClassDef(classDef) {
		const glyphs = [];
		if (classDef.classFormat === 1) {
			for (let i = 0; i < classDef.glyphCount; i++) {
				if (classDef.classValueArray[i] > 0) {
					glyphs.push(classDef.startGlyphID + i);
				}
			}
		} else if (classDef.classFormat === 2) {
			for (const record of classDef.classRangeRecords) {
				for (
					let gid = record.startGlyphID;
					gid <= record.endGlyphID;
					gid++
				) {
					glyphs.push(gid);
				}
			}
		}
		return glyphs;
	}

	const inputResult = filterGlyphsToChars(
		glyphsFromClassDef(inputClassDef),
		charFor
	);
	const backtrackResult = filterGlyphsToChars(
		glyphsFromClassDef(backtrackClassDef),
		charFor
	);
	const lookaheadResult = filterGlyphsToChars(
		glyphsFromClassDef(lookaheadClassDef),
		charFor
	);

	alreadyAlternateCount +=
		inputResult.alreadyAlternateCount +
		backtrackResult.alreadyAlternateCount +
		lookaheadResult.alreadyAlternateCount;

	return {
		inputChars: inputResult.chars,
		backtrackChars: backtrackResult.chars,
		lookaheadChars: lookaheadResult.chars,
		alreadyAlternateCount,
	};
}

function extractFormat3Sequences(subtable, charFor, charactersFromGlyphs) {
	let inputChars = [];
	let backtrackChars = [];
	let lookaheadChars = [];
	let alreadyAlternateCount = 0;

	if (subtable.inputGlyphCount > 0) {
		subtable.inputCoverageOffsets.forEach((offset) => {
			const coverage = subtable.getCoverageFromOffset(offset);
			const result = charactersFromGlyphs(coverage, charFor);
			inputChars = result.characters;
			alreadyAlternateCount += result.alreadyAlternateCount;
		});
	}

	if (subtable.backtrackGlyphCount > 0) {
		subtable.backtrackCoverageOffsets.forEach((offset) => {
			const coverage = subtable.getCoverageFromOffset(offset);
			const result = charactersFromGlyphs(coverage, charFor);
			backtrackChars = result.characters;
			alreadyAlternateCount += result.alreadyAlternateCount;
		});
	}

	if (subtable.lookaheadGlyphCount > 0) {
		subtable.lookaheadCoverageOffsets.forEach((offset) => {
			const coverage = subtable.getCoverageFromOffset(offset);
			const result = charactersFromGlyphs(coverage, charFor);
			lookaheadChars = result.characters;
			alreadyAlternateCount += result.alreadyAlternateCount;
		});
	}

	return {
		inputChars,
		backtrackChars,
		lookaheadChars,
		alreadyAlternateCount,
	};
}

// When a lookup has a lookahead or backtrack with *only* glyphs (so
// no direct characters), we should ignore this lookup. Otherwise it will
// result in a lookup that *looks* okay, but isn't.
// Example: backtrack [a, b, c], input [n], lookahead[x.alt, y.alt, z.alt]
// Since the lookhead contains no chars, it will be reduced to [], and the
// lookup will look like this: backtrack [a, b, c], input [n]. This is
// wrong, as that only the backtrack+input will not result in any changed
// chars
function shouldIncludeSequences(sequences, subtable, format) {
	const { backtrackChars, lookaheadChars } = sequences;
	const hasBacktrackData = backtrackChars.length > 0;
	const hasLookaheadData = lookaheadChars.length > 0;

	let shouldIncludeLookup = true;

	if (format === 1) {
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
	} else if (format === 2) {
		const backtrackClassDef = subtable.getBacktrackClassDef();
		const lookaheadClassDef = subtable.getLookaheadClassDef();

		const hasBacktrackClasses =
			backtrackClassDef.classFormat === 2
				? backtrackClassDef.classRangeCount > 0
				: backtrackClassDef.glyphCount > 0;
		const hasLookaheadClasses =
			lookaheadClassDef.classFormat === 2
				? lookaheadClassDef.classRangeCount > 0
				: lookaheadClassDef.glyphCount > 0;

		if (hasBacktrackClasses && !hasBacktrackData) {
			shouldIncludeLookup = false;
		}
		if (hasLookaheadClasses && !hasLookaheadData) {
			shouldIncludeLookup = false;
		}
	} else if (format === 3) {
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
		alreadyAlternateCount: 0,
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
			const format = subtable.format;

			let inputChars = [];
			let backtrackChars = [];
			let lookaheadChars = [];
			let alreadyAlternateCount = 0;

			if (format === 1) {
				// Format 1: nested in chainSubRules
				({
					inputChars,
					backtrackChars,
					lookaheadChars,
					alreadyAlternateCount,
				} = extractFormat1Sequences(subtable, charFor));
			} else if (format === 2) {
				// Format 2: class-based rules
				({
					inputChars,
					backtrackChars,
					lookaheadChars,
					alreadyAlternateCount,
				} = extractFormat2Sequences(subtable, charFor));
			} else if (format === 3) {
				// Format 3: direct access
				({
					inputChars,
					backtrackChars,
					lookaheadChars,
					alreadyAlternateCount,
				} = extractFormat3Sequences(
					subtable,
					charFor,
					charactersFromGlyphs
				));
			} else {
				// Yeah, now what?
				console.warn("No implementation for type 6, format", format);
			}

			const sequences = { inputChars, backtrackChars, lookaheadChars };

			if (shouldIncludeSequences(sequences, subtable, format)) {
				mergeParsedData(parsedData, sequences, i);
				parsedData.alreadyAlternateCount += alreadyAlternateCount;
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
