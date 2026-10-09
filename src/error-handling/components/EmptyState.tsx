import type { ReactNode } from "react";
import { MessagePanel } from "./MessagePanel";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

/** Nothing to show, and what to try instead. */
export const EmptyState = ({ title, description, action }: EmptyStateProps) => {
  return <MessagePanel title={title} description={description} action={action} />;
};
