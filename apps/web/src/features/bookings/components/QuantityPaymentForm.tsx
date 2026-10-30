'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useQueryClient } from '@tanstack/react-query';
import Button from '@/components/ui/Buttons/Button';
import { ToastType, useToastStore } from '@/stores/toastStore';
import { EnvKey, type StartQuantityPayment } from '@event-space/shared';
import { clientEnv } from '@/config/env';
import useSystemTheme from '@/hooks/systemTheme';
import { localizePath } from '@/lib/i18n/config';
import { useTranslation } from '@/hooks/translation';
import { useApiError } from '@/hooks/apiError';
import { useFormatCurrency } from '@/hooks/format';
import { bookingApi } from '../api/bookings.api';

interface QuantityPaymentFormProps {
	bookingId: string;
	accessToken?: string;
	payment: StartQuantityPayment;
	onBack: () => void;
	onDone: () => void;
}

const POLL_ATTEMPTS = 20;

function QuantityPaymentFormContent({
	bookingId,
	accessToken,
	payment,
	onBack,
	onDone,
}: Omit<QuantityPaymentFormProps, never>) {
	const stripe = useStripe();
	const elements = useElements();
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const translate = useTranslation();
	const apiError = useApiError();
	const formatCurrency = useFormatCurrency();
	const [isProcessing, setIsProcessing] = useState(false);
	const mounted = useRef(true);

	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);

	const { quote } = payment;
	const added = quote.newQuantity - quote.currentQuantity;

	const refresh = () =>
		Promise.all([
			queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
			queryClient.invalidateQueries({ queryKey: ['booking-view'] }),
			queryClient.invalidateQueries({ queryKey: ['event'] }),
			queryClient.invalidateQueries({ queryKey: ['events'] }),
		]);

	const waitForResult = async () => {
		for (let attempt = 0; attempt < POLL_ATTEMPTS && mounted.current; attempt += 1) {
			await new Promise((resolve) => setTimeout(resolve, 1000));

			const result = await bookingApi
				.reconcileQuantityPayment(bookingId, payment.paymentIntentId, accessToken)
				.catch(() => null);

			if (result && result.status !== 'PENDING') return result.status;
		}

		return 'PENDING' as const;
	};

	const handleSubmit = async (formEvent: FormEvent) => {
		formEvent.preventDefault();
		if (!stripe || !elements) return;

		setIsProcessing(true);

		const { error } = await stripe.confirmPayment({
			elements,
			confirmParams: {
				return_url: `${window.location.origin}${localizePath('/bookings', translate.locale)}?payment=success`,
			},
			redirect: 'if_required',
		});

		if (error) {
			setIsProcessing(false);
			addToast(apiError(error, 'booking.paymentFailed'), ToastType.ERROR);
			return;
		}

		addToast(translate('booking.paymentSubmitted'), ToastType.INFO);

		const status = await waitForResult();
		await refresh();
		if (!mounted.current) return;
		setIsProcessing(false);

		if (status === 'APPLIED') {
			addToast(translate('booking.quantityPayApplied'), ToastType.SUCCESS);
		} else if (status === 'FAILED') {
			addToast(translate('booking.quantityPayFailed'), ToastType.ERROR);
		} else if (status === 'PENDING') {
			addToast(translate('booking.quantityPayTimeout'), ToastType.INFO);
		} else {
			addToast(translate('booking.quantityPayCancelled'), ToastType.ERROR);
		}

		onDone();
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			<div>
				<h3 className="text-base font-semibold text-gray-900 dark:text-white">
					{translate('booking.quantityPayTitle')}
				</h3>
				<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
					{translate('booking.quantityPayHint', {
						amount: formatCurrency(quote.dueInCents / 100),
						count: added,
					})}
				</p>
			</div>

			<div className="rounded-md border border-gray-200 p-3 dark:border-gray-700">
				<PaymentElement />
			</div>

			<div className="flex gap-3">
				<Button
					type="button"
					variant="secondary"
					onClick={onBack}
					disabled={isProcessing}
					className="flex-1"
				>
					{translate('booking.quantityPayBack')}
				</Button>
				<Button
					type="submit"
					isLoading={isProcessing}
					disabled={!stripe || !elements || isProcessing}
					className="flex-1"
				>
					{isProcessing
						? translate('booking.confirming')
						: translate('booking.changeQuantityPay', {
								amount: formatCurrency(quote.dueInCents / 100),
							})}
				</Button>
			</div>
		</form>
	);
}

export default function QuantityPaymentForm(props: QuantityPaymentFormProps) {
	const theme = useSystemTheme();
	const translate = useTranslation();
	const publishableKey = clientEnv[EnvKey.STRIPE_PUBLISHABLE_KEY];

	const stripePromise = useMemo(
		() => (publishableKey ? loadStripe(publishableKey) : null),
		[publishableKey],
	);

	if (!stripePromise) {
		return <p className="text-sm text-red-500">{translate('booking.stripeMissing')}</p>;
	}

	return (
		<Elements
			stripe={stripePromise}
			options={{
				clientSecret: props.payment.clientSecret,
				appearance: { theme: theme === 'dark' ? 'night' : 'stripe' },
			}}
		>
			<QuantityPaymentFormContent {...props} />
		</Elements>
	);
}
