import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 10 requests per 1 hour
export const postRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1h"),
  analytics: true,
  prefix: "@upstash/ratelimit/post",
});

export const commentRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(30, "1h"),
  analytics: true,
  prefix: "@upstash/ratelimit/comment",
});

export const questionRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1h"),
  analytics: true,
  prefix: "@upstash/ratelimit/question",
});

export const spamCommentRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1m"),
  analytics: true,
  prefix: "@upstash/ratelimit/spam_comment",
});

