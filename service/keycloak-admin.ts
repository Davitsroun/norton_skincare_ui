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
