import esv from "./esv.json";
import kjv from "./kjv.json";
import niv from "./niv.json";
import nlt from "./nlt.json";
import type { TranslationId } from "./translations";

export type Bible = Record<string, Record<string, Record<string, string>>>;

export const bibleByTranslation: Record<TranslationId, Bible> = {
	esv,
	kjv,
	niv,
	nlt,
};
