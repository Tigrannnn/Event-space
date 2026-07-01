import z from "zod";
import { LocaleSchema } from "../generated";

export const LocaleEnum = LocaleSchema;
export type Locale = z.infer<typeof LocaleEnum>;
export type LocaleIntlEnum = 'hy-AM' | 'ru-RU' | 'en-US';