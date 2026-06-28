const test = require("node:test");
const assert = require("node:assert/strict");
const { isResourceOwner, normalizeResourceType } = require("../Utils/voteHelpers");

test("detects ownership for reports and government posts", () => {
  const userId = "507f1f77bcf86cd799439011";

  assert.equal(isResourceOwner({ userId }, userId), true);
  assert.equal(isResourceOwner({ authorId: userId }, userId), true);
  assert.equal(isResourceOwner({ userId: "507f1f77bcf86cd799439012" }, userId), false);
  assert.equal(isResourceOwner({ authorId: "507f1f77bcf86cd799439012" }, userId), false);
});

test("normalizes gov resource types", () => {
  assert.equal(normalizeResourceType("govPost"), "govPost");
  assert.equal(normalizeResourceType("gov"), "govPost");
  assert.equal(normalizeResourceType(undefined), "report");
  assert.equal(normalizeResourceType("report"), "report");
});
