import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "./api";

function mockFetch(status: number, body?: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(body === undefined ? null : JSON.stringify(body), { status })
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("api client", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it("sends the stored token as a bearer header", async () => {
    localStorage.setItem("token", "abc");
    const fetchMock = mockFetch(200, { user: { id: 1 } });

    await api.me();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/v1/me");
    expect(init.headers.Authorization).toBe("Bearer abc");
  });

  it("omits the auth header when logged out", async () => {
    const fetchMock = mockFetch(200, []);
    await api.getExercises();
    expect(fetchMock.mock.calls[0][1].headers).not.toHaveProperty("Authorization");
  });

  it("clears the token and redirects to login on 401", async () => {
    localStorage.setItem("token", "expired");
    vi.stubGlobal("location", { href: "/" });
    mockFetch(401, { error: "Unauthorized" });

    await expect(api.me()).rejects.toThrow("Unauthorized");
    expect(localStorage.getItem("token")).toBeNull();
    expect(window.location.href).toBe("/login");
  });

  it("surfaces validation errors from the API", async () => {
    mockFetch(422, { errors: ["Email has already been taken", "Name can't be blank"] });
    await expect(
      api.signup({ name: "", email: "a@b.c", password: "x", password_confirmation: "x" })
    ).rejects.toThrow("Email has already been taken, Name can't be blank");
  });

  it("resolves to undefined on 204 No Content", async () => {
    mockFetch(204);
    await expect(api.deleteWorkoutSession(1)).resolves.toBeUndefined();
  });
});
