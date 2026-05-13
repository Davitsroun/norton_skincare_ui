import type { UserNotificationApi } from '@/types/user-notification';

function isRecord(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v);
}

function pickString(r: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = r[k];
    if (typeof v === 'string' && v.trim() !== '') {
      return v;
    }
  }
  return '';
}

function pickReadFlag(r: Record<string, unknown>): boolean {
  if (typeof r.read === 'boolean') {
    return r.read;
  }
  if (typeof r.isRead === 'boolean') {
    return r.isRead;
  }
  const ts = pickString(r, ['readAt', 'read_at']);
  return ts !== '';
}

/** Normalize one API row (camelCase or snake_case). */
export function normalizeUserNotificationRow(raw: unknown): UserNotificationApi | null {
  if (!isRecord(raw)) {
    return null;
  }

  const id = pickString(raw, ['id', 'notificationId', 'uuid']);
  if (!id) {
    return null;
  }

  return {
    id,
    type: pickString(raw, ['type', 'notificationType']).toUpperCase() || 'CUSTOM',
    title: pickString(raw, ['title']),
    body: pickString(raw, ['body', 'message', 'content']),
    read: pickReadFlag(raw),
    createdAt: pickString(raw, ['createdAt', 'created_at']) || null,
    updatedAt: pickString(raw, ['updatedAt', 'updated_at']) || null,
  };
}

/** Spring `Page<UserNotificationDto>` or a plain array */
export function normalizeUserNotificationsPayload(payload: unknown): UserNotificationApi[] {
  let rows: unknown[] = [];
  if (Array.isArray(payload)) {
    rows = payload;
  } else if (isRecord(payload)) {
    const content = payload.content;
    if (Array.isArray(content)) {
      rows = content;
    }
  }

  const out: UserNotificationApi[] = [];
  for (const row of rows) {
    const n = normalizeUserNotificationRow(row);
    if (n) {
      out.push(n);
    }
  }
  return out;
}
