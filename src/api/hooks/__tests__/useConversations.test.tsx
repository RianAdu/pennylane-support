import { act, waitFor } from "@testing-library/react";
import { expect, it } from "vitest";
import { useRole } from "../../../providers/role/useRole";
import { rawConversation } from "../../../test/fixtures";
import { renderHookWithProviders } from "../../../test/renderHookWithProviders";
import { serve } from "../../../test/serve";
import { useConversations } from "../useConversations";

it("never shows the other role's rows after a role switch", async () => {
  serve([rawConversation({ priority: "urgent" })]);
  const { result } = renderHookWithProviders(
    () => {
      return { viewer: useRole(), list: useConversations() };
    },
    { role: "admin" },
  );
  await waitFor(() => {
    expect(result.current.list.data?.items[0]).toHaveProperty("priority", "urgent");
  });

  act(() => {
    result.current.viewer.setRole("learner");
  });

  // The admin's page is neither reused nor kept as a placeholder while the learner's page loads.
  expect(result.current.list.data).toBeUndefined();
  await waitFor(() => {
    expect(result.current.list.data?.items).toHaveLength(1);
  });
  expect(result.current.list.data?.items[0]).not.toHaveProperty("priority");
});
