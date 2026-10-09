import type { ReactNode } from "react";
import { MessagePanel } from "./MessagePanel";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  /** The state stands in for a whole page, so its title is the page's h1. */
  asPageTitle?: boolean;
};

/** Nothing to show, and what to try instead. */
export const EmptyState = ({ title, description, action, asPageTitle }: EmptyStateProps) => {
  return <MessagePanel title={title} description={description} action={action} asPageTitle={asPageTitle} />;
};
