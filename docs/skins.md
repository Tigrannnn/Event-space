# Скины сайта (classic, minimal) и как добавить третий

Скин — это то, как выглядит и как устроен сайт компании кроме цветов: шапка, карточки, страница тура, модалки. Нужен, чтобы сайты разных компаний-конкурентов не выглядели одним сайтом в разных красках. Админка скинов не имеет.

Сейчас два скина: `classic` (по умолчанию, все бренды) и `minimal` (в духе Airbnb и hyurservice: белый фон, один цвет, плоские поверхности). Назначается в `packages/shared/src/constants/brands.constant.ts`, поле `skin` у бренда. Сейчас `minimal` у Buggy Tour.

## Как это устроено

Три механизма, они работают вместе.

1. **`Brand.skin` и `useSkin()`** (`apps/web/src/providers/BrandProvider.tsx`). Для клиентских компонентов с разной вёрсткой: `const skin = useSkin()` и ветка по скину. Так сделаны шапка, карточка тура, страница тура, профиль, нижняя панель и др.
2. **CSS-вариант `in-data-[skin=minimal]:`** (Tailwind 4). Атрибут `data-skin` стоит на `<html>` (`app/[locale]/layout.tsx`), поэтому вариант срабатывает в любом месте страницы, в том числе в серверных компонентах и в порталах (модалки). Так сделаны кнопка, поле, модалка, скелетоны и мелкие правки внутри общих компонентов. Класс должен быть записан целиком, строкой: Tailwind не видит склеенных из кусков. Для тёмной темы: `in-data-[skin=minimal]:dark:...`.
3. **Переменные в `layout.tsx` и `globals.css`.** В `layout.tsx` для `minimal` акцент приравнивается к основному цвету (`--color-accent = --color-primary`), поэтому все градиенты `from-primary to-accent` на всём сайте стали плоскими без правок в компонентах. Там же шрифт (Inter через `--font-minimal-latin`, подключается только для `minimal`) и фон `body`. В `globals.css` блок `:root[data-skin='minimal']` переопределяет шрифт и тени.

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

- Календарь «Когда?» в фильтрах каталога (`components/filters/DateRangePicker.tsx`) и ползунок цены.
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
