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
const maxProps = 3;

// Get custom property name with optional namespace
const getCustomPropertyName = (namespace, id) =>
	namespace ? `${namespace}-${id}` : id;

// Poor man's formatting with line breaks
const formatParts = (parts) =>
	parts
		.map((part, index) => {
			if ((index + 1) % maxProps === 0 && index < parts.length - 1) {
				return "\n        " + part;
			}
			return part;
		})
		.join(", ");

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

// Get max alternate count for type 3 lookups
const getMaxAlternates = (lookup) => {
	if (!lookup.alternateCount || lookup.alternateCount.length === 0) {
		return 0;
	}
	return Math.max(...lookup.alternateCount);
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
	if (
		css.variant &&
		(format === "variant" || format === "auto" || format === "both")
	) {
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

		if (format === "both" && css.variant && result) {
			const comment = `/* for older browsers, optionally add: */\n`;
			result = `${result}\n${comment}@supports not (${css.variant}) {\n  ${ffsValue}\n}`;
		} else if (format === "both" && result) {
			result = `${result}\n${ffsValue}`;
		} else {
			result = ffsValue;
		}
	}

	// Comments
	if (comments && featureData.comment) {
		result = `/* ${featureData.comment} */\n${result}`;
	}

	return result;
};

// Return CSS with custom CSS properties
const getWakamaiFondueCSS = (
	feature,
	namespace,
	featureName,
	customPropertyName,
	includeFallback = true
) => {
	const featureIndex = getFeatureIndex(feature);
	const featureData = featureMapping.find((f) => f.tag === featureIndex);

	// If not `font-variant-*` for this, skip
	if (!featureData || !featureData.css.variant) {
		return "";
	}

	const featureShortcut = getCustomPropertyName(namespace, featureName);
	const variantCSS = getFeatureCSS(feature, { format: "variant" });
	const state = "on";
	const ffsValue = `font-feature-settings: "${feature}" ${state};`;

	const fallback = includeFallback
		? `/* for older browsers, optionally add: */
@supports not (${featureData.css.variant}) {
    .${featureShortcut} {
        ${ffsValue}
    }
}

`
		: "\n";

	return `.${featureShortcut} {
    ${variantCSS}
}
${fallback}`;
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

// Get CSS for variabe axis
const getVariableCSS = (font, namespace) => {
	const fvar = font.get("fvar");
	if (!fvar || !fvar.axes || fvar.axes.length === 0) {
		return "";
	}

	const axes = fvar.axes;
	const instances = fvar.instances || {};

	// Build :root with custom properties for each axis
	const rootRules = axes.map((axis) => {
		const propName = getCustomPropertyName(namespace, axis.id);
		return `    --${propName}: ${axis.default};`;
	});

	// Build instance classes
	const instanceClasses = [];
	const instanceDeclarations = [];

	for (const instanceName in instances) {
		const className = getCustomPropertyName(
			namespace,
			slugify(instanceName)
		);
		instanceClasses.push(`.${className}`);

		const axisUpdates = axes.map((axis) => {
			const propName = getCustomPropertyName(namespace, axis.id);
			const value = instances[instanceName][axis.id];
			return `    --${propName}: ${value};`;
		});

		instanceDeclarations.push(`.${className} {
${axisUpdates.join("\n")}
}
`);
	}

	// Build font-variation-settings declaration
	const variationSettingsParts = axes.map((axis) => {
		const propName = getCustomPropertyName(namespace, axis.id);
		return `"${axis.id}" var(--${propName})`;
	});

	const variationSettingsFormatted = formatParts(variationSettingsParts);

	let result = `/**
 * Variable axes
 */

/* Initial values for the variable axes */
:root {
${rootRules.join("\n")}
}

/* Classes to apply the variable instances */
${instanceDeclarations.join("\n")}`;

	if (instanceClasses.length > 0) {
		result += `/* Apply the variable axes set by the classes */
${instanceClasses.join(",\n")} {
    font-variation-settings: ${variationSettingsFormatted};
}
`;
	}

	return result;
};

// Get CSS for layout features
const getFeaturesCSS = (fondue, namespace, opts) => {
	const features = getAvailableFeatures(fondue);
	if (!features.length) {
		return "";
	}

	// Filter features if specific ones are requested
	const featuresToInclude = Array.isArray(opts.include.features)
		? features.filter((f) => opts.include.features.includes(f))
		: features;

	const rootRules = [];
	const featureClasses = [];
	const featureDecParts = [];
	const cssVarDecs = [];

	// Cache featureChars to avoid expensive lookups in the loop
	const allFeatureChars = fondue.featureChars?.["DFLT"]?.["dflt"] || {};

	for (const feature of featuresToInclude) {
		const featureIndex = getFeatureIndex(feature);
		const featureData = {
			...featureMapping.find((f) => f.tag == featureIndex),
		};
		const defaultState = featureData.state;
		const isOnByDefault = defaultState !== "off";

		if (isOnByDefault && !opts.include.includeDefaultOnFeatures) {
			continue;
		}

		const fontFeature = fondue.features.find((f) => f.tag === feature);
		let featureName = fontFeature
			? slugify(fontFeature.uiName || fontFeature.name)
			: feature;

		const numberMatch = feature.match(/^(ss|cv)(\d+)$/);
		if (numberMatch && fontFeature && !fontFeature.uiName) {
			const number = parseInt(numberMatch[2], 10);
			featureName = `${featureName}-${number}`;
		}

		const featureShortcut = getCustomPropertyName(namespace, featureName);
		const customPropertyName = getCustomPropertyName(namespace, feature);

		const wakamaiFondueCSS = opts.include.fontFeatureSettingsOnly
			? ""
			: getWakamaiFondueCSS(
					feature,
					namespace,
					featureName,
					customPropertyName,
					opts.include.fontFeatureFallback
				);
		if (wakamaiFondueCSS) {
			cssVarDecs.push(wakamaiFondueCSS);
		} else {
			const rootValue = isOnByDefault ? "on" : "off";
			rootRules.push(`    --${customPropertyName}: ${rootValue};`);
			featureClasses.push(`.${featureShortcut}`);
			featureDecParts.push(`"${feature}" var(--${customPropertyName})`);

			let featureValue;
			let featureComment = "";

			if (isOnByDefault) {
				featureValue = "off";
				featureComment = " /* Note! This turns the feature off! */";
			} else {
				// Check for type 3 lookups (alternate substitution)
				featureValue = "on";
				const featureChars = allFeatureChars[feature];
				if (featureChars?.lookups) {
					const type3Lookup = featureChars.lookups.find(
						(lookup) => lookup.type === 3
					);
					if (type3Lookup) {
						const maxAlternates = getMaxAlternates(type3Lookup);
						if (maxAlternates > 1) {
							featureValue = "1";
							featureComment = ` /* Use value 1 to ${maxAlternates} for all alternates */`;
						}
					}
				}
			}

			cssVarDecs.push(`.${featureShortcut} {
    --${customPropertyName}: ${featureValue};${featureComment}
}

`);
		}
	}

	if (rootRules.length === 0) {
		return "";
	}

	const featureDecFormatted = formatParts(featureDecParts);

	return `/**
 * OpenType Layout Features
 */

/* Initial values for the layout features */
:root {
${rootRules.join("\n")}
}

/* Classes to apply the layout features */
${cssVarDecs.join("")}/* Apply the layout features set by the classes */
${featureClasses.join(",\n")} {
    font-feature-settings: ${featureDecFormatted};
}

`;
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
			fontFeatureFallback: true,
			fontFeatureSettingsOnly: false,
			features: true,
			includeDefaultOnFeatures: false,
			variables: true,
			...(options.include || {}),
		},
	};

	// Make a 'slug' of the font name and designer to use throughout CSS
	const realName = getSafeName(fondue.summary["Font name"]);
	const realDesigner = getSafeName(
		fondue.summary["Designer"] || fondue.summary["Manufacturer name"] || ""
	);

	// Optional "namespace" to make claases and custom properties unique
	const namespace =
		options.namespace !== undefined ? options.namespace : slugify(realName);

	const sections = [];
	const stylesheetIntro = `/**
 * CSS for ${realName}${realDesigner && ` by ${realDesigner}`}
 *
 * Generated by Wakamai Fondue - https://wakamaifondue.com
 * by Roel Nieskens/PixelAmbacht - https://pixelambacht.nl
 */

`;

	sections.push(stylesheetIntro);

	if (opts.include.fontFace) {
		sections.push(getFontFace(fondue, opts));
	}

	if (opts.include.features) {
		const featureCss = getFeaturesCSS(fondue, namespace, opts);
		if (featureCss !== "") {
			sections.push(featureCss);
		}
	}

	// Variable stuff
	if (opts.include.variables) {
		const varcss = getVariableCSS(fondue, namespace);

		if (varcss !== "") {
			if (sections.length === 0) {
				sections.push(stylesheetIntro);
			}
			sections.push(varcss);
		}
	}

	return sections.join("");
};

const getCSSAsJSON = (font) => {
	return new CssJson().toJSON(getStylesheet(font).replace(/[\n\s]+/g, " "));
};

export default getStylesheet;
export { getFeatureCSS, getCSSAsJSON };
