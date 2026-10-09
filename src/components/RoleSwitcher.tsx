import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useId, useState } from "react";
import { VIEWER_ROLES, type ViewerRole } from "../domain/types";
import { useRole } from "../providers/role/useRole";

const ROLE_LABELS: Record<ViewerRole, string> = {
  learner: "Learner",
  admin: "Admin",
};

/** Sets who the viewer is. There is no sign-in: the role is the demo's stand-in for one. */
type RoleSwitcherProps = {
  fullWidth?: boolean;
  /** It sits on the top bar, so its edge is the bar's, not the page's. */
  onDark?: boolean;
};

export const RoleSwitcher = ({ fullWidth = false, onDark = false }: RoleSwitcherProps) => {
  const { role, setRole } = useRole();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const buttonId = useId();
  const menuId = useId();
  const open = anchor !== null;

  const choose = (next: ViewerRole) => {
    setRole(next);
    setAnchor(null);
  };

  return (
    <>
      <Button
        id={buttonId}
        variant="outlined"
        color="inherit"
        fullWidth={fullWidth}
        endIcon={<ArrowDropDownIcon aria-hidden />}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        aria-expanded={open ? "true" : undefined}
        onClick={(event) => setAnchor(event.currentTarget)}
        sx={{
          borderColor: onDark ? "topBar.edge" : "inputBorder",
          borderRadius: 5,
          fontSize: "0.9375rem",
          fontWeight: 400,
          whiteSpace: "nowrap",
          justifyContent: "space-between",
          "&:hover": { borderColor: "currentColor" },
        }}
      >
        Viewing as: {ROLE_LABELS[role]}
      </Button>
      <Menu
        id={menuId}
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        slotProps={{ list: { "aria-labelledby": buttonId } }}
      >
        {VIEWER_ROLES.map((option) => (
          <MenuItem
            key={option}
            role="menuitemradio"
            aria-checked={option === role}
            selected={option === role}
            onClick={() => choose(option)}
          >
            {ROLE_LABELS[option]}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
