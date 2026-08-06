/**
 * Copies text to the clipboard, working around two real gaps in `navigator.clipboard`:
 *
 * - it only exists in a "secure context" (HTTPS, or `localhost`). Over plain HTTP — a phone
 *   hitting a dev server by its LAN IP, or a site not yet behind TLS — `navigator.clipboard` is
 *   `undefined`, and calling `.writeText` on it throws a plain TypeError, not a rejected promise.
 * - some in-app browsers (social apps' built-in webviews) omit or block the API even over HTTPS.
 *
 * Both are covered by falling back to the pre-Clipboard-API trick: put the text in an offscreen
 * textarea, select it, and ask the browser to copy the current selection with `execCommand`. That
 * API is deprecated but still implemented everywhere the modern one might be missing, which is the
 * only reason it is used here instead of just being removed.
 *
 * Returns whether the copy actually happened, rather than throwing, so callers only have one
 * outcome to branch on regardless of which path succeeded.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
	if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
		try {
			await navigator.clipboard.writeText(text);
			return true;
		} catch {
			// Falls through to the legacy path — e.g. iOS Safari can reject this if it decides the
			// call is too far from the user gesture that triggered it, even though the API exists.
		}
	}

	return copyWithExecCommand(text);
}

function copyWithExecCommand(text: string): boolean {
	if (typeof document === 'undefined') return false;

	const textarea = document.createElement('textarea');
	textarea.value = text;

	// Off-screen but still focusable and selectable — execCommand only copies an active selection,
	// and some browsers refuse to focus an element positioned off the visible page entirely.
	textarea.style.position = 'fixed';
	textarea.style.top = '0';
	textarea.style.left = '0';
	textarea.style.width = '1px';
	textarea.style.height = '1px';
	textarea.style.padding = '0';
	textarea.style.border = 'none';
	textarea.style.opacity = '0';

	document.body.appendChild(textarea);

	const previousFocus = document.activeElement as HTMLElement | null;
	textarea.focus();
	textarea.select();
	textarea.setSelectionRange(0, text.length);

	let succeeded = false;
	try {
		succeeded = document.execCommand('copy');
	} catch {
		succeeded = false;
	}

	document.body.removeChild(textarea);
	previousFocus?.focus();

	return succeeded;
}
