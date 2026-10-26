import { AppErrorCode } from '@event-space/shared';
import type { Messages } from '../types';

export const apiErrors: Messages['apiErrors'] = {
	[AppErrorCode.BAD_REQUEST]: 'Не удалось обработать запрос. Проверьте введённые данные.',
	[AppErrorCode.UNAUTHORIZED]: 'Войдите, чтобы продолжить.',
	[AppErrorCode.FORBIDDEN]: 'У вас нет доступа к этому действию.',
	[AppErrorCode.NOT_FOUND]: 'Не удалось найти то, что вы искали.',
	[AppErrorCode.CONFLICT]: 'Данные успели измениться. Обновите страницу и попробуйте снова.',
	[AppErrorCode.VALIDATION_FAILED]: 'Проверьте выделенные поля.',
	[AppErrorCode.TOO_MANY_REQUESTS]: 'Слишком много запросов. Попробуйте через минуту.',
	[AppErrorCode.SERVICE_UNAVAILABLE]: 'Сервис временно недоступен. Попробуйте ещё раз.',
	[AppErrorCode.INTERNAL_ERROR]: 'Что-то пошло не так. Попробуйте ещё раз.',

	[AppErrorCode.EMAIL_ALREADY_EXISTS]: 'Аккаунт с такой почтой уже существует.',
	[AppErrorCode.INVALID_VERIFICATION_CODE]: 'Код подтверждения неверен или истёк.',
	[AppErrorCode.EMAIL_NOT_VERIFIED]: 'Сначала подтвердите свою почту.',

	[AppErrorCode.INVALID_CREDENTIALS]: 'Неверная почта или пароль.',
	[AppErrorCode.SOCIAL_LOGIN_REQUIRED]: 'Этот аккаунт привязан к Google. Войдите через Google.',
	[AppErrorCode.INVALID_RESET_CODE]: 'Код неверен или истёк.',

	[AppErrorCode.GOOGLE_AUTH_FAILED]: 'Не удалось войти через Google. Попробуйте ещё раз.',
	[AppErrorCode.GOOGLE_EMAIL_MISSING]: 'Google не передал адрес почты.',
	[AppErrorCode.GOOGLE_EMAIL_NOT_VERIFIED]: 'Почта этого аккаунта Google не подтверждена.',

	[AppErrorCode.REFRESH_TOKEN_MISSING]: 'Сессия завершена. Войдите снова.',
	[AppErrorCode.REFRESH_TOKEN_EXPIRED]: 'Срок сессии истёк. Войдите снова.',
	[AppErrorCode.REFRESH_TOKEN_REUSED]: 'Сессия больше недействительна. Войдите снова.',
	[AppErrorCode.INVALID_TOKEN_FORMAT]: 'Сессия больше недействительна. Войдите снова.',
	[AppErrorCode.ACCESS_DENIED]: 'Доступ запрещён. Войдите снова.',
	[AppErrorCode.INSUFFICIENT_PERMISSIONS]: 'У вас нет прав на это действие.',

	[AppErrorCode.OCCURRENCE_HAS_BOOKINGS]:
		'На эту дату есть активные брони. Отмените её, а не удаляйте.',
	[AppErrorCode.ACCOUNT_NEEDS_REGISTRATION]:
		'На эту почту уже есть брони, но аккаунта ещё нет. Зарегистрируйтесь — брони окажутся в нём.',
	[AppErrorCode.CANNOT_CHANGE_OWN_ROLE]: 'Свою роль изменить нельзя — попросите другого администратора.',
	[AppErrorCode.CANNOT_PROMOTE_UNVERIFIED]:
		'Администратором можно сделать только аккаунт с подтверждённой почтой.',
	[AppErrorCode.EMAIL_UNCHANGED]: 'На аккаунте уже указана эта почта.',
	[AppErrorCode.EMAIL_CHANGE_NOT_REQUESTED]:
		'Смена почты на этот адрес не запрашивалась или срок кода истёк. Запросите код заново.',
	[AppErrorCode.USER_NOT_SHADOW]:
		'Так можно править только гостевой профиль, заведённый администратором. У этого пользователя свой аккаунт.',
	[AppErrorCode.OCCURRENCE_DATE_LOCKED]:
		'На эту дату есть активные брони — через форму события её не изменить. Воспользуйтесь переносом даты.',
	[AppErrorCode.OCCURRENCE_DATE_TAKEN]: 'У этого события уже есть другая дата на это время.',
	[AppErrorCode.OCCURRENCE_CANCELLED]: 'Отменённую дату перенести нельзя.',
	[AppErrorCode.OCCURRENCE_CHANGED_CONCURRENTLY]:
		'Дату успели изменить, пока вы переносили. Обновите страницу и попробуйте снова.',
	[AppErrorCode.OCCURRENCES_HAVE_BOOKINGS]:
		'На некоторые из удаляемых дат есть активные брони. Сначала отмените эти брони.',
	[AppErrorCode.EVENT_HAS_BOOKINGS]:
		'На это событие есть активные брони. Отмените его, а не удаляйте.',

	[AppErrorCode.OTP_RESEND_COOLDOWN]: 'Подождите, прежде чем запрашивать новый код.',
	[AppErrorCode.TOO_MANY_ATTEMPTS_FROM_DEVICE]:
		'Слишком много попыток с этого устройства. Попробуйте позже.',
	[AppErrorCode.ACCOUNT_UNDER_PROTECTION]:
		'Аккаунт временно защищён после множества попыток. Попробуйте позже.',

	[AppErrorCode.OCCURRENCE_NOT_FOUND]: 'Эта дата не найдена.',
	[AppErrorCode.EVENT_NOT_FOUND]: 'Это событие не найдено.',
	[AppErrorCode.BOOKING_NOT_FOUND]: 'Эта бронь не найдена.',
	[AppErrorCode.CATEGORY_NOT_FOUND]: 'Эта категория не найдена.',
	[AppErrorCode.BANNER_NOT_FOUND]: 'Этот баннер не найден.',
	[AppErrorCode.REVIEW_NOT_FOUND]: 'Этот отзыв не найден.',
	[AppErrorCode.REVIEW_TOO_EARLY]: 'Оценить тур можно после его окончания.',
	[AppErrorCode.REVIEW_WINDOW_CLOSED]: 'Время для отзыва об этом туре уже прошло.',
	[AppErrorCode.REVIEW_NOT_ELIGIBLE]: 'Отзыв можно оставить только по оплаченной броне на состоявшийся тур.',
	[AppErrorCode.REVIEW_ALREADY_EXISTS]: 'Вы уже оставили отзыв об этом туре.',
	[AppErrorCode.REVIEW_EDIT_WINDOW_CLOSED]: 'Отзыв можно изменить только в течение двух суток после отправки.',
	[AppErrorCode.BANNER_IMAGE_REQUIRED]: 'Добавьте картинку для баннера.',
	[AppErrorCode.BANNER_TARGET_REQUIRED]: 'Выберите, куда ведёт баннер.',
	[AppErrorCode.BANNER_INVALID_SCHEDULE]: 'Дата окончания не может быть раньше даты начала.',
	[AppErrorCode.TOO_MANY_ACTIVE_BANNERS]: 'Одновременно можно показывать не больше {max} баннеров.',
	[AppErrorCode.USER_NOT_FOUND]: 'Этот пользователь не найден.',
	[AppErrorCode.CURRENT_USER_NOT_FOUND]: 'Ваш аккаунт не найден. Войдите снова.',

	[AppErrorCode.EVENT_NOT_AVAILABLE_FOR_BOOKING]: 'Это событие недоступно для бронирования.',
	[AppErrorCode.ALREADY_BOOKED]: 'У вас уже есть бронь на эту дату.',
	[AppErrorCode.NO_SPOTS_AVAILABLE]: 'На эту дату не осталось мест.',
	[AppErrorCode.NOT_ENOUGH_SPOTS]: 'На эту дату осталось всего {spotsLeft} мест.',
	[AppErrorCode.BOOKING_USER_OR_NAME_REQUIRED]: 'Укажите пользователя или имя для брони.',
	[AppErrorCode.NOT_YOUR_BOOKING]: 'Эта бронь вам не принадлежит.',
	[AppErrorCode.PAYMENT_SERVICE_UNAVAILABLE]:
		'Платёжный сервис недоступен. Проверьте соединение и попробуйте снова.',
	[AppErrorCode.BOOKING_ALREADY_CANCELLED]: 'Эта бронь уже отменена.',
	[AppErrorCode.UNABLE_TO_RELEASE_SPOTS]: 'Не удалось освободить места для этой брони.',
	[AppErrorCode.BOOKING_NOT_CONFIRMED]: 'Эта бронь ещё не подтверждена.',
	[AppErrorCode.BOOKING_NOT_PENDING]: 'Подтвердить вручную можно только бронь в ожидании.',
	[AppErrorCode.QUANTITY_PAYMENT_REQUIRED]: 'Чтобы добавить гостей, сначала нужно оплатить доплату.',
	[AppErrorCode.QUANTITY_INCREASE_NOT_ALLOWED]: 'Админ не может добавлять гостей в бронь. Создайте новую бронь.',
	[AppErrorCode.QUANTITY_UNCHANGED]: 'Количество гостей не изменилось.',
	[AppErrorCode.QUANTITY_QUOTE_CHANGED]: 'Сумма возврата изменилась с момента, когда вы её увидели. Проверьте новую сумму.',
	[AppErrorCode.QUANTITY_SETTLEMENT_INVALID]: 'Этот способ расчёта не подходит для такого изменения.',
	[AppErrorCode.BOOKING_CHANGED_CONCURRENTLY]: 'Бронь только что изменили. Обновите страницу.',
	[AppErrorCode.PAYMENT_ALREADY_RECEIVED]: 'По этой брони уже идёт или прошёл платёж картой. Обновите страницу.',
	[AppErrorCode.ALREADY_CHECKED_IN]: 'Эта бронь уже отмечена как явка.',
	[AppErrorCode.NOT_CHECKED_IN]: 'Эта бронь не отмечена как явка.',
	[AppErrorCode.TOUR_ALREADY_STARTED]: 'Тур уже начался, бронь больше нельзя отменить. Свяжитесь с организатором.',
	[AppErrorCode.PROMO_CODE_NOT_FOUND]: 'Такого промокода нет.',
	[AppErrorCode.PROMO_CODE_INACTIVE]: 'Этот промокод больше не активен.',
	[AppErrorCode.PROMO_CODE_EXPIRED]: 'Этот промокод сейчас не действует.',
	[AppErrorCode.PROMO_CODE_LIMIT_REACHED]: 'Лимит использований этого промокода уже исчерпан.',
	[AppErrorCode.PROMO_CODE_NOT_APPLICABLE]: 'Этот промокод не подходит к этому туру.',
	[AppErrorCode.PROMO_CODE_ALREADY_EXISTS]: 'Промокод с таким кодом уже существует.',
	[AppErrorCode.INVALID_REFERENCE_NUMBER]: 'Неверный номер брони.',
	[AppErrorCode.BOOKING_NO_PAYMENT_INTENT]: 'У этой брони нет платежа для сверки.',

	[AppErrorCode.OCCURRENCE_IN_PAST]: 'Нельзя добавить дату в прошлом.',
	[AppErrorCode.IMAGE_NOT_IN_EVENT]: 'Одно из изображений не принадлежит этому событию.',
	[AppErrorCode.DUPLICATE_IMAGE_IDS]: 'Одно и то же изображение указано несколько раз.',
	[AppErrorCode.INVALID_STATUS_TRANSITION]: 'Такая смена статуса недопустима.',
	[AppErrorCode.IMAGES_REQUIRED]: 'Не хватает списка изображений.',
	[AppErrorCode.PAYLOAD_REQUIRED]: 'В запросе не хватает данных.',
	[AppErrorCode.INVALID_JSON_PAYLOAD]: 'Данные запроса повреждены.',
	[AppErrorCode.DUPLICATE_IMAGE_ORDERS]: 'Порядок изображений должен быть уникальным для каждого.',
	[AppErrorCode.NON_CONTIGUOUS_IMAGE_ORDERS]: 'Порядок изображений должен идти подряд с 0.',
	[AppErrorCode.FILE_COUNT_MISMATCH]: 'Количество загруженных файлов не совпадает с изображениями.',
	[AppErrorCode.TOO_MANY_IMAGES]: 'Загружено слишком много изображений.',

	[AppErrorCode.IMAGE_FILE_EMPTY]: 'Один из файлов пуст или не читается.',
	[AppErrorCode.IMAGE_FILE_TOO_LARGE]: 'Один из файлов слишком большой.',
	[AppErrorCode.IMAGE_FILE_INVALID_TYPE]: 'Изображения должны быть в формате png, jpeg, webp или avif.',
	[AppErrorCode.IMAGE_FILE_NOT_AN_IMAGE]: 'Один из файлов не является изображением.',
	[AppErrorCode.IMAGE_FILE_EXTENSION_MISMATCH]: 'Расширение одного из файлов не совпадает с его содержимым.',

	[AppErrorCode.NO_FILE_PROVIDED]: 'Файл не передан.',
	[AppErrorCode.FILE_BUFFER_EMPTY]: 'Файл оказался пустым.',
	[AppErrorCode.PUBLIC_ID_REQUIRED]: 'Не хватает ссылки на файл.',
	[AppErrorCode.UPLOAD_FAILED]: 'Загрузка не удалась. Попробуйте снова.',

	[AppErrorCode.INVALID_QUERY_PARAM]: 'Один из фильтров указан неверно.',
	[AppErrorCode.INVALID_WEBHOOK_SIGNATURE]: 'Неверная подпись вебхука.',
	[AppErrorCode.INVALID_WEBHOOK_REQUEST]: 'Неверный запрос вебхука.',
	[AppErrorCode.EMAIL_SEND_FAILED]: 'Не удалось отправить письмо. Попробуйте снова.',
};
