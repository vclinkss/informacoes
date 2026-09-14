import { ILogger } from "../../Application/Contracts/Logger/ILogger";

export class ConsoleLogger implements ILogger {
  private format(
    level: string,
    message: string,
    meta?: Record<string, unknown>
  ): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  info(message: string, meta?: Record<string, unknown>): void {
    console.log(this.format("info", message, meta));
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(this.format("warn", message, meta));
  }

  error(message: string, meta?: Record<string, unknown>): void {
    console.error(this.format("error", message, meta));
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== "production") {
      console.debug(this.format("debug", message, meta));
    }
  }
}
