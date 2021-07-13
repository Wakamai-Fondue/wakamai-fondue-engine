export default function slugify(text) {
	text = text || "";
	return text
		.toLowerCase()
		.replace(/ /g, "-")
		.replace(/[-]+/g, "-")
		.replace(/[^\w-]+/g, "");
}
