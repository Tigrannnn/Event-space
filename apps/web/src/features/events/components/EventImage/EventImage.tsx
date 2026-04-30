'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { EventImageFallback } from './EventImageFallback';

export interface EventImageProps {
	src: string;
	alt: string;
	className?: string;
	onError?: () => void;
	fallback?: React.ReactNode;
}

/**
 * Validates if string is a valid URL
 */
const isValidUrl = (url: string, onError?: () => void): boolean => {
	if (!url || typeof url !== 'string') {
		onError?.();
		return false;
	}
	try {
		new URL(url);
		return true;
	} catch {
		onError?.();
		return false;
	}
};

/**
 * Base image component - renders nothing on error unless fallback provided
 */
export const EventImage = ({ src, alt, className, onError, fallback }: EventImageProps) => {
	const [imageError, setImageError] = useState(false);

	const isValid = isValidUrl(src, onError);

	// If invalid or error, render fallback if provided, otherwise null
	if (!isValid || imageError) {
		return fallback || null;
	}

	return (
		<Image
			src={src}
			alt={alt}
			width={800}
			height={600}
			className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${className || ''}`}
			onError={() => {
				setImageError(true);
				onError?.();
			}}
			unoptimized={src.startsWith('http')}
		/>
	);
};

/**
 * EventImage with automatic fallback placeholder
 */
export const EventImageWithFallback = (props: Omit<EventImageProps, 'fallback'>) => {
	return <EventImage {...props} fallback={<EventImageFallback alt={props.alt} />} />;
};
