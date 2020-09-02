// OpenType Layout Features
//
// Based on "Enabling Typography: towards a general model of
// OpenType Layout" by John Hudson, Tiro Typeworks
//
// Features appear in recommended processing and font order
//
// Regarding state:
// fixed: on by default, cannot be turned off
// on:    on by default, can be turned off
// off:   off by default, can be turned on

const layoutFeatures = {
	locl: {
		name: "Localized Forms",
		css: {
			feature: 'font-feature-settings: "locl"',
			variant: null,
		},
		state: "fixed",
		category: "Default glyph pre-processing",
	},
	rvrn: {
		name: "Required Variation Alternates",
		css: {
			feature: 'font-feature-settings: "rvrn"',
			variant: null,
		},
		comment:
			"This feature is used in fonts that support OpenType Font Variations in order to select alternate glyphs for particular variation instances.",
		state: "fixed",
		category: "Default glyph pre-processing",
	},
	hngl: {
		name: "Hangul",
		css: {
			feature: 'font-feature-settings: "hngl"',
			variant: null,
		},
		comment: "Korean only",
		state: "fixed",
		category: "Default glyph pre-processing",
	},
	hojo: {
		name: "Hojo Kanji Forms (JIS X 0212-1990 Kanji Forms)",
		css: {
			feature: 'font-feature-settings: "hojo"',
			variant: null,
		},
		comment: "Japanese only",
		state: "fixed",
		category: "Default glyph pre-processing",
	},
	jp04: {
		name: "JIS2004 Forms",
		css: {
			feature: 'font-feature-settings: "jp04"',
			variant: null,
		},
		comment: "Japanese only",
		state: "fixed",
		category: "Default glyph pre-processing",
	},
	jp78: {
		name: "JIS78 Forms",
		css: {
			feature: 'font-feature-settings: "jp78"',
			variant: null,
		},
		comment: "Japanese only",
		state: "fixed",
		category: "Default glyph pre-processing",
	},
	jp83: {
		name: "JIS83 Forms",
		css: {
			feature: 'font-feature-settings: "jp83"',
			variant: null,
		},
		comment: "Japanese only",
		state: "fixed",
		category: "Default glyph pre-processing",
	},
	jp90: {
		name: "JIS90 Forms",
		css: {
			feature: 'font-feature-settings: "jp90"',
			variant: null,
		},
		comment: "Japanese only",
		state: "fixed",
		category: "Default glyph pre-processing",
	},
	nlck: {
		name: "NLC Kanji Forms",
		css: {
			feature: 'font-feature-settings: "nlck"',
			variant: null,
		},
		comment: "Japanese only",
		state: "fixed",
		category: "Default glyph pre-processing",
	},
	smpl: {
		name: "Simplified Forms",
		css: {
			feature: 'font-feature-settings: "smpl"',
			variant: null,
		},
		state: "fixed",
		category: "Default glyph pre-processing",
	},
	tnam: {
		name: "Traditional Name Forms",
		css: {
			feature: 'font-feature-settings: "tnam"',
			variant: null,
		},
		comment: "Japanese only",
		state: "fixed",
		category: "Default glyph pre-processing",
	},
	trad: {
		name: "Traditional Forms",
		css: {
			feature: 'font-feature-settings: "trad"',
			variant: null,
		},
		state: "fixed",
		category: "Default glyph pre-processing",
	},
	ltrm: {
		name: "Left-to-right mirrored forms",
		css: {
			feature: 'font-feature-settings: "ltrm"',
			variant: null,
		},
		state: "fixed",
		category: "Default glyph pre-processing",
	},
	ltra: {
		name: "Left-to-right alternates",
		css: {
			feature: 'font-feature-settings: "ltra"',
			variant: null,
		},
		state: "fixed",
		category: "Default glyph pre-processing",
	},
	rtlm: {
		name: "Right-to-left mirrored forms",
		css: {
			feature: 'font-feature-settings: "rtlm"',
			variant: null,
		},
		state: "fixed",
		category: "Default glyph pre-processing",
	},
	rtla: {
		name: "Right-to-left alternates",
		css: {
			feature: 'font-feature-settings: "rtla"',
			variant: null,
		},
		state: "fixed",
		category: "Default glyph pre-processing",
	},
	ccmp: {
		name: "Glyph Composition / Decomposition",
		css: {
			feature: 'font-feature-settings: "ccmp"',
			variant: null,
		},
		state: "fixed",
		category: "Default glyph pre-processing",
	},
	stch: {
		name: "Stretching Glyph Decomposition",
		css: {
			feature: 'font-feature-settings: "stch"',
			variant: null,
		},
		state: "fixed",
		category: "Default glyph pre-processing",
	},
	nukt: {
		name: "Nukta Forms",
		css: {
			feature: 'font-feature-settings: "nukt"',
			variant: null,
		},
		comment: "Indic only",
		state: "fixed",
		category: "Default glyph pre-processing",
	},
	akhn: {
		name: "Akhands",
		css: {
			feature: 'font-feature-settings: "akhn"',
			variant: null,
		},
		comment: "Indic only",
		state: "fixed",
		category: "Default glyph pre-processing",
	},
	rphf: {
		name: "Reph Forms",
		css: {
			feature: 'font-feature-settings: "rphf"',
			variant: null,
		},
		comment: "South and Southeast Asian scripts; triggers reordering",
		state: "fixed",
		category: "Orthographic unit shaping",
	},
	pref: {
		name: "Pre-Base forms,",
		css: {
			feature: 'font-feature-settings: "pref"',
			variant: null,
		},
		comment: "South and Southeast Asian scripts; triggers reordering",
		state: "fixed",
		category: "Orthographic unit shaping",
	},
	rkrf: {
		name: "Rakar Forms",
		css: {
			feature: 'font-feature-settings: "rkrf"',
			variant: null,
		},
		comment: "South and Southeast Asian scripts",
		state: "fixed",
		category: "Orthographic unit shaping",
	},
	abvf: {
		name: "Above-base Forms",
		css: {
			feature: 'font-feature-settings: "abvf"',
			variant: null,
		},
		comment: "South and Southeast Asian scripts",
		state: "fixed",
		category: "Orthographic unit shaping",
	},
	blwf: {
		name: "Below-base Forms",
		css: {
			feature: 'font-feature-settings: "blwf"',
			variant: null,
		},
		comment: "South and Southeast Asian scripts",
		state: "fixed",
		category: "Orthographic unit shaping",
	},
	half: {
		name: "Half Forms",
		css: {
			feature: 'font-feature-settings: "half"',
			variant: null,
		},
		comment: "South and Southeast Asian scripts",
		state: "fixed",
		category: "Orthographic unit shaping",
	},
	pstf: {
		name: "Post-base Forms",
		css: {
			feature: 'font-feature-settings: "pstf"',
			variant: null,
		},
		comment: "South and Southeast Asian scripts",
		state: "fixed",
		category: "Orthographic unit shaping",
	},
	vatu: {
		name: "Vattu Variants",
		css: {
			feature: 'font-feature-settings: "vatu"',
			variant: null,
		},
		comment:
			"Used, inconsistently, instead of <rkrf> for some Indic scripts",
		state: "fixed",
		category: "Orthographic unit shaping",
	},
	cfar: {
		name: "Conjunct Form After Ro",
		css: {
			feature: 'font-feature-settings: "cfar"',
			variant: null,
		},
		comment: "Currently Khmer only",
		state: "fixed",
		category: "Orthographic unit shaping",
	},
	cjct: {
		name: "Conjunct Forms",
		css: {
			feature: 'font-feature-settings: "cjct"',
			variant: null,
		},
		comment: "South and Southeast Asian scripts",
		state: "fixed",
		category: "Orthographic unit shaping",
	},
	med2: {
		name: "Medial Forms 2",
		css: {
			feature: 'font-feature-settings: "med2"',
			variant: null,
		},
		comment:
			"Currently Syriac only; see discussion of topographical features",
		state: "fixed",
		category: "Orthographic unit shaping",
	},
	fin2: {
		name: "Terminal Forms 2",
		css: {
			feature: 'font-feature-settings: "fin2"',
			variant: null,
		},
		comment:
			"Currently Syriac only; see discussion of topographical features",
		state: "fixed",
		category: "Orthographic unit shaping",
	},
	fin3: {
		name: "Terminal Forms 3",
		css: {
			feature: 'font-feature-settings: "fin3"',
			variant: null,
		},
		comment:
			"Currently Syriac only; see discussion of topographical features",
		state: "fixed",
		category: "Orthographic unit shaping",
	},
	ljmo: {
		name: "Leading Jamo Forms",
		css: {
			feature: 'font-feature-settings: "ljmo"',
			variant: null,
		},
		comment: "Korean only",
		state: "fixed",
		category: "Orthographic unit shaping",
	},
	vjmo: {
		name: "Vowel Jamo Forms",
		css: {
			feature: 'font-feature-settings: "vjmo"',
			variant: null,
		},
		comment: "Korean only",
		state: "fixed",
		category: "Orthographic unit shaping",
	},
	tjmo: {
		name: "Trailing Jamo Forms",
		css: {
			feature: 'font-feature-settings: "tjmo"',
			variant: null,
		},
		comment: "Korean only",
		state: "fixed",
		category: "Orthographic unit shaping",
	},
	abvs: {
		name: "Above-base Substitutions",
		css: {
			feature: 'font-feature-settings: "abvs"',
			variant: null,
		},
		state: "fixed",
		category: "Standard typographic presentation",
	},
	blws: {
		name: "Below-base Substitutions",
		css: {
			feature: 'font-feature-settings: "blws"',
			variant: null,
		},
		state: "fixed",
		category: "Standard typographic presentation",
	},
	calt: {
		name: "Contextual Alternates",
		css: {
			feature: 'font-feature-settings: "calt"',
			variant: "font-variant-ligatures: contextual",
		},
		state: "on",
		category: "Standard typographic presentation",
	},
	clig: {
		name: "Contextual Ligatures",
		css: {
			feature: 'font-feature-settings: "clig"',
			variant: null,
		},
		state: "on",
		category: "Standard typographic presentation",
	},
	fina: {
		name: "Terminal Forms",
		css: {
			feature: 'font-feature-settings: "fina"',
			variant: null,
		},
		comment:
			'May be "Orthographic unit shaping" for some writing systems; see discussion of topographical features',
		state: "fixed",
		category: "Standard typographic presentation",
	},
	haln: {
		name: "Halant Forms",
		css: {
			feature: 'font-feature-settings: "haln"',
			variant: null,
		},
		state: "fixed",
		category: "Standard typographic presentation",
	},
	init: {
		name: "Initial Forms",
		css: {
			feature: 'font-feature-settings: "init"',
			variant: null,
		},
		comment:
			'May be "Orthographic unit shaping" for some writing systems; see discussion of topographical features',
		state: "fixed",
		category: "Standard typographic presentation",
	},
	isol: {
		name: "Isolated Forms",
		css: {
			feature: 'font-feature-settings: "isol"',
			variant: null,
		},
		comment:
			'May be "Orthographic unit shaping" for some writing systems; see discussion of topographical features',
		state: "fixed",
		category: "Standard typographic presentation",
	},
	jalt: {
		name: "Justification Alternates",
		css: {
			feature: 'font-feature-settings: "jalt"',
			variant: null,
		},
		comment:
			'Could be considered "Discretionary typographic presentation" if not applied by standard justification algorithms',
		state: "on",
		category: "Standard typographic presentation",
	},
	liga: {
		name: "Standard Ligatures",
		css: {
			feature: 'font-feature-settings: "liga"',
			variant: null,
		},
		state: "on",
		category: "Standard typographic presentation",
	},
	medi: {
		name: "Medial Forms",
		css: {
			feature: 'font-feature-settings: "medi"',
			variant: null,
		},
		comment:
			'May be "Orthographic unit shaping" for some writing systems; see discussion of topographical features',
		state: "fixed",
		category: "Standard typographic presentation",
	},
	mset: {
		name: "Mark Positioning via Substitution",
		css: {
			feature: 'font-feature-settings: "mset"',
			variant: null,
		},
		comment: "Legacy feature, superceded by <mark>",
		state: "fixed",
		category: "Standard typographic presentation",
	},
	pres: {
		name: "Pre-base Substitutions",
		css: {
			feature: 'font-feature-settings: "pres"',
			variant: null,
		},
		state: "fixed",
		category: "Standard typographic presentation",
	},
	psts: {
		name: "Post-base Substitutions",
		css: {
			feature: 'font-feature-settings: "psts"',
			variant: null,
		},
		state: "fixed",
		category: "Standard typographic presentation",
	},
	rand: {
		name: "Randomize",
		css: {
			feature: 'font-feature-settings: "rand"',
			variant: null,
		},
		state: "on",
		category: "Standard typographic presentation",
	},
	rclt: {
		name: "Required Contextual Forms",
		css: {
			feature: 'font-feature-settings: "rclt"',
			variant: null,
		},
		state: "fixed",
		category: "Standard typographic presentation",
	},
	rlig: {
		name: "Required Ligatures",
		css: {
			feature: 'font-feature-settings: "rlig"',
			variant: null,
		},
		state: "fixed",
		category: "Standard typographic presentation",
	},
	vert: {
		name: "Vertical Writing",
		css: {
			feature: 'font-feature-settings: "vert"',
			variant: null,
		},
		comment:
			"Applied based on text layout; use this or <vrt2>, not both; UTR50 implementation",
		state: "fixed",
		category: "Standard typographic presentation",
	},
	vrt2: {
		name: "Vertical Alternates and Rotation",
		css: {
			feature: 'font-feature-settings: "vrt2"',
			variant: null,
		},
		comment: "Applied based on text layout; use this or <vert>, not both",
		state: "fixed",
		category: "Standard typographic presentation",
	},
	afrc: {
		name: "Alternative Fractions",
		css: {
			feature: 'font-feature-settings: "afrc"',
			variant: "font-variant-numeric: stacked-fractions",
		},
		state: "off",
		category: "Discretionary typographic presentation",
	},
	c2pc: {
		name: "Petite Capitals From Capitals",
		css: {
			feature: 'font-feature-settings: "c2pc"',
			variant: null,
		},
		state: "off",
		category: "Discretionary typographic presentation",
	},
	c2sc: {
		name: "Small Capitals From Capitals",
		css: {
			feature: 'font-feature-settings: "c2sc"',
			variant: null,
		},
		state: "off",
		category: "Discretionary typographic presentation",
	},
	case: {
		name: "Case-Sensitive Forms",
		css: {
			feature: 'font-feature-settings: "case"',
			variant: null,
		},
		comment:
			'Could be "Standard typographic presentation" if applied heuristically',
		state: "off",
		category: "Discretionary typographic presentation",
	},
	cpct: {
		name: "Centered CJK Punctuation Mostly CJKV fonts",
		css: {
			feature: 'font-feature-settings: "cpct"',
			variant: null,
		},
		state: "off",
		category: "Discretionary typographic presentation",
	},
	cpsp: {
		name: "Capital Spacing",
		css: {
			feature: 'font-feature-settings: "cpsp"',
			variant: null,
		},
		comment:
			'Could be considered "Standard typographic presentation" if applied heuristically',
		state: "off",
		category: "Discretionary typographic presentation",
	},
	cswh: {
		name: "Contextual Swash",
		css: {
			feature: 'font-feature-settings: "cswh"',
			variant: null, // todo font-variant-alternates
		},
		comment: "Probably redundant feature",
		state: "off",
		category: "Discretionary typographic presentation",
	},
	"cv##": {
		name: "Character Variants",
		css: {
			feature: 'font-feature-settings: "cv##"',
			variant: null, // todo font-variant-alternates
		},
		"range-start": 0,
		"range-end": 99,
		state: "off",
		category: "Discretionary typographic presentation",
	},
	dlig: {
		name: "Discretionary Ligatures",
		css: {
			feature: 'font-feature-settings: "dlig"',
			variant: "font-variant-ligatures: discretionary-ligatures",
		},
		state: "off",
		category: "Discretionary typographic presentation",
	},
	dnom: {
		name: "Denominators",
		css: {
			feature: 'font-feature-settings: "dnom"',
			variant: null,
		},
		comment: "Mostly superceded by contextual <frac> implementations",
		state: "off",
		category: "Discretionary typographic presentation",
	},
	expt: {
		name: "Expert Forms Currently Japanese only",
		css: {
			feature: 'font-feature-settings: "expt"',
			variant: null,
		},
		state: "off",
		category: "Discretionary typographic presentation",
	},
	falt: {
		name: "Final Glyph on Line Alternates",
		css: {
			feature: 'font-feature-settings: "falt"',
			variant: null,
		},
		comment:
			'Might be considered "Standard typographic presentation" in some implementations',
		state: "off",
		category: "Discretionary typographic presentation",
	},
	frac: {
		name: "Fractions",
		css: {
			feature: 'font-feature-settings: "frac"',
			variant: "font-variant-numeric: diagonal-fractions",
		},
		comment:
			'Could be considered "Standard typographic presentation" if applied heuristically',
		state: "off",
		category: "Discretionary typographic presentation",
	},
	fwid: {
		name: "Full Widths Mostly CJKV fonts",
		css: {
			feature: 'font-feature-settings: "fwid"',
			variant: null,
		},
		state: "off",
		category: "Discretionary typographic presentation",
	},
	halt: {
		name: "Alternate Half Widths See also <vhal> positioning",
		css: {
			feature: 'font-feature-settings: "halt"',
			variant: null,
		},
		state: "off",
		category: "Discretionary typographic presentation",
	},
	hist: {
		name: "Historical Forms",
		css: {
			feature: 'font-feature-settings: "hist"',
			variant: "font-variant-alternates: historical-forms",
		},
		state: "off",
		category: "Discretionary typographic presentation",
	},
	hkna: {
		name: "Horizontal Kana Alternates",
		css: {
			feature: 'font-feature-settings: "hkna"',
			variant: null,
		},
		comment:
			"Currently Japanese kana only; could be applied automatically based on text layout;  cf. <vkna> vertical equivalent",
		state: "off",
		category: "Discretionary typographic presentation",
	},
	hlig: {
		name: "Historical Ligatures",
		css: {
			feature: 'font-feature-settings: "hlig"',
			variant: "font-variant-ligatures: historical-ligatures",
		},
		comment: "Probably redundant feature",
		state: "off",
		category: "Discretionary typographic presentation",
	},
	hwid: {
		name: "Half Widths",
		css: {
			feature: 'font-feature-settings: "hwid"',
			variant: null,
		},
		state: "off",
		category: "Discretionary typographic presentation",
	},
	ital: {
		name: "Italics",
		css: {
			feature: 'font-feature-settings: "ital"',
			variant: null,
		},
		comment: "Mostly CJKV fonts; alternative to TTC/OTC implementation",
		state: "off",
		category: "Discretionary typographic presentation",
	},
	lnum: {
		name: "Lining Figures",
		css: {
			feature: 'font-feature-settings: "lnum"',
			variant: "font-variant-numeric: lining-nums",
		},
		state: "off",
		category: "Discretionary typographic presentation",
	},
	mgrk: {
		name: "Mathematical Greek",
		css: {
			feature: 'font-feature-settings: "mgrk"',
			variant: null,
		},
		state: "off",
		category: "Discretionary typographic presentation",
	},
	nalt: {
		name: "Alternate Annotation Forms",
		css: {
			feature: 'font-feature-settings: "nalt"',
			variant: null, // todo font-variant-alternates
		},
		state: "off",
		category: "Discretionary typographic presentation",
	},
	numr: {
		name: "Numerators",
		css: {
			feature: 'font-feature-settings: "numr"',
			variant: null,
		},
		comment: "Mostly superceded by contextual <frac> implementations",
		state: "off",
		category: "Discretionary typographic presentation",
	},
	onum: {
		name: "Oldstyle Figures",
		css: {
			feature: 'font-feature-settings: "onum"',
			variant: "font-variant-numeric: oldstyle-nums",
		},
		state: "off",
		category: "Discretionary typographic presentation",
	},
	ordn: {
		name: "Ordinals",
		css: {
			feature: 'font-feature-settings: "ordn"',
			variant: "font-variant-numeric: ordinal",
		},
		state: "off",
		category: "Discretionary typographic presentation",
	},
	ornm: {
		name: "Ornaments",
		css: {
			feature: 'font-feature-settings: "ornm"',
			variant: null, // todo font-variant-alternates
		},
		state: "off",
		category: "Discretionary typographic presentation",
	},
	palt: {
		name: "Proportional Alternate Widths",
		css: {
			feature: 'font-feature-settings: "palt"',
			variant: null,
		},
		comment: "Mostly CJKV fonts; see also <vpal> positioning",
		state: "off",
		category: "Discretionary typographic presentation",
	},
	pcap: {
		name: "Petite Capitals",
		css: {
			feature: 'font-feature-settings: "pcap"',
			variant: "font-variant-caps: petite-caps",
		},
		state: "off",
		category: "Discretionary typographic presentation",
	},
	pkna: {
		name: "Proportional Kana",
		css: {
			feature: 'font-feature-settings: "pkna"',
			variant: null,
		},
		comment: "Japanese kana only",
		state: "off",
		category: "Discretionary typographic presentation",
	},
	pnum: {
		name: "Proportional Figures",
		css: {
			feature: 'font-feature-settings: "pnum"',
			variant: "font-variant-numeric: proportional-nums",
		},
		state: "off",
		category: "Discretionary typographic presentation",
	},
	pwid: {
		name: "Proportional Widths",
		css: {
			feature: 'font-feature-settings: "pwid"',
			variant: null,
		},
		comment: "Mostly CJKV fonts",
		state: "off",
		category: "Discretionary typographic presentation",
	},
	qwid: {
		name: "Quarter Widths",
		css: {
			feature: 'font-feature-settings: "qwid"',
			variant: null,
		},
		comment: "Mostly CJKV fonts",
		state: "off",
		category: "Discretionary typographic presentation",
	},
	ruby: {
		name: "Ruby Notation Forms",
		css: {
			feature: 'font-feature-settings: "ruby"',
			variant: null,
		},
		state: "off",
		category: "Discretionary typographic presentation",
	},
	salt: {
		name: "Stylistic Alternates",
		css: {
			feature: 'font-feature-settings: "salt"',
			variant: null, // todo font-variant-alternates
		},
		state: "off",
		category: "Discretionary typographic presentation",
	},
	sinf: {
		name: "Scientific Inferiors",
		css: {
			feature: 'font-feature-settings: "sinf"',
			variant: null,
		},
		comment: "Redundant feature, superceded by typical use of <subs>",
		state: "off",
		category: "Discretionary typographic presentation",
	},
	smcp: {
		name: "Small Capitals",
		css: {
			feature: 'font-feature-settings: "smcp"',
			variant: "font-variant-caps: small-caps",
		},
		state: "off",
		category: "Discretionary typographic presentation",
	},
	"ss##": {
		name: "Stylistic Set",
		css: {
			feature: 'font-feature-settings: "ss##"',
			variant: null, // todo font-variant-alternates
		},
		"range-start": 0,
		"range-end": 20,
		state: "off",
		category: "Discretionary typographic presentation",
	},
	subs: {
		name: "Subscript",
		css: {
			feature: 'font-feature-settings: "subs"',
			variant: "font-variant-position: sub",
		},
		state: "off",
		category: "Discretionary typographic presentation",
	},
	sups: {
		name: "Superscript",
		css: {
			feature: 'font-feature-settings: "sups"',
			variant: "font-variant-position: super",
		},
		state: "off",
		category: "Discretionary typographic presentation",
	},
	swsh: {
		name: "Swash",
		css: {
			feature: 'font-feature-settings: "swsh"',
			variant: null, // todo font-variant-alternates
		},
		state: "off",
		category: "Discretionary typographic presentation",
	},
	titl: {
		name: "Titling",
		css: {
			feature: 'font-feature-settings: "titl"',
			variant: "font-variant-caps: titling-caps",
		},
		state: "off",
		category: "Discretionary typographic presentation",
	},
	tnum: {
		name: "Tabular Figures",
		css: {
			feature: 'font-feature-settings: "tnum"',
			variant: "font-variant-numeric: tabular-nums",
		},
		state: "off",
		category: "Discretionary typographic presentation",
	},
	twid: {
		name: "Third Widths",
		css: {
			feature: 'font-feature-settings: "twid"',
			variant: null,
		},
		comment: "Mostly CJKV fonts",
		state: "off",
		category: "Discretionary typographic presentation",
	},
	unic: {
		name: "Unicase",
		css: {
			feature: 'font-feature-settings: "unic"',
			variant: "font-variant-caps: unicase",
		},
		state: "off",
		category: "Discretionary typographic presentation",
	},
	vkna: {
		name: "Vertical Kana Alternates",
		css: {
			feature: 'font-feature-settings: "vkna"',
			variant: null,
		},
		comment:
			"Currently Japanese kana only; could be applied automatically based on text layout; cf. <hkna> horizontal equivalent",
		state: "off",
		category: "Discretionary typographic presentation",
	},
	zero: {
		name: "Slashed Zero",
		css: {
			feature: 'font-feature-settings: "zero"',
			variant: "font-variant-numeric: slashed-zero",
		},
		state: "off",
		category: "Discretionary typographic presentation",
	},
	opbd: {
		name: "Optical Bounds",
		css: {
			feature: 'font-feature-settings: "opbd"',
			variant: null,
		},
		comment:
			"Applied as part of optical margin alignment; probably redundant, see <lfbd> & <rtbd>",
		state: "off",
		category: "Positioning",
	},
	lfbd: {
		name: "Left Bounds",
		css: {
			feature: 'font-feature-settings: "lfbd"',
			variant: null,
		},
		comment: "Applied as part of optical margin alignment",
		state: "off",
		category: "Positioning",
	},
	rtbd: {
		name: "Right Bounds",
		css: {
			feature: 'font-feature-settings: "rtbd"',
			variant: null,
		},
		comment: "Applied as part of optical margin alignment",
		state: "off",
		category: "Positioning",
	},
	valt: {
		name: "Alternate Vertical Metrics",
		css: {
			feature: 'font-feature-settings: "valt"',
			variant: null,
		},
		comment: "Applied based on text layout",
		state: "fixed",
		category: "Positioning",
	},
	vpal: {
		name: "Proportional Alternate Vertical Metrics",
		css: {
			feature: 'font-feature-settings: "vpal"',
			variant: null,
		},
		comment: "Applied based on text layout",
		state: "off",
		category: "Positioning",
	},
	vhal: {
		name: "Alternate Vertical Half Metrics",
		css: {
			feature: 'font-feature-settings: "vhal"',
			variant: null,
		},
		comment: "Applied based on text layout",
		state: "off",
		category: "Positioning",
	},
	curs: {
		name: "Cursive Positioning",
		css: {
			feature: 'font-feature-settings: "curs"',
			variant: null,
		},
		state: "fixed",
		category: "Positioning",
	},
	dist: {
		name: "Distances",
		css: {
			feature: 'font-feature-settings: "dist"',
			variant: null,
		},
		comment: "Like <kern> but not subject to discretionary disabling",
		state: "fixed",
		category: "Positioning",
	},
	kern: {
		name: "Kerning",
		css: {
			feature: 'font-feature-settings: "kern"',
			variant: null,
		},
		state: "on",
		category: "Positioning",
	},
	vkrn: {
		name: "Vertical Kerning",
		css: {
			feature: 'font-feature-settings: "vkrn"',
			variant: null,
		},
		comment: "Applied based on text layout",
		state: "on",
		category: "Positioning",
	},
	mark: {
		name: "Mark Positioning",
		css: {
			feature: 'font-feature-settings: "mark"',
			variant: null,
		},
		state: "fixed",
		category: "Positioning",
	},
	abvm: {
		name: "Above-base Mark Positioning",
		css: {
			feature: 'font-feature-settings: "abvm"',
			variant: null,
		},
		comment: "South and Southeast Asian scripts",
		state: "fixed",
		category: "Positioning",
	},
	blwm: {
		name: "Below-base Mark Positioning",
		css: {
			feature: 'font-feature-settings: "blwm"',
			variant: null,
		},
		comment: "South and Southeast Asian scripts",
		state: "fixed",
		category: "Positioning",
	},
	mkmk: {
		name: "Mark to Mark Positioning",
		css: {
			feature: 'font-feature-settings: "mkmk"',
			variant: null,
		},
		comment:
			"Results may be subject to manual override or editing in some applications",
		state: "fixed",
		category: "Positioning",
	},
	aalt: {
		name: "Access All Alternates",
		css: {
			feature: 'font-feature-settings: "aalt"',
			variant: null,
		},
		comment:
			"The <aalt> feature is an access mechanism for presenting glyph variants in a user interface, so is not expected to be applied to text as part of layout",
		state: "off",
		category: "Discretionary typographic presentation",
	},
	size: {
		name: "Optical Size",
		css: {
			feature: 'font-feature-settings: "size"',
			variant: null,
		},
		comment: "Deprecated",
		state: "off",
		category: "Discretionary typographic presentation",
	},
};

export default layoutFeatures;
