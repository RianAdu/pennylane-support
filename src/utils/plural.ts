/** "1 reply", "3 replies": the count with the word that fits it. */
export const plural = (count: number, one: string, many: string): string => `${count} ${count === 1 ? one : many}`;
