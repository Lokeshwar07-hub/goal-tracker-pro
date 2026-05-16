import { db, notificationsTable } from "@workspace/db";

export async function createNotification(params: {
  userId: number;
  type: string;
  title: string;
  message: string;
  relatedGoalId?: number;
}) {
  try {
    await db.insert(notificationsTable).values({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      isRead: false,
      relatedGoalId: params.relatedGoalId ?? null,
    });
  } catch {
    // Non-critical — do not throw
  }
}
