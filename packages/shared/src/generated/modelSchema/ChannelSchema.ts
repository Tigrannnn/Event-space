import { z } from 'zod';

/////////////////////////////////////////
// CHANNEL SCHEMA
/////////////////////////////////////////

/**
 * Площадка, где продаются брони или пишут отзывы. Системные каналы (isSystem) нельзя удалить
 * и архивировать: на них опирается логика. Остальные добавляются в админке и только архивируются.
 */
export const ChannelSchema = z.object({
  id: z.uuid(),
  /**
   * Неизменяемый идентификатор для кода: DIRECT, PLATFORM, GETYOURGUIDE…
   */
  code: z.string(),
  name: z.string(),
  /**
   * Название в нижнем регистре без лишних пробелов: по нему не заводятся дубли вроде «Klook» и «klook».
   */
  nameKey: z.string(),
  isSystem: z.boolean(),
  isActive: z.boolean(),
  forBookings: z.boolean(),
  forReviews: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Channel = z.infer<typeof ChannelSchema>

export default ChannelSchema;
