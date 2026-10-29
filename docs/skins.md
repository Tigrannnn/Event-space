# Скины сайта (classic, minimal, listing, soft, market, drawer) и как добавить ещё один

Скин — это то, как выглядит и как устроен сайт компании кроме цветов: шапка, карточки, страница тура, модалки. Нужен, чтобы сайты разных компаний-конкурентов не выглядели одним сайтом в разных красках. Админка скинов не имеет.

Сейчас четыре скина: `classic` (по умолчанию, все бренды) и `minimal` (в духе Airbnb и hyurservice: белый фон, один цвет, плоские поверхности). Назначается в `packages/shared/src/constants/brands.constant.ts`, поле `skin` у бренда. Сейчас `minimal` у Buggy Tour и One Day Tour, `listing` у Ampar и 1000+1 Travel, `soft` у Yerivar.

## Как это устроено

Три механизма, они работают вместе.

1. **`Brand.skin` и `useSkin()`** (`apps/web/src/providers/BrandProvider.tsx`). Для клиентских компонентов с разной вёрсткой: `const skin = useSkin()` и ветка по скину. Так сделаны шапка, карточка тура, страница тура, профиль, нижняя панель и др.
2. **CSS-вариант `in-data-[skin=minimal]:`** (Tailwind 4). Атрибут `data-skin` стоит на `<html>` (`app/[locale]/layout.tsx`), поэтому вариант срабатывает в любом месте страницы, в том числе в серверных компонентах и в порталах (модалки). Так сделаны кнопка, поле, модалка, скелетоны и мелкие правки внутри общих компонентов. Класс должен быть записан целиком, строкой: Tailwind не видит склеенных из кусков. Для тёмной темы: `in-data-[skin=minimal]:dark:...`.
3. **Переменные в `layout.tsx` и `globals.css`.** В `layout.tsx` для `minimal` акцент приравнивается к основному цвету (`--color-accent = --color-primary`), поэтому все градиенты `from-primary to-accent` на всём сайте стали плоскими без правок в компонентах. Там же шрифт (Inter из пакета `@fontsource-variable/inter` (не с Google: build не должен зависеть от сети)) и фон `body`. В `globals.css` блок `:root[data-skin='minimal']` переопределяет шрифт и тени.

Когда что выбирать: если структура разметки другая, то отдельный компонент и `useSkin()`. Если отличаются только классы, то `in-data-[skin=...]:`. Скелетоны загрузки серверные (хука нет), поэтому рисуются обе версии, лишняя скрыта парой `in-data-[skin=minimal]:hidden` и `hidden in-data-[skin=minimal]:block`.

## Что менялось для `minimal` (без админки)

Чтобы сделать третий скин, пройди по этому списку: у каждого пункта либо появится ветка под новый скин, либо он наследует общие токены.

### Общие настройки
| Файл | Что |
|---|---|
| `packages/shared/src/constants/brands.constant.ts` | тип `BrandSkin`, поле `Brand.skin`, `DEFAULT_BRAND_SKIN`. Для нового скина добавить значение в тип |
| `apps/web/src/providers/BrandProvider.tsx` | хук `useSkin()` |
| `apps/web/src/app/[locale]/layout.tsx` | `data-skin` на `<html>`, шрифт скина, акцент = основной цвет, фон `body` |
| `apps/web/src/app/globals.css` | блок `:root[data-skin='minimal']` (шрифт, тени) |

### Шапка, подвал, навигация
| Файл | Как |
|---|---|
| `components/layout/Header/HeaderWrapper.tsx` | выбирает `HeaderMinimal` или `Header` + `TopBar`. У `minimal` верхней полосы нет |
| `components/layout/Header/HeaderMinimal.tsx` (новый) | шапка: название-логотип, поиск-таблетка, язык, контакты (от `xl`), вход, профиль |
| `components/layout/Header/Header.tsx` | классическая шапка; логика вынесена в хук |
| `components/layout/Header/useHeaderControls.ts` (новый) | общая логика шапок: поиск, пользователь, счётчики. Новая шапка подключает его же |
| `components/layout/Header/ContactIcons.tsx` (новый) | иконки Instagram, телефон, почта, адрес; открывают карточку контакта. Используется в шапке и в футере |
| `components/ui/LanguageSwitcher/LanguageMenu.tsx` (новый) | язык: кнопка с глобусом и список. У classic остаётся `LanguageSwitcher` из трёх кнопок |
| `components/layout/Footer/Footer.tsx` | у `minimal` над категориями ряд `ContactIcons`; цвет фона в тёмной теме |
| `components/layout/BottomNavbar/BottomNavbar.tsx` | ветка `minimal`: активный раздел цветом, крупные иконки, счётчики цветом бренда |

