import React from 'react';
import Spinner from '../Spinner/Spinner';

export default function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center gap-4">
            <Spinner />
            <p className="text-primary animate-pulse text-[10px] font-black tracking-widest uppercase">
                Loading...
            </p>
        </div>
    );
}
