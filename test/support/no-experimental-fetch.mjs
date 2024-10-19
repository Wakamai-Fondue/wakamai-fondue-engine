// Alternative for `node --no-experimental-fetch`.
// The goal is to let the unit tests use the `fetch` shim function from `lib-font`,
// instead of the experimental `fetch` API that is now available in new Node.js versions.
// This is meant as a temporary workaround.
//
// See:
// https://github.com/Pomax/lib-font/blob/ebb3706649e9accfc8ac8df8d239dac3c167cd99/src/utils/shim-fetch.js#L6-L8
// https://nodejs.org/docs/latest-v22.x/api/cli.html#--no-experimental-fetch
delete globalThis.fetch;
