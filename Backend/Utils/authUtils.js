const extractToken = (req) => {
  const headerToken = req.headers?.authorization || req.headers?.Authorization;
  if (typeof headerToken === "string") {
    return headerToken.startsWith("Bearer ") ? headerToken.slice(7).trim() : headerToken;
  }

  if (typeof req.body?.token === "string") return req.body.token;
  if (typeof req.query?.token === "string") return req.query.token;
  return null;
};

module.exports = { extractToken };
