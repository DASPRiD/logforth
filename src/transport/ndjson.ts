import { serializeError } from "serialize-error";
import { isError } from "../error.js";
import { type LogEntry, LogLevel, type Transport } from "../logger.js";

const logLevelNames: Record<LogLevel, string> = {
    [LogLevel.Fatal]: "fatal",
    [LogLevel.Error]: "error",
    [LogLevel.Warn]: "warn",
    [LogLevel.Info]: "info",
    [LogLevel.Debug]: "debug",
    [LogLevel.Trace]: "trace",
};

export class NdJsonTransport implements Transport {
    public log(entry: LogEntry): void {
        const result: Record<string, unknown> = {};

        result.time = entry.time.toISOString();
        result.msg = entry.message;
        result.level = logLevelNames[entry.level];

        for (const [key, value] of Object.entries(entry.attributes)) {
            if (!isError(value)) {
                result[key] = value;
                continue;
            }

            result[key] = serializeError(value);
        }

        process.stdout.write(JSON.stringify(result));
        process.stdout.write("\n");
    }
}
