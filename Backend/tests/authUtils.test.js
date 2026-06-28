const test = require("node:test");
const assert = require("node:assert/strict");
const { extractToken } = require("../Utils/authUtils");

test("extracts bearer tokens from authorization headers", () => {
  const req = { headers: { authorization: "Bearer abc123" } };
  assert.equal(extractToken(req), "abc123");
});

test("falls back to body and query tokens", () => {
  assert.equal(extractToken({ body: { token: "body-token" } }), "body-token");
  assert.equal(extractToken({ query: { token: "query-token" } }), "query-token");
});
