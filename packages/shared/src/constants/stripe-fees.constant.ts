export const estimateStripeFeeInCents = (amountInDollars: number) => {
	const amountInCents = Math.round(amountInDollars * 100);
	return Math.round(amountInCents * 0.029) + 30;
};
