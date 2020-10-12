import lazy from "../../../../lazy.js";

class Format14 {
  constructor(p) {
    this.subTableStart = p.currentPosition;
    this.format = 14;
    this.length = p.uint32;
    this.numVarSelectorRecords = p.uint32;
    const getter = () =>
      [...new Array(this.numVarSelectorRecords)].map(
        (_) => new VariationSelector(p)
      );
    lazy(this, `varSelectors`, getter);
  }

  supports() {
    return false;
  }

  getSupportedCharCodes() {
    return false;
  }

  supportsVariation(variation) {
    let v = this.varSelector.find((uvs) => uvs.varSelector === variation);
    return v ? v : false;
  }

  getSupportedVariations() {
    return []; // TODO: implement this function?
  }
}

class VariationSelector {
  constructor(p) {
    this.varSelector = p.uint24;
    this.defaultUVSOffset = p.offset32;
    this.nonDefaultUVSOffset = p.offset32;
  }
}

export { Format14 };
