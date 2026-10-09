import CheckIcon from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import type { ConversationStatus } from "../domain/types";
import { visuallyHidden } from "../layouts/shared/sharedStyles";

const LABELS: Record<ConversationStatus, string> = {
  open: "Open",
  answered: "Answered",
  resolved: "Resolved",
  closed: "Closed",
};

// Open waits for an answer, Answered is neutral, Resolved is solved, Closed is an outline. Action blue is never a
// status: blue means "you can click this", and a chip is not a control.
const TONES = {
  open: { color: "waiting.main", bgcolor: "waiting.tint", borderColor: "waiting.edge" },
  answered: { color: "neutral.main", bgcolor: "neutral.tint", borderColor: "neutral.edge" },
  resolved: { color: "solved.main", bgcolor: "solved.tint", borderColor: "solved.edge" },
  closed: { color: "text.secondary", bgcolor: "transparent", borderColor: "inputBorder" },
} as const satisfies Record<ConversationStatus, object>;

type StatusChipProps = {
  status: ConversationStatus;
  /** A resolved thread gets the check only when it also has an accepted answer. */
  hasAcceptedAnswer?: boolean;
};

/** A thread's status as a word on its colour. The word carries the meaning; the colour lets a page be scanned. */
export const StatusChip = ({ status, hasAcceptedAnswer = false }: StatusChipProps) => {
  const accepted = status === "resolved" && hasAcceptedAnswer;
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        flexShrink: 0,
        height: 24,
        px: 1.25,
        border: 1,
        borderRadius: 12,
        typography: "caption",
        fontWeight: 700,
        whiteSpace: "nowrap",
        ...TONES[status],
      }}
    >
      {accepted && <CheckIcon aria-hidden sx={{ fontSize: 14, ml: -0.5 }} />}
      {LABELS[status]}
      {accepted && (
        <Box component="span" sx={visuallyHidden}>
          , with an accepted answer
        </Box>
      )}
    </Box>
  );
};
