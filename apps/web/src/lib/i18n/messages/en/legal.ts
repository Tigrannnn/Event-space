export const legal = {
	updated: 'Last updated: 8 October 2026',
	agreeNote: 'By booking you agree to the {terms} and the {privacy}.',
	termsLink: 'Terms of Service',
	privacyLink: 'Privacy Policy',
	questions: 'Questions about this page? Write to us:',
	privacy: {
		title: 'Privacy Policy',
		intro:
			'This page explains what {company} collects when you book a tour on this site, why, and what you can ask us to do with it.',
		sections: [
			{
				title: 'Who handles your data',
				body: [
					'{company} sells the tours and decides what happens to your data. The booking site is run on its behalf by Event Space, which stores the data and sends the emails.',
				],
			},
			{
				title: 'What we collect',
				body: [
					'Account: name, email address, phone number, and a profile picture if you sign in with Google. Passwords are stored only as an irreversible hash.',
					'Bookings: which tour and date you booked, how many seats, the amount, the payment method, your booking number, and whether you were checked in.',
					'Technical: sign-in sessions, your IP address while a verification code is active, and anonymous page statistics.',
				],
			},
			{
				title: 'Why we need it',
				body: [
					'To create your booking and let the guide know who is coming — without this the service cannot work.',
					'To send the confirmation, the reminder, and the notice if a tour is cancelled.',
					'To protect the account: verification codes and limits on repeated attempts.',
					'To keep the records that accounting and tax rules require.',
				],
			},
			{
				title: 'Card details',
				body: [
					'We never see your card. Payments are handled by Stripe, and the card number is entered on their side. We only store the payment reference so a refund can be matched to your booking.',
				],
			},
			{
				title: 'Who else sees the data',
				body: [
					'Stripe — payments and refunds. Resend — delivery of our emails. Google — only if you choose to sign in with Google. Railway — the servers the site runs on. Cloudinary — tour photos. Umami — anonymous visit statistics, with no cookies and no identification of visitors.',
					'We do not sell your data and do not pass it to anyone for advertising.',
				],
			},
			{
				title: 'How long we keep it',
				body: [
					'Bookings and payment records: as long as accounting rules require them.',
					'Account data: until you ask us to delete the account.',
					'Verification codes: 15 minutes. Sign-in sessions: until they expire or you sign out.',
				],
			},
			{
				title: 'Your rights',
				body: [
					'You can ask for a copy of your data, correct it, delete the account, or withdraw consent for emails that are not about your bookings.',
					'Write to the address at the bottom of this page. We answer within 30 days. Records that the law requires us to keep stay with us even after an account is deleted.',
				],
			},
			{
				title: 'Cookies',
				body: [
					'Only the ones that keep you signed in. There are no advertising or tracking cookies, which is why this site has no cookie banner.',
				],
			},
			{
				title: 'Children',
				body: [
					'The site is not intended for children under 16. A minor can be taken on a tour only as part of a booking made by an adult.',
				],
			},
			{
				title: 'Changes',
				body: [
					'If this policy changes, the date at the top changes with it. Significant changes are announced by email.',
				],
			},
		],
	},
	terms: {
		title: 'Terms of Service',
		intro:
			'These terms apply to every booking made on this site. By booking, you agree to them.',
		sections: [
			{
				title: 'Who you are dealing with',
				body: [
					'The tour is organised and run by {company}. The site only accepts the booking and the payment on its behalf. Questions about the tour itself go to {company}.',
				],
			},
			{
				title: 'Booking and payment',
				body: [
					'Prices are shown per person in Armenian drams and include all taxes.',
					'A booking is confirmed once payment goes through, or — where payment on arrival is offered — once the seat is reserved. The confirmation email is proof of booking.',
					'A seat is held only after confirmation. Until then it can be taken by someone else.',
				],
			},
			{
				title: 'If you cancel',
				body: [
					'The refund depends on how long before the start you cancel. The exact rules are shown on the tour page and in the confirmation email, because they differ from tour to tour.',
					'The refund goes back to the card you paid with and usually takes 5–10 business days.',
					'Not showing up without cancelling is not refundable.',
				],
			},
			{
				title: 'If the tour is cancelled',
				body: [
					'The organiser may cancel because of weather, road conditions, or too few participants. In that case you are refunded in full, regardless of the rules above.',
					'If the date is moved, you choose: come on the new date or take a full refund.',
				],
			},
			{
				title: 'On the day',
				body: [
					'Be at the meeting point at the stated time. A group does not wait for latecomers, and a missed departure counts as a no-show.',
					'Follow the guide. The organiser may refuse to take someone whose state puts the group at risk, with no refund.',
					'Tell the organiser in advance about health conditions that affect the trip.',
				],
			},
			{
				title: 'Responsibility',
				body: [
					'The organiser is responsible for the tour being run as described. Nature, traffic, and border crossings are not under anyone’s control, and a route may change for safety.',
					'Personal belongings are your own responsibility.',
				],
			},
			{
				title: 'Complaints',
				body: [
					'Write to the organiser first — most things are resolved there. Anything unresolved is settled under the laws of the Republic of Armenia.',
				],
			},
			{
				title: 'Changes to these terms',
				body: [
					'The terms in force are the ones published on the day of your booking. Later changes do not affect bookings already made.',
				],
			},
		],
	},
};
