import { describe, expect, it } from "vitest";
import {
  duration,
  formatDuration,
  formatElapsed,
  timeDiffMilliseconds,
} from "./timeUtils";

describe("formatElapsed", () => {
  it("formats under an hour as M:SS", () => {
    expect(formatElapsed(0)).toBe("0:00");
    expect(formatElapsed(65)).toBe("1:05");
    expect(formatElapsed(3599)).toBe("59:59");
  });

  it("formats an hour or more as H:MM:SS", () => {
    expect(formatElapsed(3600)).toBe("1:00:00");
    expect(formatElapsed(3725)).toBe("1:02:05");
  });
});

describe("formatDuration", () => {
  it("shows minutes only by default", () => {
    expect(formatDuration(0)).toBe("0m");
    expect(formatDuration(45 * 60_000 + 30_000)).toBe("45m");
  });

  it("shows seconds when asked and under an hour", () => {
    expect(formatDuration(5 * 60_000 + 7_000, true)).toBe("5m 7s");
  });

  it("switches to hours and minutes past an hour, ignoring seconds", () => {
    expect(formatDuration(90 * 60_000 + 30_000, true)).toBe("1h 30m");
  });
});

describe("duration helpers", () => {
  it("computes the gap between two ISO timestamps", () => {
    const from = "2026-04-01T10:00:00Z";
    const to = "2026-04-01T11:15:00Z";
    expect(timeDiffMilliseconds(from, to)).toBe(75 * 60_000);
    expect(duration(from, to)).toBe("1h 15m");
  });
});
