const serverUrl = process.env.KEYCLOAK_SERVER_URL ?? 'http://localhost:8081';
const realm = process.env.KEYCLOAK_REALM ?? 'rest-api';
const clientId = process.env.KEYCLOAK_CLIENT_ID ?? 'oauth-admin-client';
const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET ?? '';

const tokenEndpoint = `${serverUrl}/realms/${realm}/protocol/openid-connect/token`;
const adminUsersEndpoint = `${serverUrl}/admin/realms/${realm}/users`;

export async function getKeycloakAdminAccessToken() {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
  });
  if (clientSecret) {
    body.set('client_secret', clientSecret);
  }

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    throw new Error('Failed to get Keycloak admin token');
  }

  const json = (await response.json()) as { access_token?: string };
  if (!json.access_token) {
    throw new Error('Missing Keycloak admin access token');
  }

  return json.access_token;
}

export async function findUserByEmail(email: string, adminToken: string) {
  const response = await fetch(
    `${adminUsersEndpoint}?email=${encodeURIComponent(email)}&exact=true`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to search Keycloak users');
  }

  const users = (await response.json()) as Array<{ id: string; email?: string }>;
  return users.find((user) => user.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

type KeycloakUser = {
  id: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  attributes?: Record<string, string[]>;
};

export async function getUserById(userId: string, adminToken: string) {
  const response = await fetch(`${adminUsersEndpoint}/${encodeURIComponent(userId)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get Keycloak user');
  }

  return (await response.json()) as KeycloakUser;
}

export async function createUser(data: {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}) {
  const adminToken = await getKeycloakAdminAccessToken();

  const response = await fetch(adminUsersEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      enabled: true,
      emailVerified: false,
      credentials: [
        {
          type: 'password',
          value: data.password,
          temporary: false,
        },
      ],
    }),
  });

  return response;
}

export async function triggerForgotPasswordEmail(email: string) {
  const adminToken = await getKeycloakAdminAccessToken();
  const user = await findUserByEmail(email, adminToken);
  if (!user) {
    return;
  }

  const response = await fetch(`${adminUsersEndpoint}/${user.id}/execute-actions-email`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(['UPDATE_PASSWORD']),
  });

  if (!response.ok) {
    const responseText = await response.text().catch(() => '');
    console.error('Keycloak password reset email failed', {
      status: response.status,
      responseText,
    });
    throw new Error('Failed to trigger Keycloak password reset email');
  }
}

export async function updateUserPasswordByEmail(email: string, password: string) {
  const adminToken = await getKeycloakAdminAccessToken();
  const user = await findUserByEmail(email, adminToken);
  if (!user) {
    throw new Error('User not found');
  }

  const response = await fetch(`${adminUsersEndpoint}/${user.id}/reset-password`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'password',
      value: password,
      temporary: false,
    }),
  });

  if (!response.ok) {
    const responseText = await response.text().catch(() => '');
    console.error('Keycloak password update failed', {
      status: response.status,
      responseText,
    });
    throw new Error('Failed to update Keycloak password');
  }
}

export async function verifyUserPassword(username: string, password: string) {
  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: clientId,
    username,
    password,
    scope: 'openid',
  });

  if (clientSecret) {
    body.set('client_secret', clientSecret);
  }

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  return response.ok;
}

export async function updateUserProfileById(
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    imageUrl?: string;
    username?: string;
  }
) {
  const adminToken = await getKeycloakAdminAccessToken();
  const user = await getUserById(userId, adminToken);
  const attributes = {
    ...(user.attributes ?? {}),
  };

  if (data.imageUrl !== undefined) {
    attributes.imageUrl = [data.imageUrl];
  }

  const response = await fetch(`${adminUsersEndpoint}/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...user,
      username: data.username ?? user.username,
      email: data.email ?? user.email,
      firstName: data.firstName ?? user.firstName,
      lastName: data.lastName ?? user.lastName,
      attributes,
    }),
  });

  if (!response.ok) {
    const responseText = await response.text().catch(() => '');
    console.error('Keycloak profile update failed', {
      status: response.status,
      responseText,
    });
    throw new Error('Failed to update Keycloak profile');
  }
}

export async function updateUserPasswordById(userId: string, password: string) {
  const adminToken = await getKeycloakAdminAccessToken();

  const response = await fetch(`${adminUsersEndpoint}/${encodeURIComponent(userId)}/reset-password`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'password',
      value: password,
      temporary: false,
    }),
  });

  if (!response.ok) {
    const responseText = await response.text().catch(() => '');
    console.error('Keycloak password update failed', {
      status: response.status,
      responseText,
    });
    throw new Error('Failed to update Keycloak password');
  }
}
