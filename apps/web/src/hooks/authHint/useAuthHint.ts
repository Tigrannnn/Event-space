'use client';

import { createContext, useContext } from 'react';

export type AuthHint = 'user' | 'guest';

export const AuthHintContext = createContext<AuthHint>('guest');

/**
 * Whether the request came with a session cookie, so the placeholders drawn while the answer
 * is on its way match what is about to appear: three buttons for someone signed in, two for
 * a guest. It is only a guess for the skeleton, never what decides what is shown.
 */
export const useAuthHint = (): AuthHint => useContext(AuthHintContext);
