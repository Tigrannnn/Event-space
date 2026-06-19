import { Locale } from "@/lib/i18n/config";
import { MessageKey } from "@/lib/i18n/messages";

export interface I18nState {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    /** Function for translation to be used inside React components */
    translate: (key: MessageKey) => string;
}