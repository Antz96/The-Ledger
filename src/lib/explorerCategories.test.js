import { describe, expect, test } from "vitest";
import { horizonBucketForMonthsAway } from "./explorerCategories";

describe("horizonBucketForMonthsAway", () => {
  test("buckets at the documented boundaries", () => {
    expect(horizonBucketForMonthsAway(0)).toBe("Less than 1 year");
    expect(horizonBucketForMonthsAway(11)).toBe("Less than 1 year");
    expect(horizonBucketForMonthsAway(12)).toBe("1-3 years");
    expect(horizonBucketForMonthsAway(35)).toBe("1-3 years");
    expect(horizonBucketForMonthsAway(36)).toBe("3-5 years");
    expect(horizonBucketForMonthsAway(59)).toBe("3-5 years");
    expect(horizonBucketForMonthsAway(60)).toBe("5-10 years");
    expect(horizonBucketForMonthsAway(119)).toBe("5-10 years");
    expect(horizonBucketForMonthsAway(120)).toBe("10+ years");
    expect(horizonBucketForMonthsAway(500)).toBe("10+ years");
  });

  test("a goal already due (negative months away) still buckets as the shortest horizon", () => {
    expect(horizonBucketForMonthsAway(-3)).toBe("Less than 1 year");
  });
});
