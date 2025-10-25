import slugify from "./slugify.js";
import featureMapping from "../features/layout-features.js";
import CssJson from "./css-json.js";

export const CSS_SECTION_FONT_FACE = "font-face";
export const CSS_SECTION_FEATURES = "features";
export const CSS_SECTION_VARIABLES = "variables";
export const BROWSER_SUPPORT_MODERN = "modern";
export const BROWSER_SUPPORT_LEGACY = "legacy";
export const BROWSER_SUPPORT_BOTH = "both";

const unnamedFontName = "UNNAMED FONT";

// Get indexed version, e.g. ss03 → ss##
const getFeatureIndex = (feature) => {
	return feature.replace(/^(ss|cv).*?$/, "$1##");
};

const getSafeName = (name) => {
	if (typeof name === "string" && name.length > 0) {
		return name;
	} else {
		return unnamedFontName;
	}
};

// Get CSS for a single feature
const getFeatureCSS = (featureTag, options = {}) => {
	const { value = 1, format = "auto", comments = false } = options;

	const featureIndex = getFeatureIndex(featureTag);
	const featureData = featureMapping.find((f) => f.tag === featureIndex);

	if (!featureData) {
		console.error(`Unknown feature: ${featureTag}`);
	}

	const { css } = featureData;

	let result = "";

	// Font variant
	if (format === "variant" || (format === "auto" && css.variant)) {
		result = `${css.variant};`;
	}

	// Font feature settings
	if (
		format === "feature-settings" ||
		(format === "auto" && !css.variant) ||
		format === "both"
	) {
		const state = value === 0 ? "off" : value === 1 ? "on" : value;
		const ffsValue = `font-feature-settings: "${featureTag}" ${state};`;
		result =
			format === "both" && result ? `${result}\n${ffsValue}` : ffsValue;
	}

	// Comments
	if (comments && featureData.comment) {
		result = `/* ${featureData.comment} */\n${result}`;
	}

	return result;
};

// Return CSS with custom CSS properties
const getWakamaiFondueCSS = (feature, name) => {
	const featureIndex = getFeatureIndex(feature);
	const featureData = {
		...featureMapping.find((f) => f.tag == featureIndex),
	};
	const featureCSS = featureData.css;

	// We can't take the variable out, or to auto/default or
	// something, so set it to a non-existing feature
	// Thanks Koen!
	const fakeFeature = "____";

	// CSS: font-variant-*
	if (featureCSS.variant) {
		const featureShortcut = `${name}-${feature}`;
		return `@supports (${featureCSS.variant}) {
    .${name}-${feature} {
        --${featureShortcut}: "${fakeFeature}";
        ${featureCSS.variant};
    }
}

`;
	}

	return "";
};

const getAvailableFeatures = (font) => {
	const extraFeatures = new Set();
	const tables = ["GSUB", "GPOS"];
	for (const tab of tables) {
		if (font.get(tab)) {
			const records = font._raw(tab).featureList.featureRecords;
			for (const record of records) {
				extraFeatures.add(record.featureTag);
			}
		}
	}
	return [...extraFeatures];
};

const getVariableCSS = (font) => {
	const cssBlocks = [];
	const maxProps = 6;
	const name = slugify(getSafeName(font.summary["Font name"]));
	const fvar = font.get("fvar");
	const variations = fvar ? fvar.instances : [];

	for (const v in variations) {
		const variation = variations[v];
		const instanceSlug = slugify(v);
		const featureShortcut = `${name}-${instanceSlug}`;

		const settings = [];
		for (const axis of Object.keys(variation)) {
			settings.push(`"${axis}" ${variation[axis]}`);
		}

		const settingsStr = settings
			.map((part, index) => {
				if (
					(index + 1) % maxProps === 0 &&
					index < settings.length - 1
				) {
					return "\n        " + part;
				}
				return part;
			})
			.join(", ");

		cssBlocks.push(`.${featureShortcut} {
    font-variation-settings: ${settingsStr};
}
`);
	}

	// Disabled as this is website-specific
	// if (window.labAxes && window.labAxes !== false) {
	//     const instanceName = 'custom-instance';
	//     css += `.${name}-${instanceName} {\n`;
	//     css += `    font-variation-settings:`;
	//     let glue = ' ';
	//     for (const axis in labAxes) {
	//         css += `${glue}'${axis}' ${labAxes[axis].value}`;
	//         glue = ', ';
	//     }
	//     css += ';';
	//     css += `\n}\n`;
	// }
	return cssBlocks.join("\n");
};

