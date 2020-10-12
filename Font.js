// basic inmports
import { manPage } from "./src/manpage.js";
import { Event, EventManager } from "./src/eventing.js";
import { SFNT, WOFF, WOFF2 } from "./src/opentype/index.js";
import { loadTableClasses } from "./src/opentype/tables/createTable.js";
import { context, isBrowser } from "./lib/context.js";

const PERMITTED_TYPES = [
    `ttf`,
    `otf`,
    `woff`,
    `woff2`,
];

const ILLEGAL_TYPES = [
    `eot`,
    `svg`,
    `fon`,
    `ttc`,
];

const ALL_TYPES = [...PERMITTED_TYPES, ...ILLEGAL_TYPES];

let fetch = globalThis.fetch;

if(!fetch) {
    let backlog = [];

    fetch = (...args) => {
        return new Promise((resolve, reject) => {
            backlog.push({ args, resolve, reject});
        });
    };

    import('fs').then(fs => {
        fetch = async function(path) {
            return new Promise((resolve, reject) => {
                fs.readFile(path, (err, data) => {
                    if (err) return reject(err);
                    resolve({
                        ok: true,
                        arrayBuffer: () => data.buffer
                    });
                });
            });
        };

        while(backlog.length) {
            let instruction = backlog.shift();
            fetch(...instruction.args).then(data => instruction.resolve(data)).catch(err => instruction.reject(err));
        }
    });
}


/**
 * either return the appropriate CSS format
 * for a specific font URL, or generate an
 * error if someone is trying to use a
 * font that died years ago.
 *
 * @param {*} path
 */
export function getFontCSSFormat(path) {
    let pos = path.lastIndexOf(`.`);
    let ext = (path.substring(pos + 1) || ``).toLowerCase();
    let format = {
        ttf: `truetype`,
        otf: `opentype`,
        woff: `woff`,
        woff2: `woff2`
    }[ext];
    
    if (format) return format;

    let msg = {
        eot: `The .eot format is not supported: it died in January 12, 2016, when Microsoft retired all versions of IE that didn't already support WOFF.`,
        svg: `The .svg format is not supported: SVG fonts (not to be confused with OpenType with embedded SVG) were so bad we took the entire fonts chapter out of the SVG specification again.`,
        fon: `The .fon format is not supported: this is an ancient Windows bitmap font format.`,
        ttc: `Based on the current CSS specification, font collections are not (yet?) supported.`
    }[ext];
    if (!msg) msg = `${path} is not a font.`;

    if(isBrowser) {
        this.dispatch(new Event(`error`, {}, msg));
    } else {
       throw new Error(msg); // Error handling for NodeJS
    }
}


/**
 * Borderline trivial http response helper function
 *
 * @param {HttpResponse} response
 */
function checkFetchResponseStatus(response) {
    if (!response.ok) {
        throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }
    return response;
}

/**
 * The Font object, which the WebAPIs are still sorely missing.
 */
class Font extends EventManager {
    constructor(name, options={}) {
        super();
        this.name = name;
        this.options = options;
        this.metrics = false;
    }

    get src() { return this.__src; }

    /**
     * Just like Image and Audio, we kick everything off when
     * our `src` gets assigned.
     *
     * @param {string} url
     */
    set src(url) {
        this.__src = url;
        this.defineFontFace(this.name, url, this.options);
        this.loadFont(url);
    }

    /**
     * This is a blocking operation.
     */
    defineFontFace(name, url, options) {
        if (typeof document !== "undefined") {
            let format = getFontCSSFormat(url);
            if (!format) return;
            let style = document.createElement(`style`);
            style.className = `injected by Font.js`;
            let rules = Object.keys(options).map(r => `${r}: ${options[r]};`).join(`\n\t`);
            style.textContent = `
    @font-face {
        font-family: "${name}";
        ${rules}
        src: url("${url}") format("${format}");
    }`;
            this.styleElement = style;
            document.head.appendChild(style);
        }
    }

    /**
     * This is a non-blocking operation.
     *
     * @param {String} url The URL for the font in question
     * @param {String} filename The filename when URL is a base64 string
     */
    async loadFont(url, filename) {
        fetch(url)
        .then(response => checkFetchResponseStatus(response) && response.arrayBuffer())
        .then(buffer => this.fromDataBuffer(buffer, filename || url))
        .catch(err => {
            const evt = new Event(`error`, err, `Failed to load font at ${filename || url}`);
            this.dispatch(evt);
            if (this.onerror) this.onerror(evt);
        });
    }

    /**
     * This is a non-blocking operation.
     *
     * @param {Buffer} buffer The binary data associated with this font.
     */
    async fromDataBuffer(buffer, typeOrPath) {
        let type = typeOrPath;
        if (!ALL_TYPES.includes(typeOrPath)) {
            type = getFontCSSFormat(typeOrPath);
        }
        this.fontData = new DataView(buffer); // Because we want to enforce Big Endian everywhere
        await this.parseBasicData(type);
        const evt = new Event("load", { font: this });
        this.dispatch(evt);
        if (this.onload) this.onload(evt);
    }

    /**
     * This is a non-blocking operation IF called from an async function
     */
    async parseBasicData(type) {
        return loadTableClasses().then(createTable => {
            if (type === `truetype` || type === `opentype`) {
                this.opentype = new SFNT(this.fontData, createTable);
            }
            if (type === `woff`) {
                this.opentype = new WOFF(this.fontData, createTable);
            }
            if (type === `woff2`) {
                this.opentype = new WOFF2(this.fontData, createTable);
            }
            return this.opentype;
        });
    }

    /**
     * Does this font support the specified character?
     * @param {*} char
     */
    supports(char) {
        return this.opentype.tables.cmap.supports(char) !== false;
    }

    /**
     * Does this font support the specified unicode variation?
     * @param {*} variation
     */
    supportsVariation(variation) {
        return this.opentype.tables.cmap.supportsVariation(variation) !== false;
    }

    /**
     * Effectively, be https://html.spec.whatwg.org/multipage/canvas.html#textmetrics
     * @param {*} text
     * @param {*} size
     */
    measureText(text, size=16) {
        if (this.__unloaded) throw new Error("Cannot measure text: font was unloaded. Please reload before calling measureText()");
        let d = document.createElement('div');
        d.textContent = text;
        d.style.fontFamily = this.name;
        d.style.fontSize = `${size}px`;
        d.style.color = `transparent`;
        d.style.background = `transparent`;
        d.style.top = `0`;
        d.style.left = `0`;
        d.style.position = `absolute`;
        document.body.appendChild(d);
        let bbox = d.getBoundingClientRect();
        document.body.removeChild(d);
        const OS2 = this.opentype.tables["OS/2"];
        bbox.fontSize = size;
        bbox.ascender = OS2.sTypoAscender;
        bbox.descender = OS2.sTypoDescender;
        return bbox;
    }

    /**
     * unload this font from the DOM context, making it no longer available for CSS purposes
     */
    unload() {
        if (this.styleElement.parentNode) {
            this.styleElement.parentNode.removeElement(this.styleElement);
            const evt = new Event("unload", { font: this });
            this.dispatch(evt);
            if (this.onunload) this.onunload(evt);
        }
        this._unloaded = true;
    }

    /**
     * load this font back into the DOM context after being unload()'d earlier.
     */
    load() {
        if (this.__unloaded) {
            delete this.__unloaded;
            document.head.appendChild(this.styleElement);
            const evt = new Event("load", { font: this });
            this.dispatch(evt);
            if (this.onload) this.onload(evt);
        }
    }
}

Font.manPage = manPage;

globalThis.Font = Font;

export { Font };
