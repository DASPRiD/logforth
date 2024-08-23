import path from "node:path";
import { inspect } from "node:util";
import chalk from "chalk";
import { type StackFrame, isError, parseStack } from "../error.js";
import { type LogEntry, LogLevel, type Transport } from "../logger.js";

const logLevelNames: Record<LogLevel, string> = {
    [LogLevel.Fatal]: chalk.redBright("FATAL"),
    [LogLevel.Error]: chalk.red("ERROR"),
    [LogLevel.Warn]: chalk.yellow("WARN"),
    [LogLevel.Info]: chalk.blue("INFO"),
    [LogLevel.Debug]: chalk.green("DEBUG"),
    [LogLevel.Trace]: chalk.greenBright("TRACING"),
};

const metaStart = chalk.gray("[");
const metaEnd = chalk.gray("]");
const colorsSupported = chalk.level > 0;

export class PrettyTransport implements Transport {
    public log(entry: LogEntry): void {
        let output = `${metaStart}${entry.time.toISOString().slice(0, -5)}Z ${
            logLevelNames[entry.level]
        }${metaEnd} ${entry.message}`;
        const attributeEntries = Object.entries(entry.attributes);

        if (attributeEntries.length === 0) {
            output += "\n";
            process.stdout.write(output);
            return;
        }

        for (const [key, value] of attributeEntries) {
            output += `  ${chalk.gray(`${key}:`)}`;
            output += formatAttribute(value).replace(/^(?!$)/gm, "  ");
        }

        process.stdout.write(output);
    }
}

const formatAttribute = (value: unknown): string => {
    if (!isError(value)) {
        return inspect(value, { colors: colorsSupported, compact: false });
    }

    let result = `${value.name}: ${value.message}`;

    if (value.stack) {
        result += `\nStack: ${formatStack(parseStack(value.stack))}`;
    }

    return result;
};

export const formatStack = (frames: StackFrame[]): string => {
    const lines = [];

    for (const frame of frames) {
        let line = "  • ";

        if (frame.functionName) {
            line += chalk.yellow(
                frame.typeName ? `${frame.typeName}.${frame.functionName}` : frame.functionName,
            );
        } else {
            line += chalk.yellow("<anonymous>");
        }

        line += "\n    ";

        const { location } = frame;

        if (location.type === "file") {
            const shortenedPath = path.relative(
                "",
                location.filename.startsWith("file://")
                    ? location.filename.substring(7)
                    : location.filename,
            );

            line += `${chalk.gray("in")} ${shortenedPath} ${chalk.gray("at line")} ${
                location.lineNumber
            }:${location.columnNumber}`;
        } else {
            line += `${chalk.gray("in")} ${location.name}`;
        }

        lines.push(line);
    }

    return lines.join("\n");
};
