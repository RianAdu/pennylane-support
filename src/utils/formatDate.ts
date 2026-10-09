const dayFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

/** "Oct 18, 2024". The data's timestamps are UTC, and the day is read in UTC so it is the same for every viewer. */
export const formatDate = (iso: string): string => dayFormat.format(new Date(iso));
