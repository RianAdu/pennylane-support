/** "Quantum Machine Learning" → "quantum-machine-learning": a name as it can stand in an address or an id. */
export const slug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};
