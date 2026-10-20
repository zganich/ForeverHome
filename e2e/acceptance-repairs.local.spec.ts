import { test, expect, type Page } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
const uid = "local-repair-owner",
  email = "owner@example.test";
const hash = createHash("sha256").update(uid).digest("hex");
const locator = `https://storage.googleapis.com/foreverhome-local-media/uploads/${hash}/fixture.jpg`;
const photo = readFileSync(
  "marketing/graphics/references/dog-cat-together.jpg"
);
const pet = {
  id: "pet-local",
  userId: uid,
  name: "LOCAL TEST PET",
  species: "dog",
  breed: "Fixture",
  age: "2 years",
  photoUrl: locator,
};
const analysis = {
  id: "analysis-local",
  petId: pet.id,
  mediaUrl: locator,
  mediaType: "image",
  primaryBehavior: "Content",
  confidenceScore: "80%",
  createdAt: new Date().toISOString(),
  personalityVoice: "A fictional test interpretation.",
  visionData: null,
  contextData: null,
  synthesisData: null,
  recommendations: null,
};
async function fixture(page: Page, role = "admin") {
  const state = {
    disabled: false,
    meNull: false,
    authUnavailable: false,
    adminFailure: false,
    checkoutCalls: 0,
    mediaCalls: 0,
    mediaAuthorized: true,
    analysisCalls: 0,
    qualityFailure: false,
  };
  const token =
    [
      { alg: "RS256", typ: "JWT" },
      {
        iss: "https://securetoken.google.com/foreverhome-local-only",
        aud: "foreverhome-local-only",
        sub: uid,
        user_id: uid,
        email,
        email_verified: true,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        auth_time: Math.floor(Date.now() / 1000),
        firebase: { sign_in_provider: "password" },
      },
    ]
      .map(x => Buffer.from(JSON.stringify(x)).toString("base64url"))
      .join(".") + ".fictional-signature";
  await page.addInitScript(() => {
    (window as any).__revoked = [];
    const old = URL.revokeObjectURL.bind(URL);
    URL.revokeObjectURL = (s: string) => {
      (window as any).__revoked.push(s);
      old(s);
    };
  });
  await page.route("**/*", async route => {
    const req = route.request(),
      url = new URL(req.url());
    if (url.hostname === "identitytoolkit.googleapis.com") {
      if (url.pathname.endsWith("accounts:signInWithPassword"))
        return route.fulfill({
          json: {
            localId: uid,
            email,
            displayName: "Local Owner",
            idToken: token,
            refreshToken: "fictional-refresh",
            expiresIn: "3600",
            registered: true,
          },
        });
      if (url.pathname.endsWith("accounts:lookup"))
        return route.fulfill({
          json: {
            users: [
              {
                localId: uid,
                email,
                emailVerified: true,
                displayName: "Local Owner",
                providerUserInfo: [{ providerId: "password", email }],
              },
            ],
          },
        });
      return route.fulfill({
        status: 400,
        json: { error: { message: "FIXTURE_UNSUPPORTED" } },
      });
    }
    // Fail closed: every non-local request is intercepted, never sent.
    if (url.origin !== "http://127.0.0.1:4317") return route.abort();
    if (url.pathname.startsWith("/api/media/")) {
      state.mediaCalls++;
      state.mediaAuthorized &&=
        req.headers().authorization === `Bearer ${token}`;
      return route.fulfill({
        contentType: "image/jpeg",
        body: photo,
        headers: { "cache-control": "private, no-store" },
      });
    }
    if (url.pathname === "/api/admin/analytics")
      return route.fulfill({
        status: state.adminFailure ? 500 : 200,
        json: state.adminFailure
          ? { error: "Failed to fetch analytics" }
          : {
              totalUsers: 2,
              totalRevenue: 0,
              activeSubscriptions: 0,
              shelterPartners: 0,
            },
      });
    if (url.pathname === "/api/analysis/stream") {
      state.analysisCalls++;
      return route.fulfill({
        contentType: "text/event-stream",
        body: 'data: {"stage":"complete","analysisId":"analysis-local"}\n\n',
      });
    }
    if (url.pathname === "/api/upload")
      return route.fulfill({
        json: { url: locator, key: `uploads/${hash}/fixture.jpg` },
      });
    if (url.pathname.startsWith("/api/trpc/")) {
      const names = url.pathname.slice("/api/trpc/".length).split(",");
      if (state.authUnavailable && names.includes("auth.me"))
        return route.fulfill({
          status: 503,
          json: names.map(() => ({
            error: {
              json: {
                message: "Account service unavailable",
                code: -32603,
                data: { code: "INTERNAL_SERVER_ERROR", httpStatus: 503 },
              },
            },
          })),
        });
      if (state.disabled && names.some(n => n !== "payment.getAvailability"))
        return route.fulfill({
          status: 401,
          json: names.map(() => ({
            error: {
              json: {
                message: "Unauthorized",
                code: -32001,
                data: { code: "UNAUTHORIZED", httpStatus: 401 },
              },
            },
          })),
        });
      if (state.qualityFailure && names.includes("analysis.validatePhoto"))
        return route.fulfill({
          status: 503,
          json: [
            {
              error: {
                json: {
                  message:
                    "Photo quality check unavailable. No analysis was started.",
                  code: -32603,
                  data: { code: "INTERNAL_SERVER_ERROR", httpStatus: 503 },
                },
              },
            },
          ],
        });
      const values = names.map(name => {
        if (/createCheckout|createSubscriptionCheckout/.test(name))
          state.checkoutCalls++;
        if (name === "auth.me")
          return state.meNull ? null : { id: uid, email, role, credits: 3 };
        if (name === "pets.list") return [pet];
        if (name === "credits.getBalance")
          return { credits: 3, isBetaTester: false, unlimited: false };
        if (name === "analysis.listForPet") return [analysis];
        if (name === "analysis.get") return analysis;
        if (name === "analysis.validatePhoto")
          return {
            isAcceptable: true,
            canProceed: true,
            score: 95,
            tips: [],
            issues: [],
          };
        if (name === "payment.getAvailability")
          return {
            available: false,
            message: "Payments are currently unavailable.",
          };
        if (name === "payment.getCreditPacks")
          return ["starter", "value", "power"].map(id => ({
            id,
            name: id,
            credits: 10,
            price: 500,
          }));
        if (name === "reminders.list") return [];
        return null;
      });
      const result = values.map(value => ({
        result: { data: { json: value } },
      }));
      return route.fulfill({
        json: url.searchParams.get("batch") === "1" ? result : result[0],
      });
    }
    return route.continue();
  });
  return state;
}
async function submitLogin(page: Page) {
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page
    .getByLabel("Password", { exact: true })
    .fill("fictional-local-fixture-password");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText("LOCAL TEST PET", { exact: true })).toBeVisible();
  if (await page.getByRole("button", { name: "Skip", exact: true }).isVisible())
    await page.getByRole("button", { name: "Skip", exact: true }).click();
}
async function login(page: Page) {
  await page.goto("/login");
  await submitLogin(page);
}
async function expectRejectedLogin(page: Page) {
  await expect(page).toHaveURL(/\/login\?reason=session-unavailable$/);
  await expect(page.getByRole("alert")).toHaveText(
    "Your session is unavailable. Please sign in again."
  );
  await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
}
test("cold owner analytics, retryable 500, private photo and disabled-session recovery", async ({
  page,
}) => {
  const state = await fixture(page);
  await login(page);
  await page.goto("/admin/dashboard");
  await expect(
    page.getByRole("heading", { name: "Super Admin Dashboard" })
  ).toBeVisible();
  state.adminFailure = true;
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "temporarily unavailable"
  );
  state.adminFailure = false;
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Super Admin Dashboard" })
  ).toBeVisible();
  await page.goto("/pets/pet-local");
  const img = page.getByRole("img", { name: "Content", exact: true });
  await expect(img).toBeVisible();
  await expect
    .poll(() => img.evaluate(e => (e as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  expect(await img.getAttribute("src")).toMatch(/^blob:/);
  expect(state.mediaAuthorized).toBe(true);
  await page.locator('a[href="/analysis/analysis-local"]').first().click();
  await expect(
    page.getByRole("img", { name: "Analyzed pet photo" })
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => (window as any).__revoked.length))
    .toBeGreaterThan(0);
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    )
    .toBe(true);
  await page.screenshot({
    path: "/tmp/foreverhome-local-repair-results/owner-result.png",
  });
  state.disabled = true;
  await page.goto("/pets/pet-local");
  await expectRejectedLogin(page);
  await page.reload();
  await expectRejectedLogin(page);
  await expect(page.getByRole("img")).toHaveCount(0);
  await page.screenshot({
    path: "/tmp/foreverhome-local-repair-results/session-rejected-login.png",
  });
  state.disabled = false;
  await submitLogin(page);
  await expect(page.getByRole("alert")).toHaveCount(0);
  expect(state.checkoutCalls).toBe(0);
  expect(state.analysisCalls).toBe(0);
});
test("regular user sees admin denial; both billing surfaces disable every paid CTA", async ({
  page,
}) => {
  const state = await fixture(page, "user");
  await login(page);
  await page.goto("/admin/dashboard");
  await expect(page.getByRole("alert")).toContainText("Access denied");
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  for (const [path, name, count] of [
    ["/purchase", "Purchase", 3],
    ["/subscribe", "Subscribe Now", 5],
  ] as const) {
    await page.goto(path);
    await expect(
      page
        .getByRole("status")
        .filter({ hasText: "Payments are currently unavailable" })
    ).toBeVisible();
    const buttons = page.getByRole("button", { name, exact: true });
    await expect(buttons).toHaveCount(count);
    for (const b of await buttons.all()) await expect(b).toBeDisabled();
  }
  expect(state.checkoutCalls).toBe(0);
  await page.screenshot({
    path: "/tmp/foreverhome-local-repair-results/billing-unavailable.png",
  });
});

