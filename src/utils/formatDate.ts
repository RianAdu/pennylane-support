const dayFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });
const monthFormat = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
const shortMonthFormat = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });

/** "Oct 18, 2024". The data's timestamps are UTC, and the day is read in UTC so it is the same for every viewer. */
export const formatDate = (iso: string): string => dayFormat.format(new Date(iso));

/** "February 2024", from a month written as "2024-02". */
export const formatMonth = (month: string): string => monthFormat.format(new Date(`${month}-01T00:00:00Z`));

/** "Feb", from a month written as "2024-02": an axis label, where the year is given once beside January. */
export const formatShortMonth = (month: string): string => shortMonthFormat.format(new Date(`${month}-01T00:00:00Z`));
