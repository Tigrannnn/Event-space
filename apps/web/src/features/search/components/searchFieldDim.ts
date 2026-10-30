/**
 * Put on the visible search field while the search is open: the field casts a shadow far wider
 * than the screen, which darkens everything around it and leaves the field itself, with its own
 * corners and borders, untouched. Important, because some skins already give the focused field
 * a shadow of their own.
 */
export const SEARCH_FIELD_DIM = 'relative z-10 shadow-[0_0_0_100vmax_rgb(0_0_0/0.55)]!';
