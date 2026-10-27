import assert from "node:assert/strict";
import { test } from "node:test";
import { hostelGroups, blocks, hostelCount } from "../src/hostels.js";
import { campusDate, formatDate } from "../src/tickets.js";

test("catalog includes all configured KP and QC hostels exactly once", () => {
  assert.equal(hostelCount, 36);
  assert.equal(new Set(blocks).size, 36);
  assert.deepEqual(
    hostelGroups.map((group) => group.hostels.length),
    [25, 11],
  );
  for (const block of ["KP-1", "KP-25", "QC-1", "QC-11"])
    assert.ok(blocks.includes(block));
  assert.equal(blocks.includes("QC-12"), false);
});
test("campus date crosses the calendar boundary in India time", () => {
  assert.equal(campusDate(new Date("2026-10-26T18:29:59Z")), "2026-10-26");
  assert.equal(campusDate(new Date("2026-10-26T18:30:00Z")), "2026-10-27");
  assert.match(formatDate("2026-10-27 10:00:00"), /2026/);
});
