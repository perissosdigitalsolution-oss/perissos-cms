import { Logtail } from '@logtail/node';

export const logger = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN!, {
  endpoint: 'https://in.logtail.com',
});

export function logInfo(message: string, meta?: Record<string, unknown>) {
  logger.info(message, meta);
}

export function logError(message: string, meta?: Record<string, unknown>) {
  logger.error(message, meta);
}

export function logWarn(message: string, meta?: Record<string, unknown>) {
  logger.warn(message, meta);
}
