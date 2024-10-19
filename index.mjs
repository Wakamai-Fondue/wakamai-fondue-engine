/*
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Font } from "./src/lib-font/lib-font-wrapper.mjs";
import Fondue from "./src/fondue/Fondue.mjs";

export async function fromPath(fontPath) {
	const { readFile } = await import("node:fs/promises");

	return new Promise((resolve, reject) => {
		const font = new Font(fontPath);
		font.onload = () => resolve(new Fondue(font));
		font.onerror = (e) => reject(e.detail.message);

		(async () => {
			try {
				const file = await readFile(fontPath);
				font.fromDataBuffer(file.buffer, fontPath).catch(reject);
			} catch (e) {
				reject(e);
			}
		})();
	});
}

export function fromDataBuffer(buffer, fontFilename) {
	return new Promise((resolve, reject) => {
		const font = new Font(fontFilename);
		font.onload = () => resolve(new Fondue(font));

		font.fromDataBuffer(buffer, fontFilename).catch(reject);
	});
}
