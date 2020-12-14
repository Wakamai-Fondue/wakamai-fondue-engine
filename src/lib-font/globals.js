import brotliDecode from "brotli/decompress";
import pako from "pako";

globalThis.unbrotli = brotliDecode;
globalThis.pako = pako;
