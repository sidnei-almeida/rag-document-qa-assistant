import { WELCOME_MESSAGE } from '../utils/constants';

export function getWelcomeMessages() {
  return [{ ...WELCOME_MESSAGE, timestamp: new Date().toISOString() }];
}