### Главная и каталог
| Файл | Как |
|---|---|
| `app/[locale]/(home)/_components/events-grid.ts` (новый) | `eventsGridClass(skin)`: число колонок и отступы. Один источник для списка и скелетона |
| `app/[locale]/(home)/_components/EventsList.tsx` | берёт сетку из `events-grid.ts` |
| `features/events/components/EventCard/EventCard.tsx` | переключатель карточек |
| `.../EventCard/EventCardClassic.tsx` | прежняя карточка (вынесена без изменений вёрстки) |
| `.../EventCard/EventCardMinimal.tsx` (новый) | фото, текст под ним, цена, маленькая кнопка |
| `.../EventCard/useEventCardState.ts` (новый) | вся логика карточки: цена, дата, бронь, клик. Новая карточка только оформляет |
| `features/favorites/components/FavoriteButton.tsx` | сердечко: у `minimal` без круга; вариант `plain` для фона страницы, `overlay` для фото |
| `features/banners/components/BannerCarousel.tsx` | высота, точки, стрелки |
| `features/banners/components/BannerSlide.tsx` | у `minimal` карточка «текст слева, фото справа» |
| `app/[locale]/(home)/_components/filters/EventsFiltersBar.tsx` | фон и граница панели |
| `components/filters/FilterTriggerButton.tsx` | кнопки фильтров и категорий: нейтральные пилюли, активная тёмная |

### Страница тура и бронирование
| Файл | Как |
|---|---|
| `app/[locale]/events/[id]/EventPageContent.tsx` | переключатель: `EventPageClassic` или `EventPageMinimal` |
| `app/[locale]/events/[id]/EventPageMinimal.tsx` (новый) | сетка фото, заголовок, разделы линиями, шире (`max-w-7xl`) |
| `features/bookings/components/BookingSidebar/BookingSidebar.tsx` | у `minimal` отдельная вёрстка внутри файла: цена, дата, шкала мест, кнопка, места. Логика общая |
| `features/bookings/components/OccurrencePicker/OccurrencePicker.tsx` | переключатель: выпадающий список или плитки |
| `.../OccurrencePicker/OccurrenceChips.tsx` (новый) | плитки дат. Используются и в сайдбаре, и в форме бронирования |
| `features/bookings/components/BookingForm/BookingForm.tsx` | у `minimal` список дат заменён на `OccurrenceChips` |
| `features/bookings/components/BookingCard/BookingCard.tsx` | карточка брони: без рамки и тени, класс-варианты |

### Базовые компоненты (меняют вид во всех местах сразу)
| Файл | Как |
|---|---|
| `components/ui/Buttons/Button/Button.tsx` | `in-data-` варианты: круглая, плоская; вторичная серая |
| `components/ui/Inputs/Input/Input.tsx` | тонкая рамка, белый фон |
| `components/ui/Modal/Modal.tsx` | фон, тень, затемнение без размытия |
| `components/ui/Modal/ModalHeader/ModalHeader.tsx` | заголовок без цвета бренда |
| `features/auth/components/AuthModal.tsx` | у модалки входа своя внутренняя панель, правится отдельно |
| `components/ui/Skeleton/Skeleton.tsx` | цвет блоков в тёмной теме |

### Профиль и заглушки загрузки
| Файл | Как |
|---|---|
| `app/[locale]/profile/ProfileContent.tsx` | ветка `minimal`: список строк без плиток, адаптивный |
| `app/[locale]/profile/ProfileSkeleton.tsx` | обе версии, выбор через CSS-вариант |
| `app/[locale]/events/[id]/EventDetailSkeleton.tsx` | то же |
| `app/[locale]/bookings/BookingsSkeleton.tsx` | то же |
| `app/[locale]/(home)/_components/EventsFiltersBarSkeleton.tsx` | то же |
| `app/[locale]/(home)/_components/EventCardSkeleton.tsx`, `EventsGridSkeleton.tsx` | клиентские, через `useSkin()` |

## Что ещё не переделано (у `minimal` оно такое же, как у `classic`)

Если нужно развести сильнее, это следующие кандидаты.

