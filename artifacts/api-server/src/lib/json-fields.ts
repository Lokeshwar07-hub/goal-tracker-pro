/** JSON column shapes stored on goals (matches API payloads). */
export interface GoalComment {
  id: number;
  authorId: number;
  authorName: string;
  role: string;
  text: string;
  createdAt: string;
}

export interface QuarterlyUpdate {
  quarter: string;
  achievement: number;
  progressStatus: string;
  progressScore: number | null;
  managerComment: string | null;
  updatedAt: string;
}

export function asGoalComments(value: unknown): GoalComment[] {
  return Array.isArray(value) ? (value as GoalComment[]) : [];
}

export function asQuarterlyUpdates(value: unknown): QuarterlyUpdate[] {
  return Array.isArray(value) ? (value as QuarterlyUpdate[]) : [];
}
