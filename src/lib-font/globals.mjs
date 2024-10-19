import brotliDecode from "../../third_party/unbrotli/unbrotli.cjs";
import pako from "../../third_party/pako_inflate/pako_inflate.cjs";

globalThis.unbrotli = brotliDecode;
globalThis.pako = pako;
