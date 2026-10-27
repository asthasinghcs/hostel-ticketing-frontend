import assert from "node:assert/strict";
import { test } from "node:test";
import { filterTickets } from "../src/tickets.js";

const tickets = [
  {
    id: 1,
    user_id: 5,
    category: "Wi-Fi",
    description: "Router down",
    hostel_block: "KP-1",
    status: "Open",
    overdue: true,
    vote_count: 3,
    created_at: "2026-10-25 10:00:00",
  },
  {
    id: 2,
    user_id: 8,
    category: "AC",
    description: "Cooling restored",
    hostel_block: "KP-1",
    room_no: "214",
    status: "Resolved",
    overdue: false,
    vote_count: 5,
    created_at: "2026-10-27 10:00:00",
  },
  {
    id: 3,
    user_id: 5,
    category: "Wi-Fi",
    description: "Slow network",
    hostel_block: "KP-1",
    status: "In Progress",
    overdue: false,
    vote_count: 5,
    created_at: "2026-10-27 11:00:00",
  },
];
test("status filters do not mutate the hostel snapshot or its total", () => {
  assert.deepEqual(
    filterTickets(tickets, { status: "Resolved" }).map((t) => t.id),
    [2],
  );
  assert.equal(tickets.length, 3);
  assert.deepEqual(
    tickets.map((t) => t.id),
    [1, 2, 3],
  );
});
test("my tickets is independent of hostel-wide totals", () => {
  assert.deepEqual(
    filterTickets(tickets, { mine: 5 }).map((t) => t.id),
    [3, 1],
  );
  assert.equal(tickets.length, 3);
});
test("search finds ticket ID, description, category, and room", () => {
  assert.deepEqual(
    filterTickets(tickets, { search: "hc-001" }).map((t) => t.id),
    [1],
  );
  assert.deepEqual(
    filterTickets(tickets, { search: "214" }).map((t) => t.id),
    [2],
  );
  assert.deepEqual(
    filterTickets(tickets, { search: " router " }).map((t) => t.id),
    [1],
  );
});
test("category, overdue, and sorting work together without changing counts", () => {
  assert.deepEqual(
    filterTickets(tickets, { category: "Wi-Fi", status: "Overdue" }).map(
      (t) => t.id,
    ),
    [1],
  );
  assert.deepEqual(
    filterTickets(tickets, { sort: "votes" }).map((t) => t.id),
    [3, 2, 1],
  );
});
