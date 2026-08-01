import type { Messages } from '../types';
import { favorites } from './favorites';
import { common } from './common';
import { filters } from './filters';
import { header } from './header';
import { auth } from './auth';
import { profile } from './profile';
import { event } from './event';
import { booking } from './booking';
import { cancellation } from './cancellation';
import { admin } from './admin';
import { error } from './error';
import { apiErrors } from './apiErrors';

export const ru: Messages = {
	favorites,
	common,
	filters,
	header,
	auth,
	profile,
	event,
	booking,
	cancellation,
	admin,
	error,
	apiErrors,
};