// Linewrap a string of CSS properties divided by ", "
// Note that the tabSize is doubled for consecutive lines
const lineWrap = (str, max = 78, tabSize = 4) => {
	const joiner = ", ";
	const chunks = str.split(joiner);

	const lines = [];
	let line = 0;
	let lineLength = tabSize;

	chunks.forEach((chunk) => {
		if (lineLength + chunk.length + joiner.length >= max) {
			line++;
			lineLength = tabSize * 2;
		} else {
			lineLength += joiner.length;
		}
		lines[line] = lines[line] || [];
		lines[line].push(chunk);
		lineLength += chunk.length;
	});

	let tab = " ".repeat(tabSize);
	let newline = "";

	return lines.map((line) => {
		const formattedLine = `${newline}${tab}${line.join(joiner)}`;
		newline = "\n";
		tab = " ".repeat(tabSize * 2);
		return formattedLine;
	});
};

const getFontFace = (font, opts) => {
	const parts = [];

	parts.push(`    font-family: "${getSafeName(font.summary["Font name"])}";`);
	parts.push(`    src: url("${font.summary["Filename"]}");`);

	// Add variable defaults
	if (font.isVariable) {
		const weight = font.variable.axes.find((o) => o.id === "wght");
		if (weight) {
			parts.push(`    font-weight: ${weight.min} ${weight.max};`);
		}

		const width = font.variable.axes.find((o) => o.id === "wdth");
		if (width) {
			parts.push(`    font-stretch: ${width.min}% ${width.max}%;`);
		}
	}

	// Add Unicode range
	if (opts.include.fontFaceUnicodeRange) {
		const cssFormattedRanges = font.unicodeRange
			.map((c) => `U+${c}`)
			.join(", ");
		const unicodeRange = `unicode-range: ${cssFormattedRanges};`;
		parts.push(lineWrap(unicodeRange).join(""));
	}

	return `@font-face {
${parts.join("\n")}
}

`;
};

const getStylesheet = (fondue, options = {}) => {
	// Merge user options with defaults
	const opts = {
		include: {
			fontFace: true,
			fontFaceUnicodeRange: true,
			features: true,
			variables: true,
			...(options.include || {}),
		},
	};

	// Skip features for now
	const features = getAvailableFeatures(fondue);
	// Make a 'slug' of the font name to use throughout CSS
	const realName = getSafeName(fondue.summary["Font name"]);
	const name = slugify(realName);

	const sections = [];
	const stylesheetIntro = `/**
 * CSS for ${realName}
 * Generated by Wakamai Fondue - https://wakamaifondue.com
 * by Roel Nieskens/PixelAmbacht - https://pixelambacht.nl
 */

`;

	sections.push(stylesheetIntro);

	if (opts.include.fontFace) {
		sections.push(getFontFace(fondue, opts));
	}

	if (opts.include.features && features.length) {
		// Filter features if specific ones are requested
		const featuresToInclude = Array.isArray(opts.include.features)
			? features.filter((f) => opts.include.features.includes(f))
			: features;

		// Layout stuff
		const rootrules = [];
		const featureclasses = [];
		const featuredecParts = [];
		const cssvardecs = [];
		const maxProps = 3;

		for (const feature of featuresToInclude) {
			const featureIndex = getFeatureIndex(feature);
			const featureData = {
				...featureMapping.find((f) => f.tag == featureIndex),
			};
			const defaultState = featureData.state;

			if (defaultState !== "off") {
				continue;
			}

			const featureShortcut = `${name}-${feature}`;

			rootrules.push(
				`    --${featureShortcut}: "${feature}" ${defaultState};`
			);
			featureclasses.push(`.${featureShortcut}`);
			featuredecParts.push(`var(--${featureShortcut})`);

			cssvardecs.push(`.${featureShortcut} {
    --${featureShortcut}: "${feature}" on;
}

${getWakamaiFondueCSS(feature, name)}`);
		}

		if (rootrules.length > 0) {
			// Format font-feature-settings with proper line breaks
			const featuredecFormatted = featuredecParts
				.map((part, index) => {
					if (
						(index + 1) % maxProps === 0 &&
						index < featuredecParts.length - 1
					) {
						return "\n        " + part;
					}
					return part;
				})
				.join(", ");

			sections.push(`/* Set custom properties for each layout feature */
:root {
${rootrules.join("\n")}
}

/* If class is applied, update custom property and
   apply modern font-variant-* when supported */
${cssvardecs.join("")}
/* Apply current state of all custom properties
   whenever a class is being applied */
${featureclasses.join(",\n")} {
    font-feature-settings: ${featuredecFormatted};
}

`);
		}
	}

	// Variable stuff
	if (opts.include.variables) {
		const varcss = getVariableCSS(fondue);

		if (varcss !== "") {
			if (sections.length === 0) {
				sections.push(stylesheetIntro);
			}
			sections.push(`/* Variable instances */
${varcss}`);
		}
	}

	return sections.join("");
};

const getCSSAsJSON = (font) => {
	return new CssJson().toJSON(getStylesheet(font).replace(/[\n\s]+/g, " "));
};

export default getStylesheet;
export { getFeatureCSS, getCSSAsJSON };
