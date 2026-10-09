import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { BarChart } from "@mui/x-charts/BarChart";
import type { MonthCount } from "../../api/contract";
import { visuallyHidden } from "../../layouts/shared/sharedStyles";
import { formatMonth, formatShortMonth } from "../../utils/formatDate";
import { sectionSx, summarySx, tableSx, tableToggleSx } from "./Insights.styles";

const HEADING_ID = "new-conversations-per-month";
const TITLE = "New conversations per month";
const CHART_HEIGHT = 260;

const summaryOf = (busiest: MonthCount | null): string => {
  if (busiest === null) {
    return "No conversations yet.";
  }
  const conversations = busiest.count === 1 ? "1 new conversation" : `${busiest.count} new conversations`;
  return `Busiest month: ${formatMonth(busiest.month)}, with ${conversations}.`;
};

/** On the axis a month is its short name, and January carries the year under it. */
const axisLabel = (month: string): string => {
  const name = formatShortMonth(month);
  return month.endsWith("-01") ? `${name}\n${month.slice(0, 4)}` : name;
};

type MonthlyChartProps = {
  perMonth: MonthCount[];
  busiestMonth: MonthCount | null;
};

/**
 * How many conversations started each month. Three ways in: the sentence gives the finding, the bars the shape,
 * and the table every value, for anyone who cannot read the bars.
 */
export const MonthlyChart = ({ perMonth, busiestMonth }: MonthlyChartProps) => {
  const { palette } = useTheme();
  const months = perMonth.map(({ month }) => month);

  return (
    <Box component="section" aria-labelledby={HEADING_ID} sx={sectionSx}>
      <Typography id={HEADING_ID} variant="h2">
        {TITLE}
      </Typography>
      <Box component="figure" sx={{ m: 0 }}>
        <Typography component="figcaption" color="text.secondary" sx={summarySx}>
          {summaryOf(busiestMonth)}
        </Typography>
        {perMonth.length > 0 && (
          <BarChart
            height={CHART_HEIGHT}
            margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
            hideLegend
            grid={{ horizontal: true }}
            series={[{ data: perMonth.map(({ count }) => count), label: "New conversations" }]}
            xAxis={[
              {
                scaleType: "band",
                data: months,
                categoryGapRatio: 0.3,
                // Room for two lines: January carries the year.
                height: 44,
                disableTicks: true,
                valueFormatter: (month: string, context) => {
                  return context.location === "tick" ? axisLabel(month) : formatMonth(month);
                },
                // Every bar is quiet but the busiest, which the sentence above names.
                colorMap: {
                  type: "ordinal",
                  values: months,
                  colors: months.map((month) => {
                    return month === busiestMonth?.month ? palette.text.primary : palette.text.secondary;
                  }),
                },
              },
            ]}
            yAxis={[{ disableLine: true, disableTicks: true, width: 32 }]}
            sx={{
              // A Tab into the chart lands on a layer the chart keeps unstyled, and only an arrow key marks a bar.
              // The ring goes around the drawing, so the first Tab shows where the focus is.
              "& .MuiChartsSurface-root:has(:focus-visible)": {
                outline: `2px solid ${palette.primary.main}`,
                outlineOffset: 2,
                borderRadius: 1,
              },
              "& .MuiChartsAxis-tickLabel": { fill: palette.text.secondary, fontSize: 13 },
              "& .MuiChartsAxis-line": { stroke: palette.divider },
              "& .MuiChartsGrid-line": { stroke: palette.divider },
            }}
          />
        )}
      </Box>
      {perMonth.length > 0 && (
        <details>
          <Box component="summary" sx={tableToggleSx}>
            Show as table
          </Box>
          <Box component="table" sx={tableSx}>
            <Box component="caption" sx={visuallyHidden}>
              {TITLE}
            </Box>
            <thead>
              <tr>
                <th scope="col">Month</th>
                <th scope="col">New conversations</th>
              </tr>
            </thead>
            <tbody>
              {perMonth.map(({ month, count }) => (
                <tr key={month}>
                  <th scope="row">{formatMonth(month)}</th>
                  <td>{count}</td>
                </tr>
              ))}
            </tbody>
          </Box>
        </details>
      )}
    </Box>
  );
};