- Страница «Избранное», страница «Мои брони» (шапка и пустое состояние), форма отзыва.
- Страницы «О нас», «Условия», «Политика».
- Модалки: успешное бронирование, смена количества, QR, подтверждение, контакт, предпросмотр картинок, редактирование профиля (наследуют Modal, Button и Input, но внутренняя вёрстка прежняя).
- Выбор даты в самом `OccurrencePrice` (цвет цены в классическом выпадающем списке).
- Уведомления (Toast), страницы ошибок и 404, общий спиннер `loading.tsx`.
- Письма клиентам и чек-ин (QR) вообще не зависят от скина.
- Адреса страниц (`/ru/events/<uuid>`) одинаковы у всех.

## Как добавить третий скин

1. Добавить значение в `BrandSkin` (`brands.constant.ts`), назначить его бренду полем `skin`.
2. В `layout.tsx` решить, что меняется глобально: шрифт, фон `body`, нужен ли один цвет (акцент = основной) или два. Добавить блок `:root[data-skin='имя']` в `globals.css`.
3. Пройти таблицы выше сверху вниз. Для каждого пункта выбрать: ветка в переключателе (`useSkin()`), новый компонент или `in-data-[skin=имя]:` в общем классе. Переключатели сейчас написаны как `skin === 'minimal' ? … : …`; для трёх скинов их надо заменить на выбор по таблице или объекту.
4. Скелетоны: добавить версию под новый скин и скрыть лишние через `in-data-[skin=…]:hidden`.
5. Добавить в `in-data-[skin=…]:` к общим классам Button, Input, Modal, ModalHeader, Skeleton.

## Как смотреть скин локально

Бренд определяется по домену, а на `localhost` всегда будет `classic`. Для просмотра временно подмените `getBrandForHost` в `apps/web/src/config/brands.ts`, чтобы для хоста вроде `minimal.localhost:3000` возвращался бренд с нужным `skin`, и открывайте `http://minimal.localhost:3000/ru`. Перед коммитом верните файл (`git checkout HEAD -- apps/web/src/config/brands.ts`). Проверяйте светлую и тёмную тему, десктоп и телефон.

## Ловушки

- Не запускать `prettier --write` на целых папках: переформатирует чужой код. Форматировать только свои файлы.
- Раньше в `in-data-[skin=…]:` порядок классов в CSS решал победителя при равной специфичности. Если класс скина не применился, посмотреть порядок в сгенерированном CSS и поставить вариант с `sm:` или `dark:` отдельно (`in-data-[skin=minimal]:sm:...`).
- Общую библиотеку нужно собирать после правок типов: `NODE_OPTIONS=--max-old-space-size=6144 npm run build` в `packages/shared`.


## Скин `listing` (в духе booking.com, сделан 28.10.2026, назначен Ampar и 1000+1 Travel)

Главное отличие от двух других: каталог идёт строками (фото слева, факты в середине, цена и кнопка справа), а не сеткой карточек. Бейджи показывают только реальные данные: «Осталось мест: N» (5 и меньше на ближайшей дате), скидка, оценка отзывов.

Как устроен: как и `minimal`, акцент приравнен к основному цвету (`layout.tsx`), но настоящий второй цвет бренда остаётся в переменной `--brand-accent` (используется для значка скидки и счётчиков). `data-skin='listing'` тоже получает Inter и плоские тени (`globals.css`). Фон страницы `slate-50`.

| Файл | Как |
|---|---|
| `components/layout/Header/HeaderListing.tsx` (новый) | сплошная полоса цвета бренда, под ней широкая строка поиска с без рамки; `ContactIcons` и `LanguageMenu` получили проп `onDark` |
| `features/events/components/EventCard/EventCardListing.tsx` (новый) | карточка-строка; данные из `useEventCardState` (добавлены `spotsLeft`, `hasFreeCancellation`, `ratingCount`) |
| `app/[locale]/(home)/_components/events-grid.ts` | у `listing` одна колонка, `max-w-5xl` |
| `EventCardSkeleton.tsx`, `EventsFiltersBarSkeleton.tsx` | версия строкой; панель фильтров берёт минималистичную заглушку |
| `filters/EventsFiltersBar.tsx`, `components/filters/FilterTriggerButton.tsx` | плоские кнопки с малым скруглением, активная в цвете бренда. Своя панель у `listing`: одна строка на любой ширине без кнопки «Фильтры», сначала дата, гости, сложность, цена, потом категории |
| `features/banners/components/BannerCarousel.tsx`, `BannerSlide.tsx` | баннер высотой 14–20rem с боковыми отступами (`max-w-5xl`, в одну ширину со списком), подпись без капса |
| `app/[locale]/events/[id]/EventPageListing.tsx` (новый) | хлебные крошки, оценка рядом с заголовком, мозаика фото, полоса фактов, липкая панель разделов, разделы в рамках |
| `features/bookings/components/BookingSidebar/BookingSidebar.tsx` | ветка `isListing`: цветная шапка с ценой, даты строками, бейджи, места |
| `features/bookings/components/OccurrencePicker/OccurrenceRows.tsx` (новый) | даты строками с радио и ценой; используются и в сайдбаре, и в `BookingForm` |
| Button, Input, Modal, ModalHeader, AuthModal, Footer, Skeleton, BookingCard | к каждому классу `in-data-[skin=minimal]:` добавлен такой же `in-data-[skin=listing]:`, скругления мельче (`rounded-md`, `rounded-lg`) |
| `lib/i18n/messages/*/event.ts` | ключи `onlySpotsLeft`, `chooseDates`, `reviewsCount`, `nextDeparture` |

