import Box from "@mui/material/Box";

/**
 * A short quantum circuit: three wires, a Hadamard gate, two controlled-NOTs, a rotation and a measurement. It is
 * what a PennyLane challenge asks a learner to build, drawn quietly beside the page header. Decoration only.
 */
export const CircuitMotif = () => {
  return (
    <Box
      component="svg"
      viewBox="0 0 232 84"
      aria-hidden
      focusable="false"
      sx={(theme) => ({
        display: "block",
        width: 232,
        height: 84,
        fill: "none",
        strokeWidth: 1.5,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "& .wire": { stroke: theme.palette.divider },
        "& .gate": { stroke: theme.palette.neutral.edge, fill: theme.palette.background.paper },
        "& .mark": { stroke: theme.palette.neutral.edge },
        "& .dot": { stroke: "none", fill: theme.palette.neutral.edge },
        "& .lit": { stroke: theme.palette.primary.main, fill: theme.palette.action.selected },
        "& .lit-mark": { stroke: theme.palette.primary.main },
      })}
    >
      <path className="wire" d="M0 14h232M0 42h232M0 70h232" />
      {/* Hadamard on the first wire. */}
      <rect className="gate" x="22" y="3" width="22" height="22" rx="4" />
      <path className="mark" d="M29 9v10M37 9v10M29 14h8" />
      {/* Controlled-NOT from the first wire to the second. */}
      <path className="mark" d="M76 14v36" />
      <circle className="dot" cx="76" cy="14" r="3.5" />
      <circle className="gate" cx="76" cy="42" r="8" />
      <path className="mark" d="M76 34v16M68 42h16" />
      {/* The rotation being trained, on the third wire: the one lit gate. */}
      <rect className="lit" x="104" y="59" width="30" height="22" rx="4" />
      <path className="lit-mark" d="M114 76v-12h5a3.5 3.5 0 0 1 0 7h-5m5 0 4 5" />
      {/* Controlled-NOT from the second wire to the third. */}
      <path className="mark" d="M160 42v36" />
      <circle className="dot" cx="160" cy="42" r="3.5" />
      <circle className="gate" cx="160" cy="70" r="8" />
      <path className="mark" d="M160 62v16M152 70h16" />
      {/* Measurement on the first wire. */}
      <rect className="gate" x="188" y="3" width="26" height="22" rx="4" />
      <path className="mark" d="M194 20a7 7 0 0 1 14 0M201 20l5-9" />
    </Box>
  );
};
