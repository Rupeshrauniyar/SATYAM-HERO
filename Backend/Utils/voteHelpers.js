const normalizeResourceType = (resourceType) => {
  if (resourceType === "govPost" || resourceType === "gov") return "govPost";
  return "report";
};

const isResourceOwner = (resource, userId) => {
  if (!resource || !userId) return false;
  const ownerId = resource.authorId?._id || resource.authorId || resource.userId?._id || resource.userId;
  return ownerId?.toString() === userId.toString();
};

module.exports = {
  normalizeResourceType,
  isResourceOwner,
};
