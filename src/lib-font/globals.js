import * as pako from "pako";
import brotliDecompress from "brotli/decompress";

globalThis.pako = pako;
globalThis.unbrotli = brotliDecompress;
