import Button from "@mui/material/Button";
import { MessagePanel } from "./MessagePanel";

type ErrorStateProps = {
  title: string;
  /** What went wrong, in the server's words when it gave any. */
  message: string;
  onRetry: () => void;
};

/** A request failed. An alert, so a screen reader hears it as it appears. */
export const ErrorState = ({ title, message, onRetry }: ErrorStateProps) => {
  return (
    <MessagePanel
      role="alert"
      title={title}
      description={message}
      action={
        <Button variant="contained" disableElevation onClick={onRetry}>
          Try again
        </Button>
      }
    />
  );
};
