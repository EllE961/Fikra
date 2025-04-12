import * as Sentry from '@sentry/react-native';
import { ENV } from '../constants/env';

export function initSentry() {
  if (!ENV.SENTRY_DSN) {
    console.log('Sentry DSN not found. Skipping Sentry init.');
    return;
  }

  Sentry.init({
    dsn: ENV.SENTRY_DSN,
    environment: ENV.ENV_NAME,
    // 1.0 means "trace 100% of transactions", consider lower in production
    tracesSampleRate: 1.0, 
  });
}
