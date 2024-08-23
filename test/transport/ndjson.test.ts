import { afterAll, afterEach, beforeEach, expect, it, vi } from 'vitest';
import { LogLevel, NdJsonTransport } from '../../src/index.js';

const fakeTime = new Date("2000-01-01T00:00:00.000Z");
let outputs: (string | Uint8Array)[] = [];
const processMock = vi.spyOn(process.stdout, "write").mockImplementation((data) => {
    outputs.push(data);
    return true;
});

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fakeTime);
});

afterEach(() => {
    vi.useRealTimers();
    processMock.mockClear();
    outputs = [];
});

afterAll(() => {
    processMock.mockReset();
});

it("should send log to transport", () => {
    const transport = new NdJsonTransport();
    transport.log({
        time: fakeTime,
        level: LogLevel.Info,
        message: "Test message",
        attributes: {},
    });

    expect(processMock).toHaveBeenNthCalledWith(1, '{"time":"2000-01-01T00:00:00.000Z","msg":"Test message","level":"info"}');
    expect(processMock).toHaveBeenNthCalledWith(2, "\n");
});

it("should merge attributes", () => {
    const transport = new NdJsonTransport();
    transport.log({
        time: fakeTime,
        level: LogLevel.Info,
        message: "Test message",
        attributes: {
            foo: "bar",
        },
    });

    expect(processMock).toHaveBeenNthCalledWith(1, '{"time":"2000-01-01T00:00:00.000Z","msg":"Test message","level":"info","foo":"bar"}');
    expect(processMock).toHaveBeenNthCalledWith(2, "\n");
});

it("should serialize errors", () => {
    const transport = new NdJsonTransport();
    transport.log({
        time: fakeTime,
        level: LogLevel.Info,
        message: "Test message",
        attributes: {
            foo: new Error(),
        },
    });

    const json = JSON.parse(outputs[0] as string);
    expect(json).toHaveProperty("foo");
    expect(json.foo).toHaveProperty("name");
    expect(json.foo).toHaveProperty("message");
    expect(json.foo).toHaveProperty("stack");
});
