import brotliDecode from "../../third_party/unbrotli/unbrotli";
import pako from "../../third_party/pako_inflate/pako_inflate";

globalThis.unbrotli = brotliDecode;
globalThis.pako = pako;
