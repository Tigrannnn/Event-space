'use client';

import type { ModalFooterProps } from './types';

export default function ModalFooter({
  question,
  actionLabel,
  onActionClick,
  children,
}: ModalFooterProps) {
  return (
    <>
      {question && (
        <p className="mt-6 text-center text-sm text-gray-600">
          {question}{' '}
          <button
            onClick={onActionClick}
            className="font-bold text-primary hover:underline cursor-pointer transition-all"
          >
            {actionLabel}
          </button>
        </p>
      )}
      {children}
    </>
  );
}
