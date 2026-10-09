import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { CircuitMotif } from "./CircuitMotif";

type PageHeaderProps = {
  title: string;
  /** One line under the title that says what the page holds. */
  description?: string;
  /** Controls that belong to the whole page, such as its tabs. */
  children?: ReactNode;
};

/** The top of every page: its one h1 and what the page is for. */
export const PageHeader = ({ title, description, children }: PageHeaderProps) => {
  return (
    <Box component="header" sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h1" sx={{ overflowWrap: "anywhere" }}>
            {title}
          </Typography>
          {description !== undefined && (
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              {description}
            </Typography>
          )}
        </Box>
        {/* Only where there is room for it beside the title. */}
        <Box sx={{ display: { xs: "none", lg: "block" }, flexShrink: 0 }}>
          <CircuitMotif />
        </Box>
      </Box>
      {children}
    </Box>
  );
};
