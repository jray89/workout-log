import { describe, expect, it } from "vitest";
import { formatVolume, getMilestoneInfo } from "./stats";

describe("getMilestoneInfo", () => {
  it("has no milestone reached before the first one", () => {
    expect(getMilestoneInfo(3)).toEqual({ reached: null, next: 10, nearNext: false });
  });

  it("flags when the next milestone is within five workouts", () => {
    expect(getMilestoneInfo(5)).toEqual({ reached: null, next: 10, nearNext: true });
    expect(getMilestoneInfo(21)).toEqual({ reached: 10, next: 25, nearNext: true });
  });

  it("counts a milestone as reached on the exact number", () => {
    expect(getMilestoneInfo(50).reached).toBe(50);
    expect(getMilestoneInfo(50).next).toBe(75);
  });

  it("has no next milestone past the last one", () => {
    expect(getMilestoneInfo(600)).toEqual({ reached: 500, next: null, nearNext: false });
  });
});

describe("formatVolume", () => {
  it("rounds small volumes to whole pounds", () => {
    expect(formatVolume(999.6)).toBe("1000");
    expect(formatVolume(250)).toBe("250");
  });

  it("abbreviates thousands", () => {
    expect(formatVolume(1000)).toBe("1.0k");
    expect(formatVolume(12_345)).toBe("12.3k");
  });
});
