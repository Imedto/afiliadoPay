type LogLevel = "info" | "warn" | "error";

interface LogContext {
  requestId?: string;
  [key: string]: unknown;
}

export function log(level: LogLevel, message: string, context: LogContext = {}) {
  console.log(
    JSON.stringify({
      level,
      message,
      time: new Date().toISOString(),
      ...context,
    }),
  );
}

