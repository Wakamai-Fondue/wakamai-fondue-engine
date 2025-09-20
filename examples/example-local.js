// Simple example to load a font from the local filesystem
import { fromPath } from "../node.js";

const fondue = await fromPath("../test/fixtures/WFTestFont/WFTestFont.ttf");
console.log(`This font has ${fondue.charCount} characters.`);
