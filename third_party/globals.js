import brotliDecode from "./font.js/lib/unbrotli";
import * as pako from "./font.js/lib/inflate";

globalThis.unbrotli = brotliDecode;
globalThis.pako = pako.default;
