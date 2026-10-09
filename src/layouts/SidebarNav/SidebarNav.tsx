import ExtensionOutlinedIcon from "@mui/icons-material/ExtensionOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { useLocation, useSearchParams } from "react-router";
import { can } from "../../domain/permissions";
import { useRole } from "../../providers/role/useRole";
import { listReset } from "../shared/sharedStyles";
import { Categories } from "./Categories";
import { NavRow } from "./NavRow";

/** The app's navigation. The sidebar and the drawer both render it, so the two can never list different things. */
export const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { role } = useRole();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  const onList = pathname === "/";
  // A thread belongs to Community, so its drawer keeps the categories open.
  const inCommunity = onList || pathname.startsWith("/threads/");
  const activeCategory = onList ? searchParams.get("category") : null;

  return (
    <Box component="nav" aria-label="Main" sx={{ p: 1.5, pt: { md: 3 } }}>
      <Box component="ul" sx={listReset}>
        <li>
          <NavRow
            to="/"
            current={onList && activeCategory === null}
            section
            icon={<ForumOutlinedIcon aria-hidden />}
            onNavigate={onNavigate}
          >
            Community
          </NavRow>
          {inCommunity && <Categories activeCategory={activeCategory} onNavigate={onNavigate} />}
        </li>
        <Divider component="li" aria-hidden sx={{ my: 1.5 }} />
        <li>
          <NavRow
            to="/challenges"
            current={pathname === "/challenges"}
            section
            icon={<ExtensionOutlinedIcon aria-hidden />}
            onNavigate={onNavigate}
          >
            Challenges
          </NavRow>
        </li>
        {can(role, "viewInsights") && (
          <li>
            <NavRow
              to="/insights"
              current={pathname === "/insights"}
              section
              icon={<InsightsOutlinedIcon aria-hidden />}
              onNavigate={onNavigate}
            >
              Insights
            </NavRow>
          </li>
        )}
      </Box>
    </Box>
  );
};
