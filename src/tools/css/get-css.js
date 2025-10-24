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

// Return CSS with custom CSS properties
const getFeatureCSS = (feature, name) => {
	const featureIndex = getFeatureIndex(feature);
	const featureData = {
		...featureMapping.find((f) => f.tag == featureIndex),
	};
	const featureCSS = featureData.css;

	let css = "";
	// We can't take the variable out, or to auto/default or
	// something, so set it to a non-existing feature
	// Thanks Koen!
	const fakeFeature = "____";

	// CSS: font-variant-*
	if (featureCSS.variant) {
		const featureShortcut = `${name}-${feature}`;
		css = css + `@supports (${featureCSS.variant}) {\n`;
		css = css + `    .${name}-${feature} {\n`;
		css = css + `        --${featureShortcut}: "${fakeFeature}";\n`;
		css = css + `        ${featureCSS.variant};\n`;
		css = css + "    }\n";
		css = css + "}\n\n";
	}

	return css;
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
	let css = "";
	let maxProps = 6;
	const name = slugify(getSafeName(font.summary["Font name"]));
	const fvar = font.get("fvar");
	const variations = fvar ? fvar.instances : [];
	for (const v in variations) {
		let propCounter = 2; // First line of props should be shorter
		const variation = variations[v];
		const instanceSlug = slugify(v);
		const featureShortcut = `${name}-${instanceSlug}`;
		css = css + `.${featureShortcut} {\n`;
		css = css + "    font-variation-settings:";
		let glue = " ";
		for (const axis of Object.keys(variation)) {
			css = css + `${glue}"${axis}" ${variation[axis]}`;
			glue = ", ";
			// Poor man's code formatting
			if (++propCounter % maxProps === 0) {
				glue = `,\n        `;
			}
		}
		css = css + ";";
		css = css + "\n}\n\n";
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
	return css;
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

const getFontFace = (font) => {
	let fontface = "@font-face {\n";

	fontface += `    font-family: "${getSafeName(
		font.summary["Font name"]
	)}";\n`;
	fontface += `    src: url("${font.summary["Filename"]}");\n`;

	// Add variable defaults
	if (font.isVariable) {
		const weight = font.variable.axes.find((o) => o.id === "wght");
		if (weight) {
			fontface += `    font-weight: ${weight.min} ${weight.max};\n`;
		}

		const width = font.variable.axes.find((o) => o.id === "wdth");
		if (width) {
			fontface += `    font-stretch: ${width.min}% ${width.max}%;\n`;
		}
	}

	// Add Unicode range
	const cssFormattedRanges = font.unicodeRange
		.map((c) => `U+${c}`)
		.join(", ");
	const unicodeRange = `unicode-range: ${cssFormattedRanges};\n`;
	fontface += lineWrap(unicodeRange);

	fontface += "}\n\n";

	return fontface;
};

const getCSS = (fondue, ...exclude) => {
	// Skip features for now
	const features = getAvailableFeatures(fondue);
	// Make a 'slug' of the font name to use throughout CSS
	const realName = getSafeName(fondue.summary["Font name"]);
	const name = slugify(realName);

	let stylesheet = "";
	const stylesheetIntro =
		"/**\n" +
		` * CSS for ${realName}\n` +
		" * Generated by Wakamai Fondue - https://wakamaifondue.com\n" +
		" * by Roel Nieskens/PixelAmbacht - https://pixelambacht.nl\n" +
		" */\n\n";

	stylesheet = stylesheet + stylesheetIntro;

	if (!exclude.includes(CSS_SECTION_FONT_FACE)) {
		stylesheet = stylesheet + getFontFace(fondue);
	}

	if (features.length) {
		// Layout stuff
		let rootrules = "";
		let featureclasses = "";
		let featuredec = "font-feature-settings:";
		let featuredecGlue = " ";
		let cssvardecs = "";
		let propCounter = 1; // First line of props should be shorter
		let maxProps = 3;

		for (const feature of features) {
			const featureIndex = getFeatureIndex(feature);
			const featureData = {
				...featureMapping.find((f) => f.tag == featureIndex),
			};
			const defaultState = featureData.state;

			if (defaultState !== "off") {
				continue;
			}

			const featureShortcut = `${name}-${feature}`;

			rootrules =
				rootrules +
				`    --${featureShortcut}: "${feature}" ${defaultState};\n`;

			featureclasses = featureclasses + `.${featureShortcut},\n`;

			featuredec =
				featuredec + `${featuredecGlue}var(--${featureShortcut})`;

			cssvardecs = cssvardecs + `.${featureShortcut} {\n`;
			cssvardecs =
				cssvardecs + `    --${featureShortcut}: "${feature}" on;\n`;
			cssvardecs = cssvardecs + "}\n\n";

			cssvardecs = cssvardecs + getFeatureCSS(feature, name);

			if (++propCounter % maxProps === 0) {
				featuredecGlue = ",\n        ";
			} else {
				featuredecGlue = ", ";
			}
		}

		if (rootrules !== "") {
			rootrules = rootrules + "}\n";
			featuredec = featuredec + ";";

			featureclasses = featureclasses.replace(/,\n(?!.*,)/gim, "");

			stylesheet =
				stylesheet +
				"/* Set custom properties for each layout feature */\n";
			stylesheet = stylesheet + ":root {\n";
			stylesheet = stylesheet + `${rootrules}\n`;

			stylesheet =
				stylesheet +
				"/* If class is applied, update custom property and\n";
			stylesheet =
				stylesheet +
				"   apply modern font-variant-* when supported */\n";
			stylesheet = stylesheet + `${cssvardecs}`;

			stylesheet =
				stylesheet +
				"/* Apply current state of all custom properties\n";
			stylesheet =
				stylesheet + "   whenever a class is being applied */\n";
			stylesheet = stylesheet + `${featureclasses} {\n`;
			stylesheet = stylesheet + `    ${featuredec}\n`;
			stylesheet = stylesheet + "}\n\n";
		}
	}

	// Variable stuff
	let varcss = "";
	varcss = varcss + getVariableCSS(fondue);

	if (varcss !== "") {
		if (stylesheet === "") {
			stylesheet = stylesheet + stylesheetIntro;
		}
		stylesheet = stylesheet + "/* Variable instances */\n";
		stylesheet = stylesheet + varcss;
	}

	return stylesheet;
};

const getCSSAsJSON = (font) => {
	return new CssJson().toJSON(getCSS(font).replace(/[\n\s]+/g, " "));
};

export default getCSS;
export { getCSSAsJSON };
