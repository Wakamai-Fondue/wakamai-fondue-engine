#!/usr/bin/env python3

# Copyright 2021 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Author: Roel Nieskens (roel@pixelambacht.nl)
#
# Usage: ./lang-tags-from-hb.py hb-ot-tag-table.hh > ../src/tools/ot-to-html-lang.js
#
# File should be formatted as in this version:
# https://github.com/harfbuzz/harfbuzz/blob/7a961692e9568806221de8b2e2bf41bdfc1b8b3f/src/hb-ot-tag-table.hh
# Get the latest table from HarfBuzz:
# https://raw.githubusercontent.com/harfbuzz/harfbuzz/master/src/hb-ot-tag-table.hh
#
# The generated ot-to-html-lang.js file is used by
# Wakamai Fondue to map OpenType LangSys tags to their
# corresponding BCP 47 value, to be used in the `lang`
# attribute.
#
# Format the resulting ot-to-html-lang.js file by running:
# eslint --fix  ../src/tools/ot-to-html-lang.js

import sys
import json
import re


def cleanlang(lang_name):
    # No need to communicate this
    lang_name = (
        lang_name.replace("[macrolanguage]", "")
        .replace("[family]", "")
        .replace("(retired code)", "")
    )

    # This indicates a deprectaed OT tag, but we don't want
    # this information to be added to the language name
    lang_name = lang_name.replace("(deprecated)", "")
    lang_name = lang_name.strip()
    return lang_name


def add_language(langdict, ot, bcp47, name, replace=False):
    if replace or not ot in langdict:
        langdict[ot] = {
            "ot": ot,
            "html": bcp47,
            "name": cleanlang(name),
        }


def extract_languages(content):
    langdict = {}

    # Regular languages
    lang_content = content.split("ot_languages2[] = {\n")[1].split("\n};")[0]
    languages = lang_content.split("\n")

    # This loop will encounter some languages more than once,
    # e.g. "ATH " or "TNE " and will overwrite them!
    # This will be fixed by the "ambiguous languages"
    # further on
    for language in languages:
        if "HB_TAG_NONE" in language or not language.strip():
            continue

        # Ignore commented-out languages (lines starting with /*)
        if language.strip().startswith("/*"):
            continue

        # Extract comment at the end (has language name)
        if "/*" not in language:
            continue
        lang_name = language.split("/*")[1].split("*/")[0].strip()

        # Extract all single-quoted characters
        chars = re.findall(r"'(.)'", language)
        if len(chars) < 8:
            continue

        # First 4 chars are BCP47, next 4 are OT tag
        lang_bcp = "".join(chars[0:4]).strip()
        lang_ot = "".join(chars[4:8]).strip()

        # Handle arrow notation in comments
        if "->" in lang_name:
            lang_name = lang_name.split("->")[1].strip()

        add_language(langdict, lang_ot, lang_bcp, lang_name)

    # Ambiguous languages
    am_lang_section = content.split("hb_ot_ambiguous_tag_to_language (hb_tag_t tag)")[1].split("switch (tag)")[1].split("default")[0]
    am_lines = am_lang_section.split("\n")

    # This loop will replace ambiguous languages with the
    # "correct" ones, as deemed by the HarfBuzz project
    i = 0
    while i < len(am_lines):
        line = am_lines[i].strip()
        if line.startswith("case HB_TAG"):
            # Extract OT tag
            chars = re.findall(r"'(.)'", line)
            if len(chars) >= 4:
                am_lang_ot = "".join(chars[0:4]).strip()

                for j in range(i + 1, min(i + 5, len(am_lines))):
                    if "return hb_language_from_string" in am_lines[j]:
                        return_line = am_lines[j]
                        # Extract BCP47 from ("xxx", -1)
                        am_lang_bcp = (
                            return_line.split('("')[1].split('"')[0].strip()
                        )
                        # Extract language name
                        am_lang_name = (
                            return_line.split("/*")[1].split("*/")[0].strip()
                        )

                        add_language(langdict, am_lang_ot, am_lang_bcp, am_lang_name, replace=True)
                        break
        i += 1

    return list(langdict.values())


def main():
    if len(sys.argv) > 1:
        with open(sys.argv[1]) as f:
            content = f.read()

        languages = sorted(extract_languages(content), key=lambda x: x["ot"])
        languages = json.dumps(languages, indent="\t", sort_keys=True)

        languages_js = "export default " + languages + ";"

        print(languages_js)


if __name__ == "__main__":
    main()