Дополнительно для `listing`:

| Файл | Как |
|---|---|
| `components/layout/Footer/Footer.tsx` | сплошной цвет бренда, белые ссылки, `ContactIcons onDark` |
| `components/layout/BottomNavbar/BottomNavbar.tsx` | ветка `minimal`, но панель цвета бренда, белые подписи, счётчики цветом `--brand-accent` |
| `app/[locale]/profile/ProfileContent.tsx` | своя ветка `isListing`: цветная полоса с квадратным аватаром и кнопкой выхода, ниже плитки-ссылки в сетке |
| `features/bookings/components/BookingCard/BookingCard.tsx` | карточка брони строкой (фото слева от `sm`) с рамкой; `BookingsPageContent` и `FavoritesPageContent` для `listing` дают колонку/две колонки в ширину строки поиска |
| `ProfileSkeleton`, `BookingsSkeleton`, `EventDetailSkeleton` | у каждой своя версия `...Listing` |
| `features/favorites/components/FavoriteButton.tsx` | белая плитка со скруглением `md`, в избранном рамка и сердце цвета бренда |
| `components/ui/LanguageSwitcher/LanguageCode.tsx` (новый) | язык: квадрат с кодом `RU`, в меню строки «код + название» |
| `components/layout/Header/ContactIcons.tsx` | проп `square`: контакты квадратными кнопками с рамкой (шапка и футер `listing`) |
| `components/layout/Header/HeaderListing.tsx` | «Избранное» и «Брони» значком над подписью |
| `components/ui/Modal/Modal.tsx`, `ModalHeader`, `ModalCloseButton` | цветная верхняя кромка, заголовок слева с линией под ним, квадратная кнопка закрытия |
| `app/[locale]/not-found.tsx` | у каждого скина своя 404: классическая, левая тихая надпись у `minimal`, карточка с двумя кнопками у `listing` |

Не переделано у `listing`: «Избранное», «Мои брони» (шапка и пустое состояние), форма отзыва, «О нас» и правовые страницы, календарь «Когда?». Шрифт общий с `minimal` (Inter).

## Общие для `minimal` и `listing`

| Файл | Как |
|---|---|
| `features/bookings/components/QuantitySelector/QuantitySelector.tsx` | выбор количества мест: у `minimal` строка между линиями с круглыми кнопками, у `listing` рамка и квадратные кнопки цвета бренда |
| `components/ui/EmptyState/EmptyState.tsx` (новый) | пустые «Брони» и «Избранное»: у каждого скина свой вид (диск, тонкая иконка слева, карточка с квадратной иконкой) |
| `app/[locale]/bookings/BookingsPageContent.tsx` | выбор статуса и пустой список «по этому фильтру ничего нет»: у `minimal` круглая рамка и пустое место между линиями, у `listing` квадратная рамка и белая карточка |
| `app/globals.css` (блок «Filter panels») | панели фильтров (календарь «Когда?», гости, цена, сложность, категории и их копии в мобильном ящике): класс `filter-panel`, `filter-box`, `price-field` и набор токенов у каждого скина. Обычный CSS, потому что календарь и ползунок сторонние, а правила вне слоёв перебивают утилиты |
| `features/reviews/components/StarRating.tsx`, `EventReviews.tsx` | звёзды: у `minimal` чёрные, у `listing` цвета бренда; отзывы: у `minimal` строки с линиями, у `listing` белые карточки и оценка в квадрате |
| `app/[locale]/bookings/[id]/review/ReviewPageContent.tsx` | форма отзыва: у `minimal` узкая колонка и линии, у `listing` форма в белой карточке |
| `app/[locale]/about/AboutPageContent.tsx` | «О нас»: у `minimal` крупный заголовок и разделы между линиями, у `listing` цветная полоса и три карточки с иконками; в разделе контактов кнопки связи |
| `app/[locale]/legal/LegalPageContent.tsx` | «Условия» и «Политика»: у `minimal` узкая колонка, крупный заголовок, разделы между линиями; у `listing` цветная полоса, слева липкое оглавление со ссылками на разделы, справа нумерованные карточки |
| `filters/CategoryFilterSection.tsx` | до четырёх категорий все на экране, при пяти и больше первые три и остальные в «Ещё» (`classic`, `minimal`); у `listing` «Ещё» нет, ряд прокручивается |
| `filters/GuestsFilterSection.tsx` | выбор гостей: у `minimal` крупное число между круглыми кнопками без рамки, у `listing` рамка с квадратными кнопками по краям |


