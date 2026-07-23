import { describe, it, expect } from "vitest";
import { parseTime, getStatusForCheckIn, isWithinWorkHours } from "../schedule";

describe("parseTime", () => {
  it("converts '08:00' to 480", () => {
    expect(parseTime("08:00")).toBe(480);
  });
  it("converts '17:30' to 1050", () => {
    expect(parseTime("17:30")).toBe(1050);
  });
  it("converts '00:00' to 0", () => {
    expect(parseTime("00:00")).toBe(0);
  });
});

describe("getStatusForCheckIn", () => {
  const schedule = { startTime: "08:00", lateMinutes: 30, absentMinutes: 120 };

  it("returns 'present' when checking in before start time", () => {
    const date = new Date("2026-07-23T07:45:00");
    expect(getStatusForCheckIn(date, schedule)).toBe("present");
  });

  it("returns 'present' when checking in on time", () => {
    const date = new Date("2026-07-23T08:00:00");
    expect(getStatusForCheckIn(date, schedule)).toBe("present");
  });

  it("returns 'present' when checking in within late threshold (grace period)", () => {
    const date = new Date("2026-07-23T08:15:00");
    expect(getStatusForCheckIn(date, schedule)).toBe("present");
  });

  it("returns 'late' past late threshold", () => {
    const date = new Date("2026-07-23T08:31:00");
    expect(getStatusForCheckIn(date, schedule)).toBe("late");
  });

  it("returns 'late' at exactly past late threshold", () => {
    const date = new Date("2026-07-23T08:30:01");
    expect(getStatusForCheckIn(date, schedule)).toBe("late");
  });

  it("returns 'absent' after absent threshold", () => {
    const date = new Date("2026-07-23T10:01:00");
    expect(getStatusForCheckIn(date, schedule)).toBe("absent");
  });
});

describe("isWithinWorkHours", () => {
  const schedule = { startTime: "08:00", endTime: "17:00" };

  it("returns true during work hours", () => {
    const date = new Date("2026-07-23T10:00:00");
    expect(isWithinWorkHours(date, schedule)).toBe(true);
  });

  it("returns false before work hours", () => {
    const date = new Date("2026-07-23T07:00:00");
    expect(isWithinWorkHours(date, schedule)).toBe(false);
  });

  it("returns false after work hours", () => {
    const date = new Date("2026-07-23T17:01:00");
    expect(isWithinWorkHours(date, schedule)).toBe(false);
  });

  it("returns true at exact start", () => {
    const date = new Date("2026-07-23T08:00:00");
    expect(isWithinWorkHours(date, schedule)).toBe(true);
  });

  it("returns false at exact end", () => {
    const date = new Date("2026-07-23T17:00:00");
    expect(isWithinWorkHours(date, schedule)).toBe(false);
  });
});
