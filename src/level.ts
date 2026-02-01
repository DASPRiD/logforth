export const DISABLE_LOGGING = 999;

export class LogLevel {
    public static Fatal = new LogLevel("fatal", 60);
    public static Error = new LogLevel("error", 50);
    public static Warn = new LogLevel("warn", 40);
    public static Info = new LogLevel("info", 30);
    public static Debug = new LogLevel("debug", 20);
    public static Trace = new LogLevel("trace", 10);

    public readonly name: LogLevelName;
    public readonly level: number;

    private constructor(name: LogLevelName, level: number) {
        this.name = name;
        this.level = level;
    }

    public static fromName(name: string): LogLevel {
        switch (name) {
            case "fatal":
                return LogLevel.Fatal;
            case "error":
                return LogLevel.Error;
            case "warn":
                return LogLevel.Warn;
            case "info":
                return LogLevel.Info;
            case "debug":
                return LogLevel.Debug;
            case "trace":
                return LogLevel.Trace;
        }

        throw new Error(`Unknown log level: ${name}`);
    }

    public toString(): LogLevelName {
        return this.name;
    }

    public static names(): readonly LogLevelName[] {
        return ["fatal", "error", "warn", "info", "debug", "trace"];
    }
}

export type LogLevelName = "fatal" | "error" | "warn" | "info" | "debug" | "trace";

/**
 * @deprecated Use `DISABLE_LOGGING` instead.
 */
export const disableLogging = 999;
