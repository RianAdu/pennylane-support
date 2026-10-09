import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { useId, useState } from "react";
import { CONVERSATION_STATUSES, type ConversationStatus } from "../../domain/types";

export const STATUS_LABELS: Record<ConversationStatus, string> = {
  open: "Open",
  answered: "Answered",
  resolved: "Resolved",
  closed: "Closed",
};

type StatusMenuProps = {
  status: ConversationStatus;
  /** A change is on its way to the server. */
  pending: boolean;
  onChange: (next: ConversationStatus) => void;
};

/** The admin's one action on a thread, behind a ⋯ button so it stays out of a reader's way. */
export const StatusMenu = ({ status, pending, onChange }: StatusMenuProps) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const buttonId = useId();
  const menuId = useId();
  const open = anchor !== null;

  const choose = (next: ConversationStatus) => {
    setAnchor(null);
    if (next !== status) {
      onChange(next);
    }
  };

  return (
    <>
      <IconButton
        id={buttonId}
        aria-label="Manage thread"
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        aria-expanded={open ? "true" : undefined}
        // Not `disabled`: the menu hands focus back to this button as it closes, and a disabled button would drop it.
        aria-disabled={pending || undefined}
        onClick={(event) => {
          if (!pending) {
            setAnchor(event.currentTarget);
          }
        }}
        sx={{ border: 1, borderColor: "inputBorder", borderRadius: 1, color: "text.primary" }}
      >
        {pending ? <CircularProgress aria-hidden size={24} color="inherit" /> : <MoreHorizIcon aria-hidden />}
      </IconButton>
      <Menu
        id={menuId}
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ list: { "aria-label": "Change status" } }}
      >
        <Typography
          component="li"
          role="presentation"
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", px: 2, pt: 0.5, pb: 0.75, fontWeight: 700 }}
        >
          Change status
        </Typography>
        {CONVERSATION_STATUSES.map((option) => (
          <MenuItem
            key={option}
            role="menuitemradio"
            aria-checked={option === status}
            selected={option === status}
            onClick={() => choose(option)}
            sx={{ minWidth: 180 }}
          >
            {STATUS_LABELS[option]}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
