import catalog from "./hostels.json" with { type: "json" };

export const hostelGroups = catalog.groups;
export const blocks = hostelGroups.flatMap((group) => group.hostels);
export const hostelCount = blocks.length;
