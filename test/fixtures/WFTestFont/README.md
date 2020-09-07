# WFTestFont

A versatile test font for Wakamai Fondue, created by Roel Nieskens.

Make changes in the .ttx file, [compile](https://github.com/fonttools/fonttools) to .ttf so it can be used in Wakamai Fondue's tests:

```bash
$ ttx -o WFTestFont.ttf WFTestFont.ttx
```

## What can this font do?

-   It has TrueType outlines (`glyf`)
-   It has a `.notdef` character
-   It has an `A` character
-   Name table entries:
    Font Family: WFTest
    Font Subfamily: Regular
    Unique Font Identifier: WFTest
    Font Name: WFTest
    Version String: Version 1.0
    PostScript Name: WFTest
    Sample text: Wakamai Fondue rules!
