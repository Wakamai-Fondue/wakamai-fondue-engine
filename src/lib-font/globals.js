import brotliDecode from "lib-font/lib/unbrotli";
import * as pako from "lib-font/lib/inflate";

globalThis.unbrotli = brotliDecode;
globalThis.pako = pako.default;
