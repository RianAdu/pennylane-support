import type { UseQueryResult } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation } from "react-router";
import type { ChallengeGroups } from "../../api/contract";
import { useChallenges } from "../../api/hooks/useChallenges";
import { EmptyState } from "../../error-handling/components/EmptyState";
import { ErrorState } from "../../error-handling/components/ErrorState";
import { PageHeader } from "../../layouts/PageHeader/PageHeader";
import { CategoryRow } from "./CategoryRow";
import { ChallengesSkeleton } from "./ChallengesSkeleton";

const renderHeader = () => {
  return <PageHeader title="Challenges" description="Pick a challenge to see where others got stuck" />;
};

const renderPending = () => {
  return (
    <>
      {renderHeader()}
      <ChallengesSkeleton />
    </>
  );
};

const renderError = (challenges: UseQueryResult<ChallengeGroups>) => {
  return (
    <>
      {renderHeader()}
      <ErrorState
        title="The challenges could not load"
        message={challenges.error?.message ?? ""}
        onRetry={() => void challenges.refetch()}
      />
    </>
  );
};

const renderEmpty = () => {
  return (
    <>
      {renderHeader()}
      <EmptyState title="No challenges yet" description="Challenges show here once they are published." />
    </>
  );
};

export const ChallengesPage = () => {
  const challenges = useChallenges();
  const { hash, key } = useLocation();
  const loaded = challenges.isSuccess;

  // A sidebar link such as /challenges#photonics should jump to that category's row. The rows only exist after the
  // data has loaded, so we wait for it, then scroll to the row and focus its heading. `key` is new on every click,
  // so clicking the same link again jumps again.
  useEffect(() => {
    const section = loaded && hash !== "" ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (section) {
      section.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
      section.scrollIntoView();
    }
  }, [loaded, hash, key]);

  if (challenges.isPending) return renderPending();
  if (challenges.isError) return renderError(challenges);
  if (challenges.data.categories.length === 0) return renderEmpty();

  return (
    <>
      {renderHeader()}
      {challenges.data.categories.map((category) => (
        <CategoryRow key={category.name} category={category} />
      ))}
    </>
  );
};
