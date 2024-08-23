import { isNativeError } from "node:util/types";

export const isError = (arg: unknown): arg is Error => arg instanceof Error || isNativeError(arg);

export type StackFrame = {
    isConstructor: boolean;
    isAsync: boolean;
    typeName?: string;
    functionName?: string;
    location: FrameLocation;
};

export type FileLocation = {
    type: "file";
    filename: string;
    lineNumber: number;
    columnNumber: number;
};

export type OtherLocation = {
    type: "other";
    name: string;
};

export type FrameLocation = FileLocation | OtherLocation;

// We are closely following the V8 stack trace documentation here, though some slight differences
// have been discovered. We do not parse eval locations deeply here, but instead just extract the
// file location.
//
// @see https://v8.dev/docs/stack-trace-api
const stackFrameRegexp = /^ +at (?:(new|async) )?(?:(?:([^.]+)\.)?([^ ]+) \((.+)\)|(.+))$/;
const locationRegexp =
    /^(native|unknown location)$|^eval at .+\((.+):(\d+):(\d+)\)|^(.+):(\d+):(\d+)/;

export const parseStack = (stack: string) => {
    return stack.split("\n").reduce<StackFrame[]>((frames, line) => {
        const frame = parseStackFrame(line);

        if (frame) {
            frames.push(frame);
        }

        return frames;
    }, []);
};

const parseStackFrame = (line: string): StackFrame | null => {
    const match = stackFrameRegexp.exec(line);

    if (!match) {
        return null;
    }

    return {
        isConstructor: match[1] === "new",
        isAsync: match[1] === "async",
        typeName: match[2],
        functionName: match[3],
        location: parseLocation(match[4] ?? match[5]),
    };
};

const parseLocation = (raw: string): FrameLocation => {
    const match = locationRegexp.exec(raw);

    if (!match) {
        return { type: "other", name: "unknown location" };
    }

    if (match[1]) {
        return { type: "other", name: match[0] };
    }

    if (match[5] && match[6] && match[7]) {
        return {
            type: "file",
            filename: match[5],
            lineNumber: Number.parseInt(match[6], 10),
            columnNumber: Number.parseInt(match[7], 10),
        };
    }

    if (match[2] && match[3] && match[4]) {
        return {
            type: "file",
            filename: match[2],
            lineNumber: Number.parseInt(match[3], 10),
            columnNumber: Number.parseInt(match[4], 10),
        };
    }

    return { type: "other", name: "unknown location" };
};