test("null server identity clears the cached Firebase session and permits fresh sign-in", async ({
  page,
}) => {
  const state = await fixture(page);
  await login(page);
  state.meNull = true;
  await page.goto("/pets/pet-local");
  await expectRejectedLogin(page);
  state.meNull = false;
  await submitLogin(page);
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("account service outage remains retryable without a session rejection redirect", async ({
  page,
}) => {
  const state = await fixture(page);
  await login(page);
  state.authUnavailable = true;
  await page.goto("/pets/pet-local");
  await expect(page.getByRole("alert")).toContainText(
    "Your account could not be loaded"
  );
  await expect(page).toHaveURL(/\/pets\/pet-local$/);
  state.authUnavailable = false;
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(
    page.getByText("Analyze Behavior", { exact: true })
  ).toBeVisible();
  await expect(page).toHaveURL(/\/pets\/pet-local$/);
});

test("ordinary sign-in has no rejection banner and arbitrary reasons are not reflected", async ({
  page,
}) => {
  await fixture(page);
  await page.goto("/login");
  await expect(
    page.getByRole("button", { name: "Sign In", exact: true })
  ).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await page.goto(
    "/login?reason=untrusted-message&returnTo=https://example.test"
  );
  await expect(
    page.getByRole("button", { name: "Sign In", exact: true })
  ).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(
    page.getByText("untrusted-message", { exact: true })
  ).toHaveCount(0);
  await submitLogin(page);
});
test("uploaded hosted preview renders and one mocked completion reaches persisted result view", async ({
  page,
}) => {
  const state = await fixture(page);
  await login(page);
  await page.goto("/pets/pet-local");
  await expect(
    page.getByText("Analyze Behavior", { exact: true })
  ).toBeVisible();
  await page
    .locator("input[type=file]")
    .setInputFiles("marketing/graphics/references/dog-cat-together.jpg");
  await page.getByRole("button", { name: /Click to Analyze/ }).click();
  await expect(page).toHaveURL(/\/analysis\/analysis-local$/);
  await expect(
    page.getByText("A fictional test interpretation.")
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Analyzed pet photo" })
  ).toBeVisible();
  expect(state.analysisCalls).toBe(1);
  expect(state.mediaCalls).toBeGreaterThan(0);
});

test("provider quality outage stops before another analysis request", async ({
  page,
}) => {
  const state = await fixture(page);
  state.qualityFailure = true;
  await login(page);
  await page.goto("/pets/pet-local");
  await page
    .locator("input[type=file]")
    .setInputFiles("marketing/graphics/references/dog-cat-together.jpg");
  await page.getByRole("button", { name: /Click to Analyze/ }).click();
  await expect(
    page.getByText(/quality check unavailable/).first()
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Uploaded pet photo" })
  ).toBeVisible();
  expect(state.analysisCalls).toBe(0);
});