## Скин `soft` (близкий к `classic`, но другой; сделан 28.10.2026, назначен Yerivar)

Задача была в том, чтобы сайт узнавался как «сделано той же командой», но не как тот же сайт. Поэтому остались округлые формы, два цвета бренда и дружелюбный тон `classic`, а изменились бумага, шрифт заголовков и раскладка главных блоков.

Что общее для всего сайта (почти даром, через токены в `globals.css`, блок «The soft skin», действует везде кроме админки: её корень помечен `.admin-root`):
- вся серая шкала `--color-gray-*` заменена на тёплую «бумажную» (кремовые фоны, коричневатый серый текст, в тёмной теме тёплый тёмный);
- радиусы `2xl/3xl/4xl` чуть меньше, тени тёплые;
- заголовки `h1–h3` набраны шрифтом Fraunces (`--font-display`; шрифт из пакета `@fontsource-variable/fraunces`, подключён в `layout.tsx`);
- настоящий второй цвет бренда остаётся (как у `classic`), плюс `--brand-accent`.

| Файл | Как |
|---|---|
| `components/layout/Header/HeaderSoft.tsx` (новый) | одна полоса цвета бренда с закруглённым низом вместо градиентной ленты и полосы, название-вордмарк, поиск-таблетка по центру, кнопки-таблетки |
| `components/layout/Footer/Footer.tsx` | зеркальная полоса цвета бренда с закруглённым верхом |
| `components/layout/BottomNavbar/BottomNavbar.tsx` | плавающая таблетка с отступами, активный раздел в светлой плашке |
| `features/events/components/EventCard/EventCardSoft.tsx` (новый) | белая плитка с фото внутри, дата на плашке поверх фото, цена шрифтом с засечками и круглая кнопка; сетка в `events-grid.ts` |
| `features/banners/*` | баннер в белой рамке-кольце с тенью, заголовок шрифтом с засечками без капса |
| `components/filters/FilterTriggerButton.tsx` | кнопки фильтров и категорий-таблетки |
| `app/[locale]/events/[id]/EventPageSoft.tsx` (новый) | заголовок и плашки сверху, потом мозаика фото в рамке, факты, карточки текста |
| `features/bookings/components/BookingSidebar/BookingSidebar.tsx` | ветка `isSoft`: «билет» с перфорацией, цена шрифтом с засечками, выбор даты в тёплой плашке |
| Button, Input, Modal | токены `in-data-[skin=soft]:`: кнопки-таблетки, поля `rounded-2xl`, модалка на кремовом фоне |
| `not-found.tsx`, `EmptyState.tsx` | карточка с пунктирной рамкой |

Профиль, брони и избранное для `soft` сделаны: профиль (`ProfileContent.tsx`, ветка `isSoft`) шапкой-карточкой с кругом-аватаром и плитками-ссылками; карточка брони (`BookingCard.tsx`) с фото внутри плитки и пунктирной линией; страницы «Брони» и «Избранное» с круглой иконкой в заголовке и своими заглушками загрузки.

«О нас» (`AboutPageContent.tsx`: белая карточка-шапка с круглыми пятнами, две карточки миссии и истории, контакты в пунктирной рамке), правовые страницы (`LegalPageContent.tsx`: плашка-вступление и пронумерованные карточки с кружком) и форма отзыва (`ReviewPageContent.tsx`: форма в белой карточке `rounded-[2rem]`, мягкие поля) для `soft` сделаны.

Не делалось отдельно (выглядит как `classic` в тёплых цветах и с засечками в заголовках): панели фильтров (календарь, гости, цена), выбор количества мест, заглушки загрузки кроме карточки каталога.

