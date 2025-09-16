export function isVariable(font) {
	return font.opentype.tables.fvar != undefined;
}

export function isColor(font) {
	return getColorFormats(font).length > 0;
}

export function hasFeatures(font) {
	// This will need to be updated when features getter is extracted
	return font.opentype.tables.GSUB || font.opentype.tables.GPOS;
}

export function hasLanguages(font) {
	// This will need to be updated when languageSystems getter is extracted
	const hasGSUB = font.opentype.tables.GSUB;
	const hasGPOS = font.opentype.tables.GPOS;
	return hasGSUB || hasGPOS;
}

export function hasOpticalSize(font) {
	return (
		isVariable(font) &&
		font.opentype.tables.fvar &&
		font.opentype.tables.fvar
			.getSupportedAxes()
			.find(
				(axis) => font.opentype.tables.fvar.getAxis(axis).tag === "opsz"
			) !== undefined
	);
}

export function isHinted(font) {
	// Ideally we should (also) check for hinting data to be present
	// for individual glyphs. For now the presence of these "helper
	// tables" is a good enough indication of a hinted font.
	const hintingTables = ["cvt", "cvar", "fpgm", "hdmx", "VDMX"];
	for (const hintingTable of hintingTables) {
		if (hintingTable in font.opentype.tables) {
			return true;
		}
	}
	// Some (Google) fonts contain a simple `prep` table, which seems
	// to be an artifact of a build/verification process.
	// This is considered a false positive, so we're ignoring `prep`
	// tables with this specific content.
	// Also see https://github.com/googlefonts/fontbakery/issues/3076
	const simplePrep = [184, 1, 255, 133, 176, 4, 141].toString();
	if (
		"prep" in font.opentype.tables &&
		font.opentype.tables.prep.instructions.toString() !== simplePrep
	) {
		return true;
	}
	return false;
}

export function getCharCount(font) {
	// This will need the supportedCharacters logic when that's extracted
	// For now, simplified implementation
	const cmap = getBestCmap(font);
	if (!cmap) return 0;

	let count = 0;
	for (const chunk of cmap) {
		count += chunk.end - chunk.start + 1;
	}
	return count;
}

export function getGlyphCount(font) {
	return font.opentype.tables.maxp.numGlyphs;
}

export function getColorFormats(font) {
	const colorTables = ["COLR", "sbix", "CBDT", "SVG"];
	const tables = font.opentype.directory.map((d) => d.tag.trim());
	return tables.filter((table) => colorTables.includes(table));
}

// Helper function for getBestCmap - will be moved when character analysis is extracted
function getBestCmap(font) {
	const cmapPreferences = [
		[3, 10],
		[0, 6],
		[0, 4],
		[3, 1],
		[0, 3],
		[0, 2],
		[0, 1],
		[0, 0],
	];
	for (const [platformID, platEncID] of cmapPreferences) {
		const cmapSubtable = font.opentype.tables.cmap.getSupportedCharCodes(
			platformID,
			platEncID
		);
		if (cmapSubtable) {
			return cmapSubtable;
		}
	}
	return null;
}
