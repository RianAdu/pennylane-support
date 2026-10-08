// Raw shapes: the JSON files exactly as the brief ships them. Enum-like fields are plain strings here and are
// checked when normalize.ts narrows them.

export interface RawPost {
  post_id: number;
  user: string;
  timestamp: string;
  content: string;
  user_role: string;
  reactions: { upvotes: number; helpful: number };
  is_accepted_answer: boolean;
}

export interface RawConversation {
  identifier: string;
  topic: string;
  category: string;
  posts: RawPost[];
  challenge_id: string;
  status: string;
  priority: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  participant_count: number;
  participants: string[];
  view_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  assigned_to: string | null;
  resolution_time_hours: number | null;
  description?: string;
}

export interface RawChallenge {
  challenge_id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number | string;
  tags: string[];
  learning_objectives: string[];
  hints: string[];
  status: string;
  estimated_minutes: number;
  completion_rate: number;
  attempt_count: number;
  average_attempts_to_pass: number;
  created_at: string;
  updated_at: string;
  author: string;
  prerequisite_challenge_ids: string[];
}

// Domain shapes: what the mock store holds and the API returns.

export const VIEWER_ROLES = ["learner", "admin"] as const;
export type ViewerRole = (typeof VIEWER_ROLES)[number];

export const POST_ROLES = ["learner", "mentor", "staff", "support"] as const;
export type PostRole = (typeof POST_ROLES)[number];

export const CONVERSATION_STATUSES = ["open", "answered", "resolved", "closed"] as const;
export type ConversationStatus = (typeof CONVERSATION_STATUSES)[number];

export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const CHALLENGE_STATUSES = ["published", "draft", "archived"] as const;
export type ChallengeStatus = (typeof CHALLENGE_STATUSES)[number];

export const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced", "Expert"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export interface Post {
  /** Unique only inside its conversation; identify a post by conversation id and postId together. */
  postId: number;
  author: string;
  /** The role the author held when posting. A user's role is never derived from it. */
  roleAtPosting: PostRole;
  postedAt: string;
  content: string;
  upvotes: number;
  helpful: number;
}

export interface Conversation {
  id: string;
  title: string;
  category: string;
  challengeId: string;
  status: ConversationStatus;
  priority: Priority;
  tags: string[];
  createdAt: string;
  lastActivityAt: string;
  assignee: string | null;
  pinned: boolean;
  locked: boolean;
  viewCount: number;
  resolutionTimeHours: number | null;
  description: string;
  /** The opening post first, then the replies in time order. */
  posts: Post[];
  acceptedPostId: number | null;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  points: number;
  tags: string[];
  learningObjectives: string[];
  hints: string[];
  status: ChallengeStatus;
  estimatedMinutes: number;
  completionRate: number;
  attemptCount: number;
  averageAttemptsToPass: number;
}
