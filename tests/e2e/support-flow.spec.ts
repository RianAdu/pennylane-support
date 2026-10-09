import { expect, test } from "@playwright/test";

test("a learner filters the list, opens a thread and replies", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("searchbox", { name: "Search questions" }).fill("gradient");
  await page.getByRole("tab", { name: "Unanswered" }).click();
  await expect(page.getByRole("status").filter({ hasText: /^\d+ results for “gradient”$/ })).toBeVisible();
  await expect(page).toHaveURL(/q=gradient/);
  await expect(page).toHaveURL(/tab=unanswered/);

  const firstQuestion = page.getByRole("list", { name: "Questions" }).getByRole("link").first();
  const title = (await firstQuestion.innerText()).trim();
  await firstQuestion.click();
  await expect(page).toHaveURL(/\/threads\//);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(title);

  const reply = "Lowering the step size fixed this for me.";
  await page.getByRole("textbox", { name: "Your reply" }).fill(reply);
  await page.getByRole("button", { name: "Post reply" }).click();
  await expect(page.getByText("Your reply is posted.")).toBeVisible();
  await expect(page.getByRole("article", { name: "Reply by you" })).toContainText(reply);
});
