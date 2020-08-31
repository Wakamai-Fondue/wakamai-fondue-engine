#!/usr/bin/env python3
#
# Author: Roel Nieskens (roel@pixelambacht.nl)
#
# Usage: ./lang-tags-from-hb.py hb-ot-tag-table.hh
#
# Get the table from HarfBuzz:
# https://raw.githubusercontent.com/harfbuzz/harfbuzz/master/src/hb-ot-tag-table.hh
#
# The generated ot-to-html-lang.js file is used by
# Wakamai Fondue to map OpenType LangSys tags to their
# corresponding BCP 47 value, to be used in the `lang`
# attribute.

import sys
import json


def extractLanguages(content):
    langdict = {}

    # Regular languages
    langContent = content.split("ot_languages[] = {\n")[1].split("\n};")[0]
    languages = langContent.split("\n")

    # This loop will encounter some languages more than once,
    # e.g. "ATH " or "TNE " and will overwrite them!
    # This will be fixed by the "ambiguous languages"
    # further on
    for language in languages:
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

        parts = language.split(")", 1)

        # Human readable name
        tmp = parts[1].split("->")
        if len(tmp) == 2:
            langName = tmp[1].strip()
        else:
            langName = tmp[0].strip()

        # BCP47 and OT tag
        tmp = parts[0].split(",")
        langBCP = tmp[0].strip()
        langOT = tmp[1].strip()

        langdict[langOT] = {"html": langBCP, "name": langName}

    # Ambiguous languages
    amLangContent = (
        content.split("hb_ot_ambiguous_tag_to_language (hb_tag_t tag)")[1]
        .split("{\n")[2]
        .split("default")[0]
    )
    amLanguages = amLangContent.replace("\n    ", "").split("\n")

    # This loop will replace ambiguous languages with the
    # "correct" ones, as deemed by the HarfBuzz project
    for amLanguage in amLanguages:
        if amLanguage.strip():
            # Clean up some noise
            amLanguage = (
                amLanguage.replace("case HB_TAG('", "").replace("','", "").strip()
            )

            amLangOT = amLanguage.split("'")[0].strip().strip()
            amLangBCP = amLanguage.split('("')[1].split('"')[0].strip()
            amLangName = amLanguage.split(";  /*")[1].split("*/")[0].strip()

            langdict[amLangOT] = {"html": amLangBCP, "name": amLangName}

    return langdict


def main():
    if len(sys.argv) > 1:
        with open(sys.argv[1]) as f:
            content = f.read()

        languages = extractLanguages(content)
        languages = json.dumps(languages, indent=4, sort_keys=True)

        languagesJS = "export default " + languages + ";"

        with open("ot-to-html-lang.js", "w") as out:
            out.write(languagesJS + "\n")


if __name__ == "__main__":
    main()
