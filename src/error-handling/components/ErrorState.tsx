import Button from "@mui/material/Button";
import { MessagePanel } from "./MessagePanel";

type ErrorStateProps = {
  title: string;
  /** What went wrong, in the server's words when it gave any. */
  message: string;
  onRetry: () => void;
  /** The state stands in for a whole page, so its title is the page's h1. */
  asPageTitle?: boolean;
};

/** A request failed. An alert, so a screen reader hears it as it appears. */
export const ErrorState = ({ title, message, onRetry, asPageTitle }: ErrorStateProps) => {
  return (
    <MessagePanel
      role="alert"
      title={title}
      description={message}
      asPageTitle={asPageTitle}
      action={
        <Button variant="contained" disableElevation onClick={onRetry}>
          Try again
        </Button>
      }
    />
  );
};
