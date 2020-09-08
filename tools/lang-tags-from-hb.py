#!/usr/bin/env python3
#
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

import sys
import json


def extract_languages(content):
    langdict = {}
    last_resort_langdict = {}

    # Regular languages
    lang_content = content.split("ot_languages[] = {\n")[1].split("\n};")[0]
    languages = lang_content.split("\n")

    # This loop will encounter some languages more than once,
    # e.g. "ATH " or "TNE " and will overwrite them!
    # This will be fixed by the "ambiguous languages"
    # further on
    for language in languages:
        # Commented-out languages can be added at the end
        # when no other langiages match
        last_resort = language.startswith("/*")

        # Clean up some noise
        language = (
            language.replace("HB_TAG(", "")
            .replace("','", "")
            .replace("},", "")
            .replace("{", "")
            .replace("/*", "")
            .replace("*/", "")
            .replace("'", "")
            .replace('"', "")
            .strip()
        )

        # Some reformatting to make notations consistent
        language = language.replace("Sotho, Northern", "Northern Sotho").replace(
            "Sotho, Southern", "Southern Sotho"
        )

        parts = language.split(")", 1)

        # Human readable name
        tmp = parts[1].split("->")
        if len(tmp) == 2:
            lang_name = tmp[1]
        else:
            lang_name = tmp[0]
        # No need to communicate this
        lang_name = (
            lang_name.replace("[macrolanguage]", "")
            .replace("[family]", "")
            .replace("(retired code)", "")
        )
        # This indicates a deprectaed OT tag, but we don't want
        # this information to be added to the langiage name
        lang_name = lang_name.replace("(deprecated)", "")
        lang_name = lang_name.strip()

        # BCP47 and OT tag
        tmp = parts[0].split(",")
        lang_bcp = tmp[0].strip()
        lang_ot = tmp[1].strip()

        if not lang_ot in langdict and not last_resort:
            langdict[lang_ot] = {"ot": lang_ot, "html": lang_bcp, "name": lang_name}
        if not lang_ot in last_resort_langdict and last_resort:
            last_resort_langdict[lang_ot] = {
                "ot": lang_ot,
                "html": lang_bcp,
                "name": lang_name,
            }

    # Ambiguous languages
    am_lang_content = (
        content.split("hb_ot_ambiguous_tag_to_language (hb_tag_t tag)")[1]
        .split("{\n")[2]
        .split("default")[0]
    )
    am_languages = am_lang_content.replace("\n    ", "").split("\n")

    # This loop will replace ambiguous languages with the
    # "correct" ones, as deemed by the HarfBuzz project
    for am_language in am_languages:
        if am_language.strip():
            # Clean up some noise
            am_language = (
                am_language.replace("case HB_TAG('", "").replace("','", "").strip()
            )

            am_lang_ot = am_language.split("'")[0].strip().strip()
            am_lang_bcp = am_language.split('("')[1].split('"')[0].strip()
            am_lang_name = am_language.split(";  /*")[1].split("*/")[0].strip()

            langdict[am_lang_ot] = {
                "ot": am_lang_ot,
                "html": am_lang_bcp,
                "name": am_lang_name,
            }

    for lr_lang in last_resort_langdict:
        if not lr_lang in langdict:
            langdict[lr_lang] = last_resort_langdict[lr_lang]

    # Return results as list
    return list(langdict.values())


def main():
    if len(sys.argv) > 1:
        with open(sys.argv[1]) as f:
            content = f.read()

        languages = extract_languages(content)
        languages = json.dumps(languages, indent=4, sort_keys=True)

        languages_js = "export default " + languages + ";"

        print(languages_js)


if __name__ == "__main__":
    main()
