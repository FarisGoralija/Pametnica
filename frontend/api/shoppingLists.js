import client from './client';

// Child routes
export const createShoppingList = async ({ title, type }) => {
  const { data } = await client.post('/api/shopping-lists', { title, type });
  return data;
};

export const addItem = async (listId, { name }) => {
  const { data } = await client.post(`/api/shopping-lists/${listId}/items`, { name });
  return data;
};

export const updateItem = async (listId, itemId, { name, price }) => {
  const { data } = await client.put(`/api/shopping-lists/${listId}/items/${itemId}`, { name, price });
  return data;
};

export const deleteItem = async (listId, itemId) => {
  await client.delete(`/api/shopping-lists/${listId}/items/${itemId}`);
};

export const submitList = async (listId) => {
  const { data } = await client.post(`/api/shopping-lists/${listId}/submit`);
  return data;
};

export const completeItem = async (listId, itemId, { price }) => {
  const { data } = await client.post(`/api/shopping-lists/${listId}/items/${itemId}/complete`, { price });
  return data;
};

export const getChildPending = async () => {
  const { data } = await client.get('/api/shopping-lists/pending');
  return data;
};

export const getChildActive = async () => {
  const { data } = await client.get('/api/shopping-lists/active');
  return data;
};

export const getChildHistory = async () => {
  const { data } = await client.get('/api/shopping-lists/history');
  return data;
};

// Parent routes
export const getParentPending = async (childId) => {
  const { data } = await client.get(`/api/children/${childId}/shopping-lists/pending`);
  return data;
};

export const getParentActive = async (childId) => {
  const { data } = await client.get(`/api/children/${childId}/shopping-lists/active`);
  return data;
};

export const approveList = async (listId) => {
  const { data } = await client.put(`/api/shopping-lists/${listId}/approve`);
  return data;
};

export const rejectList = async (listId) => {
  const { data } = await client.put(`/api/shopping-lists/${listId}/reject`);
  return data;
};
