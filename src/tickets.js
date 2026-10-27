export const categoryIcons = {
  "Wi-Fi": "wifi",
  AC: "ac",
  "Water Purifier": "water",
  Sanitation: "clean",
  "Mess Food": "food",
  Other: "other",
};
export const categories = [
  "Wi-Fi",
  "AC",
  "Water Purifier",
  "Sanitation",
  "Mess Food",
  "Other",
];
export const blocks = ["KP-1", "KP-2", "KP-3"];
export const statuses = ["Open", "In Progress", "Resolved"];
export const dateValue = (value) =>
  new Date(value?.replace(" ", "T") + (value?.endsWith("Z") ? "" : "Z"));
export const formatDate = (value) =>
  value
    ? dateValue(value).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

// List controls never change the server's overview counts.
export function filterTickets(
  tickets,
  {
    status = "All",
    category = "All",
    search = "",
    sort = "newest",
    mine = null,
  } = {},
) {
  const query = search.trim().toLowerCase();
  return tickets
    .filter(
      (ticket) =>
        (mine === null || ticket.user_id === mine) &&
        (status === "All" ||
          (status === "Overdue" ? ticket.overdue : ticket.status === status)) &&
        (category === "All" || ticket.category === category) &&
        (!query ||
          [
            ticket.description,
            ticket.category,
            ticket.hostel_block,
            ticket.room_no,
            ticket.floor,
            `HC-${String(ticket.id).padStart(3, "0")}`,
            String(ticket.id),
          ].some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(query),
          )),
    )
    .sort((a, b) =>
      sort === "votes"
        ? b.vote_count - a.vote_count || b.id - a.id
        : b.created_at.localeCompare(a.created_at) || b.id - a.id,
    );
}
