'use client';

import { createContext, useContext, type ReactNode } from 'react';

const ClassicLookContext = createContext(false);

/**
 * Inside it the shared modal, button and input parts drop their `market` tokens and keep the
 * classic look, for the surfaces that should not follow the skin (sign-in and registration).
 */
export function ClassicLook({ children }: { children: ReactNode }) {
	return <ClassicLookContext.Provider value={true}>{children}</ClassicLookContext.Provider>;
}

export function useClassicLook() {
	return useContext(ClassicLookContext);
}
