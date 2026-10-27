const paths = {
  home: "M3 10l9-7 9 7M5 9v12h14V9M9 21v-7h6v7",
  building:
    "M4 21V5l8-2v18M12 8l8-2v15M2 21h20M7 7h2M7 11h2M7 15h2M15 10h2M15 14h2M15 18h2",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  ticket: "M4 5h16v5a2 2 0 000 4v5H4v-5a2 2 0 000-4V5zM14 5v3M14 11v2M14 16v3",
  clock: "M12 8v4l3 2M22 12a10 10 0 11-20 0 10 10 0 0120 0",
  check: "M5 12l4 4L19 6",
  checkcircle: "M9 12l2 2 4-4M22 12a10 10 0 11-20 0 10 10 0 0120 0",
  plus: "M12 5v14M5 12h14",
  arrow: "M5 12h14M13 6l6 6-6 6",
  chevron: "M9 5l7 7-7 7",
  down: "M6 9l6 6 6-6",
  search: "M21 21l-5-5M18 10a8 8 0 11-16 0 8 8 0 0116 0",
  logout: "M9 4H4v16h5M9 12h12M17 8l4 4-4 4",
  shield: "M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3zM8 12l3 3 5-6",
  lock: "M5 10h14v11H5zM8 10V6a4 4 0 018 0v4",
  message: "M21 11a8 8 0 01-8 8H7l-5 3 2-6a8 8 0 117-13h2a8 8 0 018 8z",
  wifi: "M2 8a16 16 0 0120 0M5 12a11 11 0 0114 0M8 16a6 6 0 018 0M12 20h.01",
  ac: "M12 2v20M4 7l16 10M4 17L20 7M9 4l3 3 3-3M9 20l3-3 3 3",
  water: "M12 3s-7 8-7 12a7 7 0 0014 0c0-4-7-12-7-12zM8 15a4 4 0 004 4",
  clean: "M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6zM20 17v5M18 20h5",
  food: "M4 3v6a3 3 0 006 0V3M7 3v18M19 21V3c-4 2-5 8 0 9",
  other: "M12 5v.01M12 12v.01M12 19v.01M22 12a10 10 0 11-20 0 10 10 0 0120 0",
  up: "M6 14l6-6 6 6",
  refresh: "M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0113 2M18 18A8 8 0 015 16",
  close: "M6 6l12 12M6 18L18 6",
  menu: "M4 6h16M4 12h16M4 18h16",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM15 12a3 3 0 11-6 0 3 3 0 016 0",
  alert: "M12 8v5M12 17h.01M10 3L2 19h20L14 3h-4z",
  spark: "M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7z",
};
export default function Icon({ name, size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.other} />
    </svg>
  );
}
