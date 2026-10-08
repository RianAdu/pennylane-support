import type { RawChallenge, RawConversation, RawPost } from "../domain/types";

// Raw records in the shape of the brief's JSON files, with overrides for the field a test is about.

export const rawPost = (overrides: Partial<RawPost> = {}): RawPost => {
  return {
    post_id: 1,
    user: "asker",
    timestamp: "2024-03-01T10:00:00Z",
    content: "My circuit returns NaN.",
    user_role: "learner",
    reactions: { upvotes: 3, helpful: 1 },
    is_accepted_answer: false,
    ...overrides,
  };
};

export const rawConversation = (overrides: Partial<RawConversation> = {}): RawConversation => {
  return {
    identifier: "CONV_TEST",
    topic: "Unexpected NaNs when measuring",
    category: "PennyLane Help",
    posts: [rawPost()],
    challenge_id: "CHAL_001",
    status: "open",
    priority: "medium",
    tags: ["debugging"],
    created_at: "2024-03-01T10:00:00Z",
    updated_at: "2024-03-01T10:00:00Z",
    last_activity_at: "2024-03-01T10:00:00Z",
    participant_count: 1,
    participants: ["asker"],
    view_count: 10,
    is_pinned: false,
    is_locked: false,
    assigned_to: null,
    resolution_time_hours: null,
    description: "My circuit returns NaN.",
    ...overrides,
  };
};

export const rawChallenge = (overrides: Partial<RawChallenge> = {}): RawChallenge => {
  return {
    challenge_id: "CHAL_TEST",
    title: "Begin Here",
    description: "A first circuit.",
    category: "Getting Started",
    difficulty: "Beginner",
    points: 50,
    tags: [],
    learning_objectives: [],
    hints: [],
    status: "published",
    estimated_minutes: 30,
    completion_rate: 0.5,
    attempt_count: 10,
    average_attempts_to_pass: 1.5,
    created_at: "2023-06-04T20:00:00Z",
    updated_at: "2023-06-18T20:00:00Z",
    author: "pennylane_team",
    prerequisite_challenge_ids: [],
    ...overrides,
  };
};
