export interface UseCooldownReturn {
	isOnCooldown: boolean;
	remainingSeconds: number;
	startCooldown: (overrideEmail?: string) => void;
	resetCooldown: () => void;
}
