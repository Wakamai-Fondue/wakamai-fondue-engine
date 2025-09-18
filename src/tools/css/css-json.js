/* eslint-disable */
/* FIXME ☝️ */
class CssJson {
	constructor() {
		this.selX = /([^\s\;\{\}][^\;\{\}]*)\{/g;
		this.endX = /\}/g;
		this.lineX = /([^\;\{\}]*)\;/g;
		this.commentX = /\/\*[\s\S]*?\*\//g;
		this.lineAttrX = /([^\:]+):([^\;]*);/;

		// This is used, a concatenation of all above. We use alternation to
		// capture.
		this.altX =
			/(\/\*[\s\S]*?\*\/)|([^\s\;\{\}][^\;\{\}]*(?=\{))|(\})|([^\;\{\}]+\;(?!\s*\*\/))/gim;

		// Capture groups
		this.capComment = 1;
		this.capSelector = 2;
		this.capEnd = 3;
		this.capAttr = 4;
	}

	isEmpty(x) {
		return typeof x == "undefined" || x.length === 0 || x === null;
	}

	isCssJson(node) {
		return !this.isEmpty(node) ? node : false;
	}

	toJSON(cssStringA, argsA) {
		let cssString = cssStringA;
		let args = argsA;
		let match = null;
		let count = 0;

		if (typeof args === "undefined") {
			args = {
				ordered: true,
				comments: false,
				stripComments: false,
				split: false,
			};
		}
		const node = args.ordered ? [] : {};
		if (args.stripComments) {
			args.comments = false;
			cssString = cssString.replace(this.commentX, "");
		}

		while ((match = this.altX.exec(cssString)) !== null) {
			if (!this.isEmpty(match[this.capComment]) && args.comments) {
				// Comment
				const add = match[this.capComment].trim();
				node[count++] = add;
			} else if (!this.isEmpty(match[this.capSelector])) {
				// New node, we recurse
				const name = match[this.capSelector].trim();
				// This will return when we encounter a closing brace
				const newNode = this.toJSON(cssString, args);
				if (args.ordered) {
					const obj = {};
					obj.name = name;
					obj.value = newNode;
					// Since we must use key as index to keep order and not
					// name, this will differentiate between a Rule Node and an
					// Attribute, since both contain a name and value pair.
					obj.type = "rule";
					node[count++] = obj;
				} else {
					let bits = [name];
					if (args.split) {
						bits = name.split(",");
					}
					for (let i = 0; i < bits.length; i++) {
						const sel = bits[i].trim();
						if (sel in node) {
							for (let att = 0; att < newNode.length; att++) {
								node[sel][att] = newNode[att];
							}
						} else {
							node[sel] = newNode;
						}
					}
				}
			} else if (!this.isEmpty(match[this.capEnd])) {
				// Node has finished
				return node;
			} else if (!this.isEmpty(match[this.capAttr])) {
				const line = match[this.capAttr].trim();
				const attr = this.lineAttrX.exec(line);
				if (attr) {
					// Attribute
					const name = attr[1].trim();
					const value = attr[2].trim();
					if (args.ordered) {
						const obj = {};
						obj.name = name;
						obj.value = value;
						obj.type = "attr";
						node[count++] = obj;
					} else if (name in node) {
						const currVal = node[name];
						if (!(currVal instanceof Array)) {
							node[name] = [currVal];
						}
						node[name].push(value);
					} else {
						node[name] = value;
					}
				} else {
					// Semicolon terminated line
					node[count++] = line;
				}
			}
		}

		return node;
	}

	toCSS(node, depthA, breaksA) {
		let depth = depthA;
		let breaks = breaksA;
		let cssString = "";
		if (typeof depth == "undefined") {
			depth = 0;
		}
		if (typeof breaks == "undefined") {
			breaks = false;
		}
		if (node) {
			for (let i = 0; i < node.length; i++) {
				const att = node[i];
				if (att instanceof Array) {
					for (let j = 0; j < att.length; j++) {
						cssString = cssString + this.strAttr(i, att[j], depth);
					}
				} else {
					cssString = cssString + this.strAttr(i, att, depth);
				}
			}
		}
		if (node) {
			let first = true;
			for (let i = 0; i < node.length; i++) {
				if (breaks && !first) {
					cssString = cssString + "\n";
				} else {
					first = false;
				}
				cssString = cssString + this.strNode(i, node[i], depth);
			}
		}
		return cssString;
	}

	toHEAD(dataA, id, replace) {
		let data = dataA;
		const head = document.getElementsByTagName("head")[0];
		const xnode = document.getElementById(id);
		const _xnodeTest = xnode !== null && xnode instanceof HTMLStyleElement;

		if (this.isEmpty(data) || !(head instanceof HTMLHeadElement)) {
			return;
		}
		if (_xnodeTest) {
			if (replace === true || this.isEmpty(replace)) {
				xnode.removeAttribute("id");
			} else {
				return;
			}
		}
		if (this.isCssJson(data)) {
			data = this.toCSS(data);
		}

		let node = document.createElement("style");
		node.type = "text/css";

		if (!this.isEmpty(id)) {
			node.id = id;
		} else {
			node.id = "cssjson_" + this.timestamp();
		}
		if (node.styleSheet) {
			node.styleSheet.cssText = data;
		} else {
			node.appendChild(document.createTextNode(data));
		}

		head.appendChild(node);

		if (this.isValidStyleNode(node)) {
			if (_xnodeTest) {
				xnode.parentNode.removeChild(xnode);
			}
		} else {
			node.parentNode.removeChild(node);
			if (_xnodeTest) {
				xnode.setAttribute("id", id);
				node = xnode;
			} else {
				return;
			}
		}

		return node;
	}

	// // Alias

	// if (typeof window !== 'undefined') {
	// 	window.createCSS = toHEAD;
	// }

	// Helpers

	isValidStyleNode(node) {
		return (
			node instanceof HTMLStyleElement && node.sheet.cssRules.length > 0
		);
	}

	timestamp() {
		return Date.now() || Number(new Date());
	}

	strAttr(name, value, depth) {
		return "\t".repeat(depth) + name + ": " + value + ";\n";
	}

	strNode(name, value, depth) {
		let cssString = "\t".repeat(depth) + name + " {\n";
		cssString = cssString + this.toCSS(value, depth + 1);
		cssString = cssString + ("\t".repeat(depth) + "}\n");
		return cssString;
	}
}

export default CssJson;
