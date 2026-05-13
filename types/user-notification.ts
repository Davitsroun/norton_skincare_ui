/** API create body for POST /api/v1/user-notifications */
export type UserNotificationCreateBody = {
  type: string;
  title: string;
  body: string;
};

/** API update body for PUT /api/v1/user-notifications/{id} */
export type UserNotificationUpdateBody = {
  read?: boolean;
};

export type UserNotificationApi = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};
