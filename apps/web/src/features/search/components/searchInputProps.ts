/**
 * What a search field has to tell the phone: the keyboard's return key reads "Search", the first
 * letter is not capitalised and a tour or place name is not "corrected" into another word.
 */
export const SEARCH_INPUT_PROPS = {
	type: 'search',
	inputMode: 'search',
	enterKeyHint: 'search',
	autoCapitalize: 'off',
	autoCorrect: 'off',
	autoComplete: 'off',
	spellCheck: false,
} as const;
