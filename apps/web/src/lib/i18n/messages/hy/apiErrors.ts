import { AppErrorCode } from '@event-space/shared';
import type { Messages } from '../types';

export const apiErrors: Messages['apiErrors'] = {
	[AppErrorCode.BAD_REQUEST]: 'Հարցումը չհաջողվեց մշակել։ Ստուգեք լրացված տվյալները։',
	[AppErrorCode.UNAUTHORIZED]: 'Շարունակելու համար մուտք գործեք։',
	[AppErrorCode.FORBIDDEN]: 'Դուք չունեք այս գործողության հասանելիություն։',
	[AppErrorCode.NOT_FOUND]: 'Չհաջողվեց գտնել այն, ինչ փնտրում էիք։',
	[AppErrorCode.CONFLICT]: 'Տվյալները փոխվել են։ Թարմացրեք էջը և փորձեք նորից։',
	[AppErrorCode.VALIDATION_FAILED]: 'Ստուգեք նշված դաշտերը։',
	[AppErrorCode.TOO_MANY_REQUESTS]: 'Չափազանց շատ հարցումներ։ Փորձեք մեկ րոպե անց։',
	[AppErrorCode.SERVICE_UNAVAILABLE]: 'Ծառայությունը ժամանակավորապես անհասանելի է։ Փորձեք նորից։',
	[AppErrorCode.INTERNAL_ERROR]: 'Ինչ-որ բան այնպես չգնաց։ Փորձեք նորից։',

	[AppErrorCode.EMAIL_ALREADY_EXISTS]: 'Այս էլ. հասցեով հաշիվ արդեն գոյություն ունի։',
	[AppErrorCode.INVALID_VERIFICATION_CODE]: 'Հաստատման կոդը սխալ է կամ ժամկետանց։',
	[AppErrorCode.EMAIL_NOT_VERIFIED]: 'Նախ հաստատեք ձեր էլ. հասցեն։',

	[AppErrorCode.INVALID_CREDENTIALS]: 'Սխալ էլ. հասցե կամ գաղտնաբառ։',
	[AppErrorCode.SOCIAL_LOGIN_REQUIRED]: 'Այս հաշիվը կապված է Google-ի հետ։ Մուտք գործեք Google-ով։',
	[AppErrorCode.INVALID_RESET_CODE]: 'Կոդը սխալ է կամ ժամկետանց։',

	[AppErrorCode.GOOGLE_AUTH_FAILED]: 'Google-ով մուտքը չհաջողվեց։ Փորձեք նորից։',
	[AppErrorCode.GOOGLE_EMAIL_MISSING]: 'Google-ը չտրամադրեց էլ. հասցե։',
	[AppErrorCode.GOOGLE_EMAIL_NOT_VERIFIED]: 'Այս Google հաշվի էլ. հասցեն հաստատված չէ։',

	[AppErrorCode.REFRESH_TOKEN_MISSING]: 'Սեսիան ավարտվել է։ Մուտք գործեք նորից։',
	[AppErrorCode.REFRESH_TOKEN_EXPIRED]: 'Սեսիայի ժամկետը լրացել է։ Մուտք գործեք նորից։',
	[AppErrorCode.REFRESH_TOKEN_REUSED]: 'Սեսիան այլևս վավեր չէ։ Մուտք գործեք նորից։',
	[AppErrorCode.INVALID_TOKEN_FORMAT]: 'Սեսիան այլևս վավեր չէ։ Մուտք գործեք նորից։',
	[AppErrorCode.ACCESS_DENIED]: 'Մուտքը մերժված է։ Մուտք գործեք նորից։',
	[AppErrorCode.INSUFFICIENT_PERMISSIONS]: 'Դուք չունեք այս գործողության իրավունք։',

	[AppErrorCode.OCCURRENCE_HAS_BOOKINGS]:
		'Այս ամսաթվին կան ակտիվ ամրագրումներ։ Չեղարկեք այն, այլ ոչ թե ջնջեք։',
	[AppErrorCode.ACCOUNT_NEEDS_REGISTRATION]:
		'Այս փոստին արդեն կան ամրագրումներ, բայց հաշիվ դեռ չկա։ Գրանցվեք՝ ամրագրումները կհայտնվեն այնտեղ։',
	[AppErrorCode.CANNOT_CHANGE_OWN_ROLE]: 'Ձեր դերը փոխել հնարավոր չէ՝ խնդրեք մեկ այլ ադմինի։',
	[AppErrorCode.CANNOT_PROMOTE_UNVERIFIED]:
		'Ադմին կարող է դառնալ միայն հաստատված էլ. փոստով հաշիվը։',
	[AppErrorCode.OCCURRENCE_DATE_LOCKED]:
		'Այս ամսաթվին կան ակտիվ ամրագրումներ՝ միջոցառման ձևից այն փոխել հնարավոր չէ։ Օգտվեք ամսաթվի տեղափոխումից։',
	[AppErrorCode.OCCURRENCE_DATE_TAKEN]: 'Այս միջոցառումն արդեն ունի այլ ամսաթիվ այդ ժամին։',
	[AppErrorCode.OCCURRENCE_CANCELLED]: 'Չեղարկված ամսաթիվը հնարավոր չէ տեղափոխել։',
	[AppErrorCode.OCCURRENCE_CHANGED_CONCURRENTLY]:
		'Ամսաթիվը փոխվել է, մինչ դուք տեղափոխում էիք։ Թարմացրեք էջը և փորձեք նորից։',
	[AppErrorCode.OCCURRENCES_HAVE_BOOKINGS]:
		'Ջնջվող ամսաթվերից մի քանիսին կան ակտիվ ամրագրումներ։ Նախ չեղարկեք դրանք։',
	[AppErrorCode.EVENT_HAS_BOOKINGS]:
		'Այս միջոցառմանը կան ակտիվ ամրագրումներ։ Չեղարկեք այն, այլ ոչ թե ջնջեք։',

	[AppErrorCode.OTP_RESEND_COOLDOWN]: 'Սպասեք՝ նոր կոդ պահանջելուց առաջ։',
	[AppErrorCode.TOO_MANY_ATTEMPTS_FROM_DEVICE]:
		'Չափազանց շատ փորձեր այս սարքից։ Փորձեք ավելի ուշ։',
	[AppErrorCode.ACCOUNT_UNDER_PROTECTION]:
		'Հաշիվը ժամանակավորապես պաշտպանված է բազմաթիվ փորձերից հետո։ Փորձեք ավելի ուշ։',

	[AppErrorCode.OCCURRENCE_NOT_FOUND]: 'Այս ամսաթիվը չի գտնվել։',
	[AppErrorCode.EVENT_NOT_FOUND]: 'Այս միջոցառումը չի գտնվել։',
	[AppErrorCode.BOOKING_NOT_FOUND]: 'Այս ամրագրումը չի գտնվել։',
	[AppErrorCode.CATEGORY_NOT_FOUND]: 'Այս կատեգորիան չի գտնվել։',
	[AppErrorCode.BANNER_NOT_FOUND]: 'Այս բանները չի գտնվել։',
	[AppErrorCode.REVIEW_NOT_FOUND]: 'Այս կարծիքը չի գտնվել։',
	[AppErrorCode.REVIEW_TOO_EARLY]: 'Շրջագայությունը կարող եք գնահատել դրա ավարտից հետո։',
	[AppErrorCode.REVIEW_WINDOW_CLOSED]: 'Այս շրջագայության մասին կարծիք թողնելու ժամկետն անցել է։',
	[AppErrorCode.REVIEW_NOT_ELIGIBLE]: 'Կարծիք կարելի է թողնել միայն վճարված և կայացած շրջագայության համար։',
	[AppErrorCode.REVIEW_ALREADY_EXISTS]: 'Դուք արդեն կարծիք եք թողել այս շրջագայության մասին։',
	[AppErrorCode.REVIEW_EDIT_WINDOW_CLOSED]: 'Կարծիքը կարելի է փոխել միայն ուղարկելուց հետո երկու օրվա ընթացքում։',
	[AppErrorCode.BANNER_IMAGE_REQUIRED]: 'Ավելացրեք նկար բանների համար։',
	[AppErrorCode.BANNER_TARGET_REQUIRED]: 'Ընտրեք, թե ուր է տանում բաները։',
	[AppErrorCode.BANNER_INVALID_SCHEDULE]: 'Ավարտի ամսաթիվը չի կարող սկզբից շուտ լինել։',
	[AppErrorCode.TOO_MANY_ACTIVE_BANNERS]: 'Միաժամանակ կարող է ցուցադրվել առավելագույնը {max} բաններ։',
	[AppErrorCode.USER_NOT_FOUND]: 'Այս օգտատերը չի գտնվել։',
	[AppErrorCode.CURRENT_USER_NOT_FOUND]: 'Ձեր հաշիվը չի գտնվել։ Մուտք գործեք նորից։',

	[AppErrorCode.EVENT_NOT_AVAILABLE_FOR_BOOKING]: 'Այս միջոցառումն ամրագրման համար հասանելի չէ։',
	[AppErrorCode.ALREADY_BOOKED]: 'Դուք արդեն ունեք ամրագրում այս ամսաթվին։',
	[AppErrorCode.NO_SPOTS_AVAILABLE]: 'Այս ամսաթվին տեղեր չեն մնացել։',
	[AppErrorCode.NOT_ENOUGH_SPOTS]: 'Այս ամսաթվին մնացել է ընդամենը {spotsLeft} տեղ։',
	[AppErrorCode.BOOKING_USER_OR_NAME_REQUIRED]: 'Նշեք օգտատեր կամ անուն ամրագրման համար։',
	[AppErrorCode.NOT_YOUR_BOOKING]: 'Այս ամրագրումը ձեզ չի պատկանում։',
	[AppErrorCode.PAYMENT_SERVICE_UNAVAILABLE]:
		'Վճարային ծառայությունն անհասանելի է։ Ստուգեք կապը և փորձեք նորից։',
	[AppErrorCode.BOOKING_ALREADY_CANCELLED]: 'Այս ամրագրումն արդեն չեղարկված է։',
	[AppErrorCode.UNABLE_TO_RELEASE_SPOTS]: 'Չհաջողվեց ազատել այս ամրագրման տեղերը։',
	[AppErrorCode.BOOKING_NOT_CONFIRMED]: 'Այս ամրագրումը դեռ հաստատված չէ։',
	[AppErrorCode.BOOKING_NOT_PENDING]: 'Ձեռքով հաստատել կարելի է միայն սպասման մեջ գտնվող ամրագրումը։',
	[AppErrorCode.QUANTITY_PAYMENT_REQUIRED]: 'Հյուրեր ավելացնելու համար նախ պետք է վճարել հավելավճարը։',
	[AppErrorCode.QUANTITY_INCREASE_NOT_ALLOWED]: 'Ադմինը չի կարող հյուրեր ավելացնել ամրագրմանը։ Ստեղծեք նոր ամրագրում։',
	[AppErrorCode.QUANTITY_UNCHANGED]: 'Հյուրերի քանակը չի փոխվել։',
	[AppErrorCode.QUANTITY_QUOTE_CHANGED]: 'Վերադարձի գումարը փոխվել է այն պահից, երբ տեսաք այն։ Ստուգեք նոր գումարը։',
	[AppErrorCode.QUANTITY_SETTLEMENT_INVALID]: 'Հաշվարկի այս եղանակը չի համապատասխանում փոփոխությանը։',
	[AppErrorCode.BOOKING_CHANGED_CONCURRENTLY]: 'Ամրագրումը հենց նոր փոխվեց։ Թարմացրեք էջը։',
	[AppErrorCode.PAYMENT_ALREADY_RECEIVED]: 'Այս ամրագրման համար քարտով վճարումն արդեն ընթանում է կամ կատարվել է։ Թարմացրեք էջը։',
	[AppErrorCode.ALREADY_CHECKED_IN]: 'Այս ամրագրման համար արդեն նշված է ներկայություն։',
	[AppErrorCode.NOT_CHECKED_IN]: 'Այս ամրագրումը գրանցված չէ։',
	[AppErrorCode.TOUR_ALREADY_STARTED]: 'Տուրն արդեն սկսվել է, ամրագրումն այլևս հնարավոր չէ չեղարկել։ Կապվեք կազմակերպչի հետ։',
	[AppErrorCode.INVALID_REFERENCE_NUMBER]: 'Սխալ ամրագրման համար։',
	[AppErrorCode.BOOKING_NO_PAYMENT_INTENT]: 'Այս ամրագրումը վճարում չունի ստուգելու համար։',

	[AppErrorCode.OCCURRENCE_IN_PAST]: 'Հնարավոր չէ ավելացնել անցյալում գտնվող ամսաթիվ։',
	[AppErrorCode.IMAGE_NOT_IN_EVENT]: 'Նկարներից մեկը չի պատկանում այս միջոցառմանը։',
	[AppErrorCode.DUPLICATE_IMAGE_IDS]: 'Նույն նկարը նշված է մեկից ավելի անգամ։',
	[AppErrorCode.INVALID_STATUS_TRANSITION]: 'Կարգավիճակի այս փոփոխությունն անթույլատրելի է։',
	[AppErrorCode.IMAGES_REQUIRED]: 'Բացակայում է նկարների ցանկը։',
	[AppErrorCode.PAYLOAD_REQUIRED]: 'Հարցումին բավական տվյալներ չկան։',
	[AppErrorCode.INVALID_JSON_PAYLOAD]: 'Հարցման տվյալները վնասված են։',
	[AppErrorCode.DUPLICATE_IMAGE_ORDERS]: 'Նկարների հերթականությունը պետք է եզակի լինի յուրաքանչյուրի համար։',
	[AppErrorCode.NON_CONTIGUOUS_IMAGE_ORDERS]: 'Նկարների հերթականությունը պետք է սկսվի 0-ից՝ առանց բացերի։',
	[AppErrorCode.FILE_COUNT_MISMATCH]: 'Վերբեռնված ֆայլերի քանակը չի համընկնում նկարների հետ։',
	[AppErrorCode.TOO_MANY_IMAGES]: 'Վերբեռնվել է չափազանց շատ նկար։',

	[AppErrorCode.IMAGE_FILE_EMPTY]: 'Ֆայլերից մեկը դատարկ է կամ չի կարդացվում։',
	[AppErrorCode.IMAGE_FILE_TOO_LARGE]: 'Ֆայլերից մեկը չափազանց մեծ է։',
	[AppErrorCode.IMAGE_FILE_INVALID_TYPE]: 'Նկարները պետք է լինեն png, jpeg, webp կամ avif ձևաչափով։',
	[AppErrorCode.IMAGE_FILE_NOT_AN_IMAGE]: 'Ֆայլերից մեկը վավեր նկար չէ։',
	[AppErrorCode.IMAGE_FILE_EXTENSION_MISMATCH]: 'Ֆայլերից մեկի ընդլայնումը չի համընկնում իր բովանդակության հետ։',

	[AppErrorCode.NO_FILE_PROVIDED]: 'Ֆայլ չի տրամադրվել։',
	[AppErrorCode.FILE_BUFFER_EMPTY]: 'Ֆայլը դատարկ է։',
	[AppErrorCode.PUBLIC_ID_REQUIRED]: 'Բացակայում է ֆայլի հղումը։',
	[AppErrorCode.UPLOAD_FAILED]: 'Վերբեռնումը չհաջողվեց։ Փորձեք նորից։',

	[AppErrorCode.INVALID_QUERY_PARAM]: 'Ֆիլտրերից մեկը սխալ է։',
	[AppErrorCode.INVALID_WEBHOOK_SIGNATURE]: 'Վեբհուքի սխալ ստորագրություն։',
	[AppErrorCode.INVALID_WEBHOOK_REQUEST]: 'Վեբհուքի սխալ հարցում։',
	[AppErrorCode.EMAIL_SEND_FAILED]: 'Չհաջողվեց ուղարկել նամակը։ Փորձեք նորից։',
};
