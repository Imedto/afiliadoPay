type LogLevel = "info" | "warn" | "error";

interface LogContext {
  requestId?: string;
  apiKeyId?: string;
  userId?: string;
  [key: string]: unknown;
}

export function log(level: LogLevel, message: string, context: LogContext = {}) {
  const payload = {
    level,
    message,
    time: new Date().toISOString(),
    ...context,
  };
  console.log(JSON.stringify(payload));
}

