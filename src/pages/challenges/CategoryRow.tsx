import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useEffect, useRef, useState } from "react";
import type { ChallengeGroups } from "../../api/contract";
import { plural } from "../../utils/plural";
import { slug } from "../../utils/slug";
import { ChallengeCard } from "./ChallengeCard";
import { arrowSx, categoryHeaderSx, categorySx, scrollerSx, shelfFrameSx } from "./Challenges.styles";

/** How much of the visible shelf one press of an arrow moves: a card stays in view to keep the place. */
const STEP = 0.8;

type Ends = { atStart: boolean; atEnd: boolean };

const endsOf = (scroller: HTMLElement): Ends => {
  return {
    atStart: scroller.scrollLeft <= 1,
    atEnd: scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 1,
  };
};

/** One category: its heading, the arrows that scroll it, and its challenges on one line. */
export const CategoryRow = ({ category }: { category: ChallengeGroups["categories"][number] }) => {
  const { name, challenges } = category;
  const id = slug(name);
  const scroller = useRef<HTMLUListElement>(null);
  // Where the shelf stands lives here, so scrolling one category re-renders no other.
  const [ends, setEnds] = useState<Ends>({ atStart: true, atEnd: false });

  const measure = () => {
    if (scroller.current) {
      const next = endsOf(scroller.current);
      setEnds((current) => (current.atStart === next.atStart && current.atEnd === next.atEnd ? current : next));
    }
  };

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const scroll = (direction: -1 | 1) => {
    const shelf = scroller.current;
    shelf?.scrollBy({ left: direction * shelf.clientWidth * STEP });
  };

  return (
    <Box component="section" id={id} aria-labelledby={`${id}-heading`} sx={categorySx}>
      <Box sx={categoryHeaderSx}>
        <Box sx={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", columnGap: 1.5, minWidth: 0 }}>
          {/* Takes focus when the navigation links to this category, so reading goes on from here. */}
          <Typography id={`${id}-heading`} variant="h2" tabIndex={-1} sx={{ outline: "none" }}>
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {plural(challenges.length, "challenge", "challenges")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
          <IconButton
            aria-label={`Scroll ${name} back`}
            aria-disabled={ends.atStart}
            onClick={() => scroll(-1)}
            sx={arrowSx}
          >
            <ChevronLeftIcon aria-hidden />
          </IconButton>
          <IconButton
            aria-label={`Scroll ${name} forward`}
            aria-disabled={ends.atEnd}
            onClick={() => scroll(1)}
            sx={arrowSx}
          >
            <ChevronRightIcon aria-hidden />
          </IconButton>
        </Box>
      </Box>
      <Box data-more-before={!ends.atStart} data-more-after={!ends.atEnd} sx={shelfFrameSx}>
        <Box component="ul" ref={scroller} onScroll={measure} aria-labelledby={`${id}-heading`} sx={scrollerSx}>
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} category={name} />
          ))}
        </Box>
      </Box>
    </Box>
  );
};