Кнопка «Написать отзыв» внизу страницы тура (все скины): `WriteReviewButton`, данные из `reviewableBookingId` в ответе `GET /events/:id/reviews`.
| `features/banners/components/BannerCarousel.tsx` (`INDICATOR`) | индикатор слайдов у каждого скина свой: `classic` белые таблетки на фото, `minimal` тонкие чёрточки под баннером, `listing` квадратные точки на тёмной плашке справа, `soft` точки в белой плавающей капсуле |
| `components/ui/Buttons/Button/Button.tsx` (вариант `secondary`) | вторая кнопка у каждого скина своя: `classic` без изменений (рамка цвета бренда), `minimal` серая заливка, `listing` контур цвета бренда, `soft` белая с тёплой рамкой и тенью. |
| `components/ui/Toast/ToastContainer.tsx` | тосты: `classic` как был (цветная таблетка), `minimal` тёмная плашка внизу по центру (в тёмной теме светлая) с точкой статуса, `listing` карточка сверху справа с цветной полосой слева и иконкой, `soft` белая карточка с круглой иконкой (у успеха на градиенте бренда). |
| `features/bookings/components/PaymentSummary.tsx`, `StripePaymentForm.tsx` | сводка в окне оплаты у каждого скина своя. |
| `features/bookings/components/modals/BookingSuccessModal.tsx` (`SUCCESS_UI`, `DETAIL_UI`) | экран после оплаты: шапка, номер брони, плитки деталей и «что включено» у каждого скина свои. |
| `features/search/components/SearchDropdown.tsx` (`LOOK`) | выпадающие подсказки под полем поиска: панель, заголовки, строки, миниатюры и цена у каждого скина свои. Логика (история, рекомендуемые, живые подсказки, клавиатура) общая, в `useSearchBox`. |

## Подсказки поиска

- API: `GET /search/suggestions?q=` (туры и категории, тот же нечёткий поиск, что и в выдаче), `GET /search/recommended` (самые бронируемые за 30 дней, остаток добирается случайными; в интерфейсе называется «Рекомендуемые туры»), `GET|POST /search/history`, `DELETE /search/history/:id` (только для вошедших).
- История хранится на сервере в таблице `search_queries`: строки не склеиваются, поэтому по ней можно считать «часто ищут» и показывать админам, что ищут. `hidden` убирает запрос только из подсказок самого человека.
- Каждая шапка (`Header*.tsx`) оборачивает поле в контейнер с `searchBox.containerRef` и кладёт внутрь `<SearchDropdown box={searchBox} />`; контейнер не должен иметь `overflow-hidden`, иначе список обрежется.


## Скин `market` (в духе маркетплейсов Ozon и Wildberries; сделан 29.10.2026, пока ни одному бренду не назначен)

Плотный каталог из белых карточек без рамок, один цвет бренда (как у `minimal` и `listing`: акцент = основной, настоящий второй цвет в `--brand-accent` для скидки и счётчиков). Шрифт Inter, плоские тени (блок `minimal/listing/market` в `globals.css`). Фон страницы белый.

| Файл | Как |
|---|---|
| `components/layout/Header/HeaderMarket.tsx` (новый) | белая полоса: название, одно широкое поле поиска с рамкой цвета бренда и сплошной кнопкой на конце, ссылки аккаунта значком над подписью, на телефоне поиск вторым рядом |
| `features/events/components/EventCard/EventCardMarket.tsx` (новый) | плитка: фото `5/4`, цена крупнее всего, цена со скидкой цветом `--brand-accent` и старая зачёркнутая, название в две строки, дата и оценка, красная строка «Осталось мест» при 5 и меньше, кнопка на всю ширину |
| `app/[locale]/(home)/_components/events-grid.ts`, `EventCardSkeleton.tsx` | 2 колонки на телефоне, до 5 на `xl`, ширина `1400px` |
| `features/banners/*` | баннер со скруглением, подпись без капса, точки внутри внизу по центру |
| Button, Input, Modal | токены `in-data-[skin=market]:`: скругление `rounded-xl`, без теней, затемнение без размытия |
| `ToastContainer.tsx`, `SearchDropdown.tsx` | тост как у `minimal`; панель подсказок со скруглением `2xl` |
| `BookingSuccessModal.tsx` | см. ниже: свой вид `market` |

Остальные поверхности `market` (сделаны 29.10.2026):

