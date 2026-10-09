import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

/**
 * An action on the page was refused or failed, and the page itself is still there. Says so beside the control, in
 * the server's words. An alert, so a screen reader hears it as it appears.
 */
export const InlineError = ({ message }: { message: string }) => {
  return (
    <Box
      role="alert"
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.25,
        px: 1.5,
        py: 1.25,
        borderLeft: 3,
        borderColor: "error.main",
        borderRadius: "0 8px 8px 0",
        bgcolor: "surface",
      }}
    >
      <ErrorOutlineIcon aria-hidden sx={{ mt: "1px", fontSize: 20, color: "error.main" }} />
      <Typography variant="body2">{message}</Typography>
    </Box>
  );
};
