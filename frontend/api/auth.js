import client, { setAuthToken } from './client';

export const registerParent = async ({ email, password, firstName, lastName }) => {
  const { data } = await client.post('/api/auth/register-parent', {
    email,
    password,
    firstName,
    lastName,
  });
  if (data?.token) setAuthToken(data.token);
  return data;
};

export const loginParent = async ({ email, password }) => {
  const { data } = await client.post('/api/auth/login', { email, password });
  if (data?.token) setAuthToken(data.token);
  return data;
};

export const loginChild = async ({ email, password }) => {
  const { data } = await client.post('/api/auth/login-child', { email, password });
  if (data?.token) setAuthToken(data.token);
  return data;
};
