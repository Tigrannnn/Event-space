'use client';

import { useState } from 'react';
import { UpdateShadowUserSchema, type SafeUserData, type UpdateShadowUserData } from '@event-space/shared';
import Input from '@/components/ui/Inputs/Input';
import Button from '@/components/ui/Buttons/Button';
import { useTranslation } from '@/hooks/translation';

type FieldName = 'name' | 'phone' | 'email';

interface GuestFormProps {
	user: SafeUserData;
	isPending: boolean;
	onSubmit: (data: UpdateShadowUserData) => void;
	onCancel: () => void;
}

export default function GuestForm({ user, isPending, onSubmit, onCancel }: GuestFormProps) {
	const translate = useTranslation();

	const [name, setName] = useState(user.name ?? '');
	const [phone, setPhone] = useState(user.phone ?? '');
	const [email, setEmail] = useState(user.email ?? '');
	const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});

	const handleSubmit = (formEvent: React.FormEvent) => {
		formEvent.preventDefault();

		const parsed = UpdateShadowUserSchema.safeParse({
			name: name.trim(),
			phone: phone.trim() || null,
			email: email.trim() || null,
		});

		if (!parsed.success) {
			const found: Partial<Record<FieldName, string>> = {};
			for (const issue of parsed.error.issues) {
				const field = issue.path[0] as FieldName | undefined;
				if (field && !found[field]) found[field] = issue.message;
			}
			setErrors(found);
			return;
		}

		setErrors({});
		onSubmit(parsed.data);
	};

	return (
		<form className="space-y-4" onSubmit={handleSubmit}>
			<Input
				label={translate('admin.guestName')}
				value={name}
				onChange={(changeEvent) => setName(changeEvent.target.value)}
				error={errors.name}
				disabled={isPending}
				required
			/>

			<Input
				label={translate('admin.phone')}
				type="tel"
				value={phone}
				onChange={(changeEvent) => setPhone(changeEvent.target.value)}
				error={errors.phone}
				disabled={isPending}
			/>

			<Input
				label={translate('admin.guestEmail')}
				type="email"
				value={email}
				onChange={(changeEvent) => setEmail(changeEvent.target.value)}
				error={errors.email}
				disabled={isPending}
			/>

			<p className="text-xs text-gray-500 dark:text-gray-400">{translate('admin.editGuestEmailHint')}</p>

			<div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
				<Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
					{translate('admin.cancel')}
				</Button>
				<Button type="submit" isLoading={isPending}>
					{translate('admin.saveChanges')}
				</Button>
			</div>
		</form>
	);
}