| Файл | Как |
|---|---|
| `app/[locale]/events/[id]/EventPageMarket.tsx` (новый) | как страница товара: заголовок и оценка, большое фото с лентой миниатюр, факты и разделы в рамках `rounded-2xl`, справа липкая панель бронирования |
| `BookingSidebar.tsx` (ветка `isMarket`) | цена крупно, со скидкой цветом `--brand-accent` и значком, даты плитками (`OccurrenceChips`), шкала мест, красное «скоро закончатся» |
| `QuantitySelector.tsx`, `BookingForm.tsx`, `OccurrencePicker.tsx` | токены `in-data-[skin=market]:`; даты плитками, как у `minimal` |
| `Footer.tsx` | серая плашка с закруглённым верхом |
| `BottomNavbar.tsx` | общая плоская панель (`isFlatSkin`), активный раздел цветом бренда |
| `FilterTriggerButton.tsx`, `globals.css` (токены `:root[data-skin='market']`) | кнопки фильтров и категорий серые `rounded-xl`, активная в цвете бренда; панели (календарь, гости, цена) через те же токены, что у `listing`, но скругление крупнее |
| `ProfileContent.tsx` (ветка `isMarket`) | слева карточка с аватаром и выходом, справа плитки-ссылки |
| `BookingCard.tsx`, `BookingsPageContent.tsx`, `FavoritesPageContent.tsx`, `EmptyState.tsx` | карточка брони с рамкой, избранное той же сеткой, что каталог, пустое состояние плиткой-иконкой |
| `AboutPageContent.tsx`, `LegalPageContent.tsx`, `not-found.tsx`, `ReviewPageContent.tsx` | шапка-плашка `bg-primary/10`, три карточки с квадратными значками; правовые с липким оглавлением; форма отзыва в карточке |
| `PaymentSummary.tsx`, `StripePaymentForm.tsx`, `BookingSuccessModal.tsx` (`SUCCESS_UI.market`, `DETAIL_UI.market`) | окно оплаты и экран после оплаты |
| `Modal`, `ModalHeader`, `ModalCloseButton`, `AuthModal`, `Skeleton` | токены `in-data-[skin=market]:` |
| `EventDetailSkeleton`, `EventsFiltersBarSkeleton`, `BookingsSkeleton`, `ProfileSkeleton` | своя версия `...Market`, выбор через `in-data-[skin=market]:` |

| `features/reviews/components/EventReviews.tsx` | оценка жёлтой плашкой, отзывы серыми плитками в две колонки с кругом-аватаром, ответ компании белой карточкой с полосой слева; звёзды остались жёлтыми |

Остальные модалки `market` (29.10.2026): `ConfirmModal`, `ContactModal` (иконка в плитке `bg-primary/10`, ссылка в рамке), `ChangeQuantityModal`, `ChangeEmailModal`, `EditProfileModal`, `BookingQrCode` — внутренняя карточка без тени, тёмный фон `neutral-900`, заголовок тёмным (не цветом бренда); сама `Modal` получила тёмный фон и мягкую тень. Окна входа, регистрации, сброса пароля и подтверждения почты (`AuthModal.tsx`): на `md` и шире окно делится надвое — слева светлая подложка цвета бренда (`bg-primary/10`) с названием и тремя плюсами (`auth.marketPerk1…3`), справа форма; на телефоне панели нет, остаётся одна форма. Просмотр фото (`ImagePreviewModal`) на тёмной подложке и от скина не зависит. Админские модалки скином не оформляются.

Баннер (`BannerCarousel.tsx`, `INDICATOR` и `ARROW`): стрелки у каждого скина свои — `classic` белый круг, `minimal` круг с контуром рядом с индикатором, `listing` тёмные квадраты у самых краёв, `soft` крупные белые круги со стрелками `←` `→`, `market` высокие узкие белые вкладки. Индикатор `soft`: все точки круглые, выбранная белая и крупнее остальных, капсула тёмная полупрозрачная (длинной точки нет). У `market` вместо точек счётчик «2 / 5» тёмной плашкой справа внизу.

Сердечко избранного у `market` (`FavoriteButton.tsx`): плоский белый круг на фото (серый на фоне страницы), контурное сердце, после добавления заливается красным.

Контакты у `market` и `soft` (`ContactTile.tsx`): одна плитка «Связаться» вместо ряда иконок, по нажатию список каналов (Instagram, телефон, почта, карта) — каждый прямая ссылка, без отдельного окна. У `market` серая плитка `rounded-xl` и компактный список со светлыми значками; у `soft` плитка-пилюля в шрифте заголовков, а список из округлых карточек-строк с круглыми сплошными значками, заголовками в шрифте скина и стрелкой справа. Её показывает и `ContactIcons.tsx` (подвал, «О нас»), поэтому там отдельных правок нет; у остальных скинов остались ряды иконок с окном `ContactModal`. Подписи берутся из `header.contact…Title`, кнопка из `header.contactUs`.

