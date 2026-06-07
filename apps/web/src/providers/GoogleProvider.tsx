'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ReactNode } from 'react';

interface GoogleProviderProps {
	children: ReactNode;
	clientId: string;
}

export default function GoogleProvider({ children, clientId }: GoogleProviderProps) {
	return <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>;
}
