import client from './client';

export const createChild = async ({ email, firstName, lastName, password, monthlyAllowance }) => {
  const { data } = await client.post('/api/children', {
    email,
    firstName,
    lastName,
    password,
    monthlyAllowance,
  });
  return data;
};

export const listChildren = async () => {
  const { data } = await client.get('/api/children');
  return data;
};

export const getChild = async (childId) => {
  const { data } = await client.get(`/api/children/${childId}`);
  return data;
};
