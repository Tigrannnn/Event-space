import { z } from 'zod';

/////////////////////////////////////////
// SEARCH QUERY SCHEMA
/////////////////////////////////////////

/**
 * Запрос, который вошедший посетитель отправил в поиск. Строки не склеиваются: по ним потом
 * можно считать, что ищут чаще всего. `hidden` убирает запрос из подсказок самого человека, но не из счёта.
 */
export const SearchQuerySchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  query: z.string(),
  normalized: z.string(),
  hidden: z.boolean(),
  createdAt: z.coerce.date(),
})

export type SearchQuery = z.infer<typeof SearchQuerySchema>

export default SearchQuerySchema;
