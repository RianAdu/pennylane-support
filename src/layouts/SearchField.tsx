import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import type { Theme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useEffect, useState, type SubmitEvent } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";

const LIST_PATH = "/";
const DEBOUNCE_MS = 300;
/** What a search keeps of the list's view. The page is left out: a new search starts on the first page. */
const KEPT_PARAMS = ["category", "tab", "challengeId"];

/**
 * The top bar's search. It always searches questions: on the Community list it narrows the current view, and from
 * any other page it opens the list with the query. The query lives in the URL; the field only holds what is being
 * typed until the typing pauses.
 */
export const SearchField = () => {
  // On a phone the field is too narrow for the full hint. The accessible name stays "Search questions" at every width.
  const roomForFullHint = useMediaQuery((theme: Theme) => theme.breakpoints.up("sm"));
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const onList = pathname === LIST_PATH;
  const urlQuery = onList ? (searchParams.get("q") ?? "") : "";
  const [text, setText] = useState(urlQuery);

  // When the query changes somewhere else ("Clear filters", the back button, another page), the field follows.
  // When the change is the field's own, the text is left alone, so a space typed at the end is not eaten.
  const [seenUrlQuery, setSeenUrlQuery] = useState(urlQuery);
  if (urlQuery !== seenUrlQuery) {
    setSeenUrlQuery(urlQuery);
    if (urlQuery !== text.trim()) {
      setText(urlQuery);
    }
  }

  const search = (value: string) => {
    const query = value.trim();
    if (query === urlQuery) {
      return;
    }
    const next = new URLSearchParams();
    if (onList) {
      for (const name of KEPT_PARAMS) {
        const kept = searchParams.get(name);
        if (kept !== null) {
          next.set(name, kept);
        }
      }
    }
    if (query !== "") {
      next.set("q", query);
    }
    void navigate({ pathname: LIST_PATH, search: next.toString() });
  };

  useEffect(() => {
    const timer = window.setTimeout(() => search(text), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
    // Only typing starts the wait. `search` reads the address as it is when the wait ends.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    search(text);
  };

  return (
    <Box component="form" role="search" onSubmit={submit} sx={{ flex: 1, minWidth: 0, maxWidth: 520 }}>
      <OutlinedInput
        type="search"
        size="small"
        fullWidth
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={roomForFullHint ? "Search questions" : "Search"}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon aria-hidden sx={{ fontSize: 20, color: "topBar.hint" }} />
          </InputAdornment>
        }
        slotProps={{ input: { "aria-label": "Search questions" } }}
        sx={{
          borderRadius: 5,
          bgcolor: "topBar.field",
          color: "common.white",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "topBar.edge" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "common.white" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "topBar.accent" },
          "& input::placeholder": { color: "topBar.hint" },
          // The browser draws its clear button in black; on ink it needs to be light.
          "& input::-webkit-search-cancel-button": { filter: "invert(1)" },
        }}
      />
    </Box>
  );
};
