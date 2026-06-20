'use client'

import React from 'react';
import Spinner from '../Spinner/Spinner';
import { useTranslation } from '@/hooks/translation';

export default function LoadingSpinner() {
    const translate = useTranslation();
    
    return (
        <div className="flex flex-col items-center gap-4">
            <Spinner />
            <p className="text-primary animate-pulse text-[10px] font-black tracking-widest uppercase">
                {translate('common.loading')}
            </p>
        </div>
    );
}
