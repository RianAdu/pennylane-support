import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { Priority } from "../domain/types";

const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low priority",
  medium: "Medium priority",
  high: "High priority",
  urgent: "Urgent priority",
};

type TriageLineProps = {
  priority: Priority;
  /** `null` means nobody is assigned. */
  assignee: string | null | undefined;
};

/** What only an admin's response carries: why a thread may need attention. What is pressing is set in ink. */
export const TriageLine = ({ priority, assignee }: TriageLineProps) => {
  const pressing = priority === "high" || priority === "urgent";
  return (
    <Typography variant="caption" color="text.secondary" sx={{ display: "flex", flexWrap: "wrap", columnGap: 2 }}>
      <Box component="span" sx={pressing ? { color: "text.primary", fontWeight: 700 } : undefined}>
        {PRIORITY_LABELS[priority]}
      </Box>
      {assignee === null ? (
        <Box component="span" sx={{ color: "text.primary", fontWeight: 700 }}>
          Unassigned
        </Box>
      ) : (
        <span>Assigned to {assignee}</span>
      )}
    </Typography>
  );
};
