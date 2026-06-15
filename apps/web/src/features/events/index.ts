// API
export { eventApi } from './api/events.api';
export type { PaginatedEventsResponse, GetEventsParams } from './api/events.api';

// Hooks
export { useEvents, useEventById } from './hooks/useEvents';

// Components
export { default as EventCard } from './components/EventCard';
export { CategoryBadge } from './components/CategoryBadge';
export { PriceBadge } from './components/PriceBadge';
export { CapacityBar } from './components/CapacityBar';
export { EventImage, EventImageWithFallback } from './components/EventImage';
export { EventImageFallback } from './components/EventImage/EventImageFallback';

// Component Types
export type { EventCardProps } from './components/EventCard';
export type { CategoryBadgeProps } from './components/CategoryBadge';
