import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { LogEntry, Logger, LogLevel, Transport } from '../src/index.js';

class MockTransport implements Transport {
    public entries: LogEntry[] = [];

    public log(entry: LogEntry): void {
        this.entries.push(entry);
    }
}

const fakeTime = new Date(2000, 1, 1, 0, 0, 0, 0);

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fakeTime);
});

afterEach(() => {
    vi.useRealTimers();
});

it("should send log to transport", () => {
    const transport = new MockTransport();
    const logger = new Logger({ transport });
    logger.info("test");

    expect(transport.entries).toMatchSnapshot();
});

it("should send log with attributes to transport", () => {
    const transport = new MockTransport();
    const logger = new Logger({ transport });
    logger.info("test", {foo: "bar"});

    expect(transport.entries).toMatchSnapshot();
});

it("should merge default attributes", () => {
    const transport = new MockTransport();
    const logger = new Logger({ transport, attributes: {foo: "bar"} });
    logger.info("test", {baz: "bat"});

    expect(transport.entries).toMatchSnapshot();
});

it("should allow context specific attributes", async () => {
    const transport = new MockTransport();
    const logger = new Logger({ transport, attributes: {foo: "bar"} });

    await logger.withContext({
        baz: "bat",
    }, () => {
        logger.info("test", {another: "attribute"});
    })

    expect(transport.entries).toMatchSnapshot();
});

it("should omit entries below min level", async () => {
    const transport = new MockTransport();
    const logger = new Logger({ transport, minLevel: LogLevel.Info });
    logger.debug("foo");
    logger.info("foo");

    expect(transport.entries).toMatchSnapshot();
});
