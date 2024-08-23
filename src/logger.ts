import { AsyncLocalStorage } from "node:async_hooks";
import { LogLevel } from "./level.js";
import { NdJsonTransport } from "./transport/ndjson.js";

export type Transport = {
    log: (entry: LogEntry) => void;
};

export type Attributes = Record<string, unknown>;

export type LogEntry = {
    time: Date;
    level: LogLevel;
    message: string;
    attributes: Attributes;
};

export type LoggerOptions = {
    transport?: Transport;
    minLevel?: LogLevel | number;
    attributes?: Attributes;
};

export class Logger {
    private readonly transport: Transport;
    private readonly minLevel: LogLevel | number;
    private readonly attributes: Attributes;
    private readonly storage: AsyncLocalStorage<Attributes>;

    public constructor(options?: LoggerOptions) {
        this.transport = options?.transport ?? new NdJsonTransport();
        this.minLevel = options?.minLevel ?? 0;
        this.attributes = options?.attributes ?? {};
        this.storage = new AsyncLocalStorage();
    }

    public log(level: LogLevel, message: string, attributes?: Attributes): void {
        if (level < this.minLevel) {
            return;
        }

        const defaultAttributes = { ...this.attributes, ...(this.storage.getStore() ?? {}) };

        const entry: LogEntry = {
            time: new Date(),
            level,
            message,
            attributes: attributes ? { ...defaultAttributes, ...attributes } : defaultAttributes,
        };

        this.transport.log(entry);
    }

    public fatal(message: string, attributes?: Attributes): void {
        this.log(LogLevel.Fatal, message, attributes);
    }

    public error(message: string, attributes?: Attributes): void {
        this.log(LogLevel.Error, message, attributes);
    }

    public warn(message: string, attributes?: Attributes): void {
        this.log(LogLevel.Warn, message, attributes);
    }

    public info(message: string, attributes?: Attributes): void {
        this.log(LogLevel.Info, message, attributes);
    }

    public debug(message: string, attributes?: Attributes): void {
        this.log(LogLevel.Debug, message, attributes);
    }

    public async withContext<T>(attributes: Attributes, next: () => Promise<T> | T): Promise<T> {
        const defaultAttributes = this.storage.getStore() ?? {};
        return this.storage.run({ ...defaultAttributes, ...attributes }, next);
    }
}
