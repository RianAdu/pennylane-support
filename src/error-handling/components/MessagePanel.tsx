import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { BrandMark } from "../../components/BrandMark";

type MessagePanelProps = {
  title: string;
  /** What happened and what to do about it, in one or two sentences. */
  description: string;
  /** The one thing to do next. */
  action?: ReactNode;
  role?: "alert";
};

/** The layout EmptyState and ErrorState share: where a list would be, one sentence and one way forward. */
export const MessagePanel = ({ title, description, action, role }: MessagePanelProps) => {
  return (
    <Box
      role={role}
      sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1, py: { xs: 5, md: 7 } }}
    >
      <BrandMark size={44} muted />
      <Typography variant="h2" sx={{ mt: 2 }}>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: "52ch" }}>
        {description}
      </Typography>
      {action !== undefined && <Box sx={{ mt: 1.5 }}>{action}</Box>}
    </Box>
  );
};
