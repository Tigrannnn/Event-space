'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/primitives/command';
import type { SafeUserData } from '@event-space/shared';

type UserSelectMode = 'existing' | 'new';

interface UserSearchSelectProps {
	onExistingUserSelect: (userId: string, user: SafeUserData) => void;
	onNewUserName: (name: string) => void;
	existingUserId: string;
	newUserName: string;
	label?: string;
}

export default function UserSearchSelect({
	onExistingUserSelect,
	onNewUserName,
	existingUserId,
	newUserName,
	label,
}: UserSearchSelectProps) {
	const [mode, setMode] = useState<UserSelectMode>('existing');
	const [search, setSearch] = useState('');
	const [isOpen, setIsOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<SafeUserData | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const { data, isLoading } = useQuery({
		queryKey: ['admin-users-search', search],
		queryFn: () => adminApi.getUsers({ search, limit: 20 }).then((res) => res.data),
		enabled: isOpen && mode === 'existing',
	});

	const users = data?.data ?? [];

	const handleSelect = (user: SafeUserData) => {
		setSelectedUser(user);
		onExistingUserSelect(user.id, user);
		setIsOpen(false);
		setSearch('');
	};

	const handleModeChange = (newMode: UserSelectMode) => {
		setMode(newMode);
		setIsOpen(false);
		setSearch('');
		setSelectedUser(null);
		onExistingUserSelect('', null as unknown as SafeUserData);
		onNewUserName('');
	};

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	return (
		<div className="space-y-1.5">
			{label && <span className="text-sm font-semibold">{label}</span>}

			<div className="flex gap-2">
				<button
					type="button"
					onClick={() => handleModeChange('existing')}
					className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
						mode === 'existing'
							? 'bg-primary text-white'
							: 'border border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:text-gray-400'
					}`}
				>
					Existing user
				</button>
				<button
					type="button"
					onClick={() => handleModeChange('new')}
					className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
						mode === 'new'
							? 'bg-primary text-white'
							: 'border border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:text-gray-400'
					}`}
				>
					New user
				</button>
			</div>

			{mode === 'existing' && (
				<div className="relative" ref={containerRef}>
					<button
						type="button"
						onClick={() => setIsOpen((v) => !v)}
						className="focus:border-primary h-10 w-full cursor-pointer rounded-md border border-gray-500 bg-transparent px-3 text-left text-sm transition outline-none hover:border-gray-600"
					>
						{selectedUser ? (
							<span className="text-gray-900 dark:text-gray-100">
								{selectedUser.name} — {selectedUser.email}
							</span>
						) : (
							<span className="text-gray-400">Search user by name or email...</span>
						)}
					</button>

					{isOpen && (
						<div className="absolute top-full z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
							<Command shouldFilter={false}>
								<CommandInput
									placeholder="Search by name or email..."
									value={search}
									onValueChange={setSearch}
								/>
								<CommandList>
									{isLoading && <div className="py-4 text-center text-sm text-gray-400">Loading...</div>}
									{!isLoading && users.length === 0 && <CommandEmpty>No users found</CommandEmpty>}
									{!isLoading && users.length > 0 && (
										<CommandGroup>
											{users.map((user) => (
												<CommandItem
													key={user.id}
													value={user.id}
													onSelect={() => handleSelect(user)}
													data-checked={existingUserId === user.id}
													className="cursor-pointer"
												>
													<div className="flex flex-col">
														<span className="font-medium">{user.name}</span>
														<span className="text-xs text-gray-400">{user.email}</span>
													</div>
												</CommandItem>
											))}
										</CommandGroup>
									)}
								</CommandList>
							</Command>
						</div>
					)}
				</div>
			)}

			{mode === 'new' && (
				<input
					type="text"
					value={newUserName}
					onChange={(e) => onNewUserName(e.target.value)}
					placeholder="Enter name (e.g. Tigran from Instagram)"
					className="focus:border-primary h-10 w-full rounded-md border border-gray-500 bg-transparent px-3 text-sm transition outline-none placeholder:text-gray-400 hover:border-gray-600 dark:text-gray-100"
				/>
			)}
		</div>
	);
}
