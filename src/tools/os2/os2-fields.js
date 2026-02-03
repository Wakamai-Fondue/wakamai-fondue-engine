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

// OS/2 table fields
// Based on the OpenType 1.9 specification

const os2Fields = [
	{
		key: "usWeightClass",
		name: "Weight class",
		values: {
			100: "Thin",
			200: "Extra-light or Ultra-light",
			300: "Light",
			400: "Regular",
			500: "Medium",
			600: "Semi-bold or Demi-bold",
			700: "Bold",
			800: "Extra-bold or Ultra-bold",
			900: "Black or Heavy",
		},
	},
	{
		key: "usWidthClass",
		name: "Width class",
		values: {
			1: "Ultra-condensed",
			2: "Extra-condensed",
			3: "Condensed",
			4: "Semi-condensed",
			5: "Medium",
			6: "Semi-expanded",
			7: "Expanded",
			8: "Extra-expanded",
			9: "Ultra-expanded",
		},
	},
];

export default os2Fields;
