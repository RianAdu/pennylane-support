import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import type { ConversationTab } from "../../api/contract";
import { useChallenge } from "../../api/hooks/useChallenge";
import { useConversations } from "../../api/hooks/useConversations";
import { ConversationRow } from "../../components/ConversationRow/ConversationRow";
import { ConversationRowSkeleton } from "../../components/ConversationRow/ConversationRowSkeleton";
import { can } from "../../domain/permissions";
import { EmptyState } from "../../error-handling/components/EmptyState";
import { ErrorState } from "../../error-handling/components/ErrorState";
import { listReset, visuallyHidden } from "../../layouts/shared/sharedStyles";
import { useReturnToMainTop } from "../../layouts/hooks/useReturnToMainTop";
import { PageHeader } from "../../layouts/PageHeader/PageHeader";
import { useRole } from "../../providers/role/useRole";
import { useListParams } from "./hooks/useListParams";
import { ListPagination } from "./ListPagination";

const SKELETON_ROWS = 6;
const PANEL_ID = "community-list";
const tabId = (tab: ConversationTab): string => `community-tab-${tab}`;

const TAB_LABELS: Record<ConversationTab, string> = {
  latest: "Latest",
  unanswered: "Unanswered",
  solved: "Solved",
  attention: "Needs attention",
};
const LEARNER_TABS: ConversationTab[] = ["latest", "unanswered", "solved"];

/** "12 results for “vqe”" when searching, "800 questions" when not. Shown, and announced when it changes. */
const resultSummary = (total: number, q: string | undefined): string => {
  if (q !== undefined) {
    return `${total === 0 ? "No" : total} ${total === 1 ? "result" : "results"} for “${q}”`;
  }
  return `${total === 0 ? "No" : total} ${total === 1 ? "question" : "questions"}`;
};

export const CommunityPage = () => {
  const { role } = useRole();
  const { params, pageHref, setTab, clearChallenge, clearFilters } = useListParams();
  const { q, category, tab, challengeId, page } = params;

  const list = useConversations({
    q,
    category,
    challengeId,
    page: page === 1 ? undefined : page,
    tab: tab === "latest" ? undefined : tab,
  });
  const challenge = useChallenge(challengeId);
  // A new page of rows is read from its top, once it has arrived.
  useReturnToMainTop(list.data?.page);

  const tabs = can(role, "viewTriage") ? [...LEARNER_TABS, "attention" as const] : LEARNER_TABS;
  const filtered = q !== undefined || category !== undefined || challengeId !== undefined;

  // An unknown challenge still shows a chip, so the filter that empties the list can be taken off.
  const challengeName = challenge.data
    ? `${challenge.data.title}${challenge.data.titleRepeats ? ` (${challenge.data.category})` : ""}`
    : undefined;

  return (
    <>
      <PageHeader
        title={category ?? "Community"}
        description={
          category === undefined
            ? "Questions and answers about PennyLane challenges"
            : "Questions and answers in this category"
        }
      />
      <Tabs
        value={tab}
        onChange={(_, next: ConversationTab) => setTab(next)}
        variant="scrollable"
        scrollButtons={false}
        aria-label="Which questions to show"
      >
        {tabs.map((name) => (
          <Tab key={name} value={name} id={tabId(name)} aria-controls={PANEL_ID} label={TAB_LABELS[name]} />
        ))}
      </Tabs>
      <Box id={PANEL_ID} role="tabpanel" aria-labelledby={tabId(tab)}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 1.5,
            minHeight: 52,
            pt: 2.5,
            pb: 1,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          {/* The count is on screen and is the live region: one element, so what is seen is what is announced. */}
          <Typography role="status" variant="body2" color="text.secondary">
            {list.data ? resultSummary(list.data.total, q) : ""}
          </Typography>
          {challengeId !== undefined && !challenge.isPending && (
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              endIcon={<CloseIcon aria-hidden />}
              onClick={clearChallenge}
              sx={{ maxWidth: "100%", py: 0.25, borderColor: "inputBorder", borderRadius: 4, fontWeight: 400 }}
            >
              <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {challengeName === undefined ? "Unknown challenge" : `Challenge: ${challengeName}`}
              </Box>
              <Box component="span" sx={visuallyHidden}>
                , remove filter
              </Box>
            </Button>
          )}
        </Box>
        {list.isPending && (
          <Box component="ul" aria-hidden sx={listReset}>
            {Array.from({ length: SKELETON_ROWS }, (_, index) => (
              <ConversationRowSkeleton key={index} />
            ))}
          </Box>
        )}
        {list.isError && (
          <ErrorState
            title="The questions could not load"
            message={list.error.message}
            onRetry={() => void list.refetch()}
          />
        )}
        {list.data?.items.length === 0 &&
          (filtered ? (
            <EmptyState
              title="No questions match"
              description="Nothing fits this search and these filters. Clear them to see every question in this view."
              action={
                <Button variant="contained" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              title="Nothing here right now"
              description="No question fits this view at the moment. Latest shows every question."
            />
          ))}
        {list.data !== undefined && list.data.items.length > 0 && (
          <>
            <Box
              component="ul"
              aria-label="Questions"
              aria-busy={list.isPlaceholderData}
              sx={{
                ...listReset,
                // The previous page stays while the next loads; dimmed, so it does not pass for the new one.
                opacity: list.isPlaceholderData ? 0.55 : 1,
                transition: "opacity 120ms",
              }}
            >
              {list.data.items.map((conversation) => (
                <ConversationRow key={conversation.id} conversation={conversation} />
              ))}
            </Box>
            <ListPagination
              page={list.data.page}
              pageSize={list.data.pageSize}
              total={list.data.total}
              shown={list.data.items.length}
              pageHref={pageHref}
            />
          </>
        )}
      </Box>
    </>
  );
};