Письма клиентам от скина не зависят.


## Скин `drawer` (с меню в правом углу, сделан 29.10.2026, пока ни одному бренду не назначен)

Главная идея: всё, что не поиск, спрятано за одной кнопкой «Меню» в правом углу шапки. Остальной сайт: крупные округлости (`rounded-[2rem]`), таблетки-кнопки, карточки-постеры, заголовки жирным и плотным шрифтом (Inter). Один цвет бренда (акцент = основной, `isFlatSkin`), настоящий второй цвет в `--brand-accent`. Фон страницы `stone-50`, тёмная тема `neutral-950`.

| Файл | Как |
|---|---|
| `components/layout/Header/HeaderDrawer.tsx` (новый) | название слева, поиск-таблетка с круглой кнопкой, справа кнопка «Меню» (на телефоне круг); точка на кнопке, если есть брони или избранное |
| `components/layout/Header/MenuDrawer.tsx` (новый) | панель, выезжающая справа (портал, фокус-ловушка, Esc, блокировка прокрутки): вход и регистрация или аккаунт со ссылками на избранное, брони, профиль и выходом; «О нас», условия, политика; контакты (прямые ссылки); язык таблетками |
| `components/layout/Header/ContactTile.tsx` | хук `useContactChannels()` вынесен отсюда, им пользуется и меню |
| `features/events/components/EventCard/EventCardDrawer.tsx` (новый) | карточка-постер: фото на всю карточку, тёмное затухание снизу, скидка и сердечко сверху, название, дата, оценка, цена и действие снизу (на узком экране действие кружком) |
| `events-grid.ts`, `EventCardSkeleton.tsx` | сетка 2/3/4 колонки до `max-w-7xl`; скелетон поста `aspect-3/4` |
| `BannerCarousel.tsx` (`INDICATOR.drawer`, `ARROW.drawer`), `BannerSlide.tsx` | счётчик «01 — 03» слева внизу, стрелки-кружки с контуром справа внизу, заголовок без капса |
| `FavoriteButton.tsx` | стеклянный круг на постере, контур белый, после добавления красная заливка |
| `Footer.tsx` | тёмная плита с названием бренда крупно, без иконок контактов (они в меню) |
| `EventPageDrawer.tsx` (новый) | фото во всю ширину с названием, рейтингом и местом поверх; кнопки «Назад», «Поделиться» и сердечко стеклом; миниатюры; плашки длительности и сложности; разделы без рамок с крупными заголовками |
| `AuthModal.tsx` | название бренда сверху, переключатель «Войти / Регистрация» таблеткой вместо ссылки внизу |
| `AboutPageContent.tsx` | плита цвета бренда с огромным названием и три пронумерованных ряда |
| `Button`, `Input`, `Modal`, `ModalHeader`, `ModalCloseButton`, `GoogleButton`, `Skeleton`, `ModalDivider` | токены `in-data-[skin=drawer]:`: кнопки таблетками, контурная вторичная, поля `rounded-2xl`, модалки `rounded-[2rem]` |
| `globals.css` | все селекторы панелей фильтров `market` продублированы для `drawer`; радиус панелей 1.5rem, контролы таблетками |
| `Toast`, `SearchDropdown`, `BookingSuccessModal`, `ContactIcons` | записи `drawer` в картах по скинам |

Своя вёрстка у `drawer` и на остальных страницах (второй проход): профиль (цветная плита с аватаром и ряды-таблетки), «Мои брони» (карточки со скруглением 2rem, фильтр таблеткой) и «Избранное» (сетка постеров 2/3/4), карточка брони, отзывы (одна колонка, тонированные плитки), правовые страницы (огромный заголовок, оглавление таблетками, нумерованные ряды), 404 (гигантские цифры), пустые состояния (сплошной круглый значок), панель бронирования (тонированная подложка вместо рамки, цена `text-4xl`, скидка таблеткой), скелетоны профиля, броней и страницы тура. Модалки (подтверждение, количество, почта, профиль, QR, контакт), окна оплаты и экран после оплаты используют общие токены и вёрстку `market`, вид у них отличается только формой кнопок, полей и скруглением окна. Выбор даты (`OccurrenceChips`) и количество мест общие с `market`.

`drawer` назначен брендом по умолчанию (`defaultBrand`, то есть локальная разработка и неизвестные хосты); остальным брендам скин не менялся.
