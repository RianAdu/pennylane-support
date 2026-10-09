import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import type { Insights } from "../../api/contract";
import { visuallyHidden } from "../../layouts/shared/sharedStyles";
import { tileFigureSx, tilesSx } from "./Insights.styles";

const count = new Intl.NumberFormat("en-US");
const share = new Intl.NumberFormat("en-US", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });
const hours = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

type TileProps = {
  label: string;
  figure: ReactNode;
  /** What the figure is counted from or means, in a few words. */
  note: string;
};

const Tile = ({ label, figure, note }: TileProps) => {
  return (
    <div>
      <Typography component="dt" variant="caption" color="text.secondary" sx={{ display: "block" }}>
        {label}
      </Typography>
      <Typography component="dd" variant="h1" sx={tileFigureSx}>
        {figure}
      </Typography>
      <Typography component="dd" variant="caption" color="text.secondary" sx={{ display: "block", m: 0, mt: 0.25 }}>
        {note}
      </Typography>
    </div>
  );
};

/** The four figures an admin reads first: the backlog, what nobody owns, how long an answer takes, how many end well. */
export const Tiles = ({ insights }: { insights: Insights }) => {
  const { total, open, openUnassigned, medianResolutionHours, withAcceptedAnswer } = insights;

  return (
    <Box component="dl" sx={tilesSx}>
      <Tile label="Open conversations" figure={count.format(open)} note={`of ${count.format(total)}`} />
      <Tile
        label="Open and unassigned"
        figure={count.format(openUnassigned)}
        note={openUnassigned === 1 ? "needs an owner" : "need an owner"}
      />
      <Tile
        label="Median time to resolve"
        figure={
          medianResolutionHours === null ? (
            "None yet"
          ) : (
            <>
              {hours.format(medianResolutionHours)}
              <span aria-hidden> h</span>
              <Box component="span" sx={visuallyHidden}>
                {" "}
                hours
              </Box>
            </>
          )
        }
        note="resolved and closed"
      />
      <Tile
        label="With an accepted answer"
        figure={total === 0 ? "None yet" : share.format(withAcceptedAnswer / total)}
        note={`${count.format(withAcceptedAnswer)} of ${count.format(total)}`}
      />
    </Box>
  );
};
