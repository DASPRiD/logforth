# Logforth

[![Release](https://github.com/DASPRiD/logforth/actions/workflows/release.yml/badge.svg)](https://github.com/DASPRiD/logforth/actions/workflows/release.yml)

This is a simple logging framework specifically build for NodeJS.

I have been using several logging frameworks in the past, but I had always issues with one or another quirks of each.
After comparing how each of them works, as well as looking for more inspiration in the Rust logging frameworks I came
up with the design for this logging library.

Logforth supports both pretty printing for development and `ndjson` output for production. Each log entry has a
mandatory message and optional attributes. Attributes are included as-is in `ndjson` output and pretty printed in
development.

## Installation

### npm
```bash
npm i logforth
```

### pnpm
```bash
pnpm add logforth
```

## Usage

First you want to instantiate a new instance of the logger:

```typescript
import {Logger} from "logforth";

const logger = new Logger();
logger.info("First logger test");
```

### Min log level

By default, Logforth will log all events. You can limit this through the `minLevel` option:

```typescript
import {Logger, LogLevel} from "logforth";

const logger = new Logger({ minLevel: LogLevel.Info });
```

In order to disable logging completely you can pass `disableLogging` to `minLevel`:

```typescript
import {Logger, disableLogging} from "logforth";

const logger = new Logger({ minLevel: disableLogging });
```

### Pretty printing

In development, you might prefer to see pretty printed log message. A simple switch between production and development
could look like this:

```typescript
import {Logger, NdJsonTransport, PrettyTransport} from "logforth";

const logger = new Logger({
    transport: process.env.NODE_ENV === "production"
        ? new NdJsonTransport()
        : new PrettyTransport()
});
```

### Attributes

You can pass arbitrary attributes to each log entry:

```typescript
logger.info("I contain attributes", { foo: "bar" });
```

In `ndjson` output they will be inlined with the rest of the log entry. Thus, you must not use the following attribute
names: `time`, `level` and `msg`.

### Default attributes

If you want to have specific attributes always present, e.g. the hostname of the running process, you can include this
in the constructor:

```typescript
const logger = new Logger({ attributes: { "hostname": "foo" } });
```

### Context aware logging

Logforth supports logging in context aware situation, for instance when you want to keep track of a request ID. You can
do so through the `withContext()` method. The following example demonstrates how to do this in Koa:

```typescript
koaApp.use((context, next) => {
    return logger.withContext({ requestId: "foo" }, next);
});
```
