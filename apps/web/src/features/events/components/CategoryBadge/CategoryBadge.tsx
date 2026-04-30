'use client';

import React from 'react';

export interface CategoryBadgeProps {
	children: React.ReactNode;
}

/**
 * Badge component for displaying event category
 */
export const CategoryBadge = ({ children }: CategoryBadgeProps) => (
	<div className="absolute top-5 left-5 z-10 flex items-center justify-center rounded-full bg-white/90 px-4 py-2 shadow-sm backdrop-blur-md dark:bg-gray-900/90 dark:shadow-gray-900/50">
		<span className="text-primary mr-[-0.1em] text-[13px] leading-none font-black tracking-widest uppercase">
			{children}
		</span>
	</div>
);
