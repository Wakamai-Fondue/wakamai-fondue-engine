import slugify from "./slugify.js";
import featureMapping from "../features/layout-features.js";
import CssJson from "./css-json.js";

const unnamedFontName = "UNNAMED FONT";

// Get custom property name with optional namespace
const getCustomPropertyName = (namespace, id) =>
	namespace ? `${namespace}-${id}` : id;

// Join parts and wrap at maxLength
const lineWrap = (
	parts,
	{ maxLength = 100, indent = 8, lineStart = "" } = {}
) => {
	const joiner = ", ";
	const indentStr = " ".repeat(indent);
	let result = "";
	let lineLength = lineStart.length;

	parts.forEach((part, index) => {
		const isFirst = index === 0;
		const addition = isFirst ? part : joiner + part;

		if (!isFirst && lineLength + addition.length > maxLength) {
			result += joiner + "\n" + indentStr + part;
			lineLength = indent + part.length;
		} else {
			result += addition;
			lineLength += addition.length;
		}
	});

	return result;
};

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
		? `

/* for older browsers, optionally add: */
@supports not (${featureData.css.variant}) {
    .${featureShortcut} {
        ${ffsValue}
    }
}`
		: "";

	return `.${featureShortcut} {
    ${variantCSS}
}${fallback}`;
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
}`);
	}

	// We want to set weight and width directly, or not at all
	const skipAxes = [
		"wght", // We want `font-weight` instead
		"wdth", // We want `font-stretch` instead
		"opsz", // We want to leave that to the browser
	];

	// Build font-variation-settings for custom axes only
	const variationSettingsParts = axes
		.filter((axis) => !skipAxes.includes(axis.id))
		.map((axis) => {
			const propName = getCustomPropertyName(namespace, axis.id);
			return `"${axis.id}" var(--${propName})`;
		});

	// Build standard axis CSS properties
	const standardAxisProperties = [];
	if (axes.some((a) => a.id === "wght")) {
		const propName = getCustomPropertyName(namespace, "wght");
		standardAxisProperties.push(`    font-weight: var(--${propName});`);
	}
	if (axes.some((a) => a.id === "wdth")) {
		const propName = getCustomPropertyName(namespace, "wdth");
		standardAxisProperties.push(
			`    font-stretch: calc(var(--${propName}) * 1%);`
		);
	}

	let result = `/**
 * Variable axes
 */

/* Initial values for the variable axes */
:root {
${rootRules.join("\n")}
}

/* Classes to apply the variable instances */
${instanceDeclarations.join("\n\n")}`;

	if (instanceClasses.length > 0) {
		const classesFormatted = lineWrap(instanceClasses, { indent: 0 });
		const cssProperties = [...standardAxisProperties];

		if (variationSettingsParts.length > 0) {
			const variationSettingsFormatted = lineWrap(
				variationSettingsParts,
				{
					lineStart: "    font-variation-settings: ",
				}
			);
			cssProperties.push(
				`    font-variation-settings: ${variationSettingsFormatted};`
			);
		}

		result += `

/* Apply the variable axes set by the classes */
${classesFormatted} {
${cssProperties.join("\n")}
}`;
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
}`);
		}
	}

	if (rootRules.length === 0) {
		return "";
	}

	const featureDecFormatted = lineWrap(featureDecParts, {
		lineStart: "    font-feature-settings: ",
	});

	return `/**
 * OpenType Layout Features
 */

/* Initial values for the layout features */
:root {
${rootRules.join("\n")}
}

/* Classes to apply the layout features */
${cssVarDecs.join("\n\n")}

/* Apply the layout features set by the classes */
${lineWrap(featureClasses, { indent: 0 })} {
    font-feature-settings: ${featureDecFormatted};
}`;
};

const getFontFace = (font, opts) => {
	const parts = [];

	parts.push(`    font-family: "${getSafeName(font.summary["Font name"])}";`);
	parts.push(`    src: url("${font.summary["Filename"]}");`);

	// Add font-weight and font-stretch
	if (font.isVariable) {
		const weight = font.variable.axes.find((o) => o.id === "wght");
		if (weight) {
			parts.push(`    font-weight: ${weight.min} ${weight.max};`);
		}

		const width = font.variable.axes.find((o) => o.id === "wdth");
		if (width) {
			parts.push(`    font-stretch: ${width.min}% ${width.max}%;`);
		}
	} else {
		// For non-variable fonts, use OS/2 table values
		const weightClass = font.os2.find((o) => o.key === "usWeightClass");
		if (weightClass) {
			parts.push(`    font-weight: ${weightClass.value};`);
		}

		const widthClass = font.os2.find((o) => o.key === "usWidthClass");
		if (widthClass) {
			// Map usWidthClass (1-9) to font-stretch percentage
			const widthMap = {
				1: 50,
				2: 62.5,
				3: 75,
				4: 87.5,
				5: 100,
				6: 112.5,
				7: 125,
				8: 150,
				9: 200,
			};
			const stretchValue = widthMap[widthClass.value];
			if (stretchValue) {
				parts.push(`    font-stretch: ${stretchValue}%;`);
			}
		}
	}

	// Add Unicode range
	if (opts.include.fontFaceUnicodeRange) {
		const lineStart = "    unicode-range: ";
		const ranges = font.unicodeRange.map((c) => `U+${c}`);
		const formatted = lineWrap(ranges, { lineStart });
		parts.push(`${lineStart}${formatted};`);
	}

	return `@font-face {
${parts.join("\n")}
}`;
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

	const realName = getSafeName(fondue.summary["Font name"]);

	// Optional "namespace" to make claases and custom properties unique
	const namespace =
		options.namespace !== undefined ? options.namespace : slugify(realName);

	const sections = [];
	const stylesheetIntro = `/**
 * CSS for ${realName}
 *
 * Generated by Wakamai Fondue - https://wakamaifondue.com
 * by Roel Nieskens/PixelAmbacht - https://pixelambacht.nl
 */`;

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

	if (opts.include.variables) {
		const varcss = getVariableCSS(fondue, namespace);
		if (varcss !== "") {
			sections.push(varcss);
		}
	}

	return sections.join("\n\n") + "\n";
};

const getCSSAsJSON = (font) => {
	return new CssJson().toJSON(getStylesheet(font).replace(/[\n\s]+/g, " "));
};

export default getStylesheet;
export { getFeatureCSS, getCSSAsJSON };
