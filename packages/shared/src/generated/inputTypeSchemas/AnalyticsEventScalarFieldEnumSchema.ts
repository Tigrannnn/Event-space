import { z } from 'zod';

export const AnalyticsEventScalarFieldEnumSchema = z.enum(['id','type','visitorId','day','targetKey','eventId','sourceRef','createdAt']);

export default AnalyticsEventScalarFieldEnumSchema;
