export const normalizeVoteState = (issue) => {
  const hasUpArray = Array.isArray(issue.upvotes);
  const hasDownArray = Array.isArray(issue.downvotes);

  return {
    upvotes: hasUpArray ? issue.upvotes : undefined,
    downvotes: hasDownArray ? issue.downvotes : undefined,
    upvotesCount: hasUpArray ? issue.upvotes.length : issue.upvotesCount ?? 0,
    downvotesCount: hasDownArray ? issue.downvotes.length : issue.downvotesCount ?? 0,
  };
};

const removeUserId = (list, userId) =>
  list.filter((item) => String(item ?? "") !== String(userId ?? ""));

export const applyOptimisticVote = ({ issue, userId, voteType, hasCurrentVote, hasOppositeVote }) => {
  const currentUserId = String(userId ?? "");
  const hasUpArray = Array.isArray(issue.upvotes);
  const hasDownArray = Array.isArray(issue.downvotes);
  const nextIssue = { ...issue };

  const currentUpCount = hasUpArray ? issue.upvotes.length : issue.upvotesCount ?? 0;
  const currentDownCount = hasDownArray ? issue.downvotes.length : issue.downvotesCount ?? 0;

  let newUpCount = currentUpCount;
  let newDownCount = currentDownCount;

  if (voteType === "up") {
    if (hasCurrentVote) {
      if (hasUpArray) {
        nextIssue.upvotes = removeUserId(issue.upvotes, currentUserId);
      }
      newUpCount = Math.max(0, currentUpCount - 1);
    } else {
      if (hasUpArray) {
        nextIssue.upvotes = [...removeUserId(issue.upvotes, currentUserId), userId];
      }
      newUpCount = currentUpCount + 1;
      if (hasOppositeVote) {
        if (hasDownArray) {
          nextIssue.downvotes = removeUserId(issue.downvotes, currentUserId);
        }
        newDownCount = Math.max(0, currentDownCount - 1);
      }
    }
  }

  if (voteType === "down") {
    if (hasCurrentVote) {
      if (hasDownArray) {
        nextIssue.downvotes = removeUserId(issue.downvotes, currentUserId);
      }
      newDownCount = Math.max(0, currentDownCount - 1);
    } else {
      if (hasDownArray) {
        nextIssue.downvotes = [...removeUserId(issue.downvotes, currentUserId), userId];
      }
      newDownCount = currentDownCount + 1;
      if (hasOppositeVote) {
        if (hasUpArray) {
          nextIssue.upvotes = removeUserId(issue.upvotes, currentUserId);
        }
        newUpCount = Math.max(0, currentUpCount - 1);
      }
    }
  }

  if (!hasUpArray) {
    nextIssue.upvotesCount = newUpCount;
    delete nextIssue.upvotes;
  } else {
    nextIssue.upvotesCount = nextIssue.upvotes.length;
  }

  if (!hasDownArray) {
    nextIssue.downvotesCount = newDownCount;
    delete nextIssue.downvotes;
  } else {
    nextIssue.downvotesCount = nextIssue.downvotes.length;
  }

  return nextIssue;
};
