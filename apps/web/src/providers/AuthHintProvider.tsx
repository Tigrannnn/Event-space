'use client';

import { AuthHintContext, type AuthHint } from '@/hooks/authHint/useAuthHint';

export function AuthHintProvider({
	hint,
	children,
}: {
	hint: AuthHint;
	children: React.ReactNode;
}) {
	return <AuthHintContext.Provider value={hint}>{children}</AuthHintContext.Provider>;
}
