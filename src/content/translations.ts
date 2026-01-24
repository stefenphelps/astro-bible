export const translationMeta = [
	{ id: "esv", label: "ESV" },
	{ id: "kjv", label: "KJV" },
	{ id: "niv", label: "NIV" },
	{ id: "nlt", label: "NLT" },
] as const;

export type TranslationId = (typeof translationMeta)[number]["id"];

export const defaultTranslationId: TranslationId = "esv";
