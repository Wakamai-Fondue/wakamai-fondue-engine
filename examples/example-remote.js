// Simple example to load a font from a remote URL
import { fromPath } from "../node.js";
import { writeFileSync } from "fs";
import https from "https";
import { basename } from "path";

const url =
	"https://fonts.gstatic.com/s/roboto/v49/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3yUBHMdazQ.woff2";
const tempFile = basename(url);

const chunks = [];
https.get(url, (res) => {
	res.on("data", (chunk) => chunks.push(chunk));
	res.on("end", async () => {
		writeFileSync(tempFile, Buffer.concat(chunks));
		const fondue = await fromPath(tempFile);
		console.log(`This font has ${fondue.charCount} characters.`);
	});
});
