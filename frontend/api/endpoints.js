const BASE_URL = "https://pametnica-production.up.railway.app/api";

export const endpoints = {
  registerParent: `${BASE_URL}/Auth/register-parent`,
  loginParent: `${BASE_URL}/Auth/login`,
  refreshToken: `${BASE_URL}/Auth/refresh`,
  logout: `${BASE_URL}/Auth/logout`,
  createChild: `${BASE_URL}/Children`,
  getChildren: `${BASE_URL}/Children`,
  loginChild: `${BASE_URL}/Auth/login-child`,
  shoppingLists: `${BASE_URL}/ShoppingLists`,
  parentShoppingLists: `${BASE_URL}/children`,
};

let authHandlers = {
  getAccessToken: null,
  getRefreshToken: null,
  onUpdateTokens: null,
  onLogout: null,
};

export function setAuthHandlers(handlers) {
  authHandlers = { ...authHandlers, ...handlers };
}

async function parseJsonSafely(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

let refreshInFlight = null;
async function refreshAccessToken() {
  if (refreshInFlight) return refreshInFlight;
  const refreshToken = authHandlers.getRefreshToken?.();
  if (!refreshToken) return null;

  refreshInFlight = (async () => {
    const response = await fetch(endpoints.refreshToken, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await parseJsonSafely(response);
    if (!response.ok) {
      throw new Error("Refresh token failed");
    }

    authHandlers.onUpdateTokens?.(data);
    return data?.token || null;
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

async function apiFetch(url, options = {}, token, retryOn401 = true) {
  const headers = { ...(options.headers || {}) };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  if (response.status !== 401 || !retryOn401) {
    return response;
  }

  try {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      authHandlers.onLogout?.();
      return response;
    }

    const retryHeaders = { ...(options.headers || {}) };
    retryHeaders.Authorization = `Bearer ${newToken}`;
    return await fetch(url, { ...options, headers: retryHeaders });
  } catch {
    authHandlers.onLogout?.();
    return response;
  }
}

export async function registerParent(payload) {
  const response = await fetch(endpoints.registerParent, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" ? data : null) ||
      "Registration failed.";
    const prefix = response.status ? `${response.status}: ` : "";
    throw new Error(`${prefix}${message}`);
  }

  return data;
}

export async function loginParent(payload) {
  const response = await fetch(endpoints.loginParent, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" ? data : null) ||
      "Login failed.";
    const prefix = response.status ? `${response.status}: ` : "";
    throw new Error(`${prefix}${message}`);
  }

  return data;
}

export async function createChild(payload, token, parentEmail) {
  const headers = {
    "Content-Type": "application/json",
  };

  const body = {
    monthlyAllowance: 0,
    ...payload,
  };
  if (parentEmail) {
    body.parentEmail = parentEmail;
  }

  const response = await apiFetch(
    endpoints.createChild,
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    },
    token
  );

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" ? data : null) ||
      "Child registration failed.";
    const prefix = response.status ? `${response.status}: ` : "";
    throw new Error(`${prefix}${message}`);
  }

  return data;
}

export async function getChildren(token) {
  const headers = {
    "Content-Type": "application/json",
  };

  const response = await apiFetch(
    endpoints.getChildren,
    {
      method: "GET",
      headers,
    },
    token
  );

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" ? data : null) ||
      "Fetching children failed.";
    const prefix = response.status ? `${response.status}: ` : "";
    throw new Error(`${prefix}${message}`);
  }

  return data;
}

export async function loginChild(payload) {
  const response = await fetch(endpoints.loginChild, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" ? data : null) ||
      "Login failed.";
    const prefix = response.status ? `${response.status}: ` : "";
    throw new Error(`${prefix}${message}`);
  }

  return data;
}

export async function logoutSession(refreshToken) {
  if (!refreshToken) return;
  const response = await fetch(endpoints.logout, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    const data = await parseJsonSafely(response);
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" ? data : null) ||
      "Logout failed.";
    const prefix = response.status ? `${response.status}: ` : "";
    throw new Error(`${prefix}${message}`);
  }
}

export async function updateChildAllowance(childId, monthlyAllowance, token) {
  const headers = {
    "Content-Type": "application/json",
  };

  const response = await apiFetch(
    `${endpoints.createChild}/${encodeURIComponent(childId)}/allowance`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({ monthlyAllowance }),
    },
    token
  );

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" ? data : null) ||
      "Ažuriranje budžeta nije uspjelo.";
    const prefix = response.status ? `${response.status}: ` : "";
    throw new Error(`${prefix}${message}`);
  }

  return data;
}

export async function deductChildPoints(childId, points, token) {
  const headers = {
    "Content-Type": "application/json",
  };

  const response = await apiFetch(
    `${endpoints.createChild}/${encodeURIComponent(childId)}/deduct-points`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ points }),
    },
    token
  );

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" ? data : null) ||
      "Skidanje bodova nije uspjelo.";
    const prefix = response.status ? `${response.status}: ` : "";
    throw new Error(`${prefix}${message}`);
  }

  return data;
}

const mapListTypeToBackend = (listTypeUi) => {
  // UI: 1 = nova lista, 2 = hitna lista
  // Backend enum: 0 = Normal, 1 = Emergency
  if (listTypeUi === 2) return 1;
  return 0;
};

export async function createShoppingList({ title, listType }, token) {
  const headers = {
    "Content-Type": "application/json",
  };

  const response = await apiFetch(
    endpoints.shoppingLists,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        title,
        type: mapListTypeToBackend(listType),
      }),
    },
    token
  );

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" ? data : null) ||
      "Kreiranje liste nije uspjelo.";
    const prefix = response.status ? `${response.status}: ` : "";
    throw new Error(`${prefix}${message}`);
  }

  return data;
}

export async function addShoppingListItem(listId, name, token) {
  const headers = {
    "Content-Type": "application/json",
  };

  const response = await apiFetch(
    `${endpoints.shoppingLists}/${encodeURIComponent(listId)}/items`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ name }),
    },
    token
  );

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" ? data : null) ||
      "Dodavanje stavke nije uspjelo.";
    const prefix = response.status ? `${response.status}: ` : "";
    throw new Error(`${prefix}${message}`);
  }

  return data;
}

export async function deleteShoppingListItem(listId, itemId, token) {
  const headers = {};

  const response = await apiFetch(
    `${endpoints.shoppingLists}/${encodeURIComponent(
      listId
    )}/items/${encodeURIComponent(itemId)}`,
    {
      method: "DELETE",
      headers,
    },
    token
  );

  if (!response.ok) {
    const data = await parseJsonSafely(response);
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" ? data : null) ||
      "Brisanje stavke nije uspjelo.";
    const prefix = response.status ? `${response.status}: ` : "";
    throw new Error(`${prefix}${message}`);
  }
}

export async function submitShoppingList(listId, token) {
  const headers = {};

  const response = await apiFetch(
    `${endpoints.shoppingLists}/${encodeURIComponent(listId)}/submit`,
    {
      method: "POST",
      headers,
    },
    token
  );

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" ? data : null) ||
      "Slanje liste nije uspjelo.";
    const prefix = response.status ? `${response.status}: ` : "";
    throw new Error(`${prefix}${message}`);
  }

  return data;
}

export async function deleteShoppingList(listId, token) {
  const headers = {};

  const response = await apiFetch(
    `${endpoints.shoppingLists}/${encodeURIComponent(listId)}`,
    {
      method: "DELETE",
      headers,
    },
    token
  );

  if (!response.ok) {
    const data = await parseJsonSafely(response);
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" ? data : null) ||
      "Brisanje liste nije uspjelo.";
    const prefix = response.status ? `${response.status}: ` : "";
    throw new Error(`${prefix}${message}`);
  }
}

export async function getChildActiveLists(token) {
  const headers = {};

  const response = await apiFetch(
    `${endpoints.shoppingLists}/active`,
    {
      method: "GET",
      headers,
    },
    token
  );

  const data = await parseJsonSafely(response);
  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" ? data : null) ||
      "Učitavanje aktivnih listi nije uspjelo.";
    const prefix = response.status ? `${response.status}: ` : "";
    throw new Error(`${prefix}${message}`);
  }

  return data;
}

// ME PROFILE
export async function getMe(token) {
  const headers = {};

  const response = await apiFetch(
    `${BASE_URL}/Me`,
    {
      method: "GET",
      headers,
    },
    token
  );

  const data = await parseJsonSafely(response);
  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" ? data : null) ||
      "Učitavanje profila nije uspjelo.";
    const prefix = response.status ? `${response.status}: ` : "";
    throw new Error(`${prefix}${message}`);
  }

  return data;
}

export async function updateMe(payload, token) {
  const headers = {
    "Content-Type": "application/json",
  };

  const response = await apiFetch(
    `${BASE_URL}/Me`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    },
    token
  );

  const data = await parseJsonSafely(response);
  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" ? data : null) ||
      "Ažuriranje profila nije uspjelo.";
    const prefix = response.status ? `${response.status}: ` : "";
    throw new Error(`${prefix}${message}`);
  }

  return data;
}

export async function updateShoppingListTitle(listId, title, token) {
  const headers = {
    "Content-Type": "application/json",
  };

  const response = await apiFetch(
    `${endpoints.shoppingLists}/${encodeURIComponent(listId)}/title`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({ title }),
    },
    token
  );

  const data = await parseJsonSafely(response);
  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" ? data : null) ||
      "Ažuriranje naziva liste nije uspjelo.";
    const prefix = response.status ? `${response.status}: ` : "";
    throw new Error(`${prefix}${message}`);
  }

  return data;
}

export async function getChildPendingLists(token) {
  const headers = {};

  const response = await apiFetch(
    `${endpoints.shoppingLists}/pending`,
    {
      method: "GET",
      headers,
    },
    token
  );

  const data = await parseJsonSafely(response);
  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" ? data : null) ||
      "Učitavanje listi na čekanju nije uspjelo.";
    const prefix = response.status ? `${response.status}: ` : "";
    throw new Error(`${prefix}${message}`);
  }

  return data;
}

export async function getParentActiveLists(parentToken, childId) {
  const headers = {};

  const response = await apiFetch(
    `${endpoints.parentShoppingLists}/${encodeURIComponent(
      childId
    )}/shopping-lists/active`,
    {
      method: "GET",
      headers,
    },
    parentToken
  );

  const data = await parseJsonSafely(response);
  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" ? data : null) ||
      "Učitavanje aktivnih listi nije uspjelo.";
    const prefix = response.status ? `${response.status}: ` : "";
    throw new Error(`${prefix}${message}`);
  }

  return data;
}

export async function getParentPendingLists(parentToken, childId) {
  const headers = {};

  const response = await apiFetch(
    `${endpoints.parentShoppingLists}/${encodeURIComponent(
      childId
    )}/shopping-lists/pending`,
    {
      method: "GET",
      headers,
    },
    parentToken
  );

  const data = await parseJsonSafely(response);
  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" ? data : null) ||
      "Učitavanje listi na čekanju nije uspjelo.";
    const prefix = response.status ? `${response.status}: ` : "";
    throw new Error(`${prefix}${message}`);
  }

  return data;
}

export async function approveShoppingList(listId, parentToken) {
  const headers = {};

  const response = await apiFetch(
    `${endpoints.shoppingLists}/${encodeURIComponent(listId)}/approve`,
    {
      method: "PUT",
      headers,
    },
    parentToken
  );

  const data = await parseJsonSafely(response);
  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" ? data : null) ||
      "Odobravanje liste nije uspjelo.";
    const prefix = response.status ? `${response.status}: ` : "";
    throw new Error(`${prefix}${message}`);
  }

  return data;
}

export async function rejectShoppingList(listId, parentToken) {
  const headers = {};

  const response = await apiFetch(
    `${endpoints.shoppingLists}/${encodeURIComponent(listId)}/reject`,
    {
      method: "PUT",
      headers,
    },
    parentToken
  );

  const data = await parseJsonSafely(response);
  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" ? data : null) ||
      "Odbijanje liste nije uspjelo.";
    const prefix = response.status ? `${response.status}: ` : "";
    throw new Error(`${prefix}${message}`);
  }

  return data;
}

export async function updateShoppingListItem(
  listId,
  itemId,
  name,
  parentToken,
  remove = false
) {
  const headers = {
    "Content-Type": "application/json",
  };

  const url = `${endpoints.shoppingLists}/${encodeURIComponent(
    listId
  )}/items/${encodeURIComponent(itemId)}`;

  const response = await apiFetch(
    url,
    {
      method: remove ? "DELETE" : "PUT",
      headers,
      body: remove ? undefined : JSON.stringify({ name }),
    },
    parentToken
  );

  const data = await parseJsonSafely(response);
  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" ? data : null) ||
      "Ažuriranje stavke nije uspjelo.";
    const prefix = response.status ? `${response.status}: ` : "";
    throw new Error(`${prefix}${message}`);
  }

  return data;
}

/**
 * Verify a shopping item using OCR + AI semantic matching.
 * 
 * This function:
 * 1. Sends a base64-encoded image of a price tag to the backend
 * 2. Backend forwards to OCR service for text extraction
 * 3. AI verifies if the price tag matches the shopping item
 * 4. Returns verification result with confidence score
 * 
 * IMPORTANT: Image is processed in-memory only and never stored.
 * 
 * @param {string} listId - Shopping list ID
 * @param {string} itemId - Shopping item ID to verify
 * @param {string} imageBase64 - Base64-encoded image of the price tag
 * @param {string} token - Child authentication token
 * @returns {Promise<{isMatch: boolean, confidence: number, ocrText: string, extractedPrice: string|null, message: string}>}
 */
export async function verifyShoppingItem(listId, itemId, imageBase64, token) {
  const headers = {
    "Content-Type": "application/json",
  };

  const response = await apiFetch(
    `${endpoints.shoppingLists}/${encodeURIComponent(
      listId
    )}/items/${encodeURIComponent(itemId)}/verify`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ imageBase64 }),
    },
    token
  );

  const data = await parseJsonSafely(response);
  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" ? data : null) ||
      "Verifikacija artikla nije uspjela.";
    const prefix = response.status ? `${response.status}: ` : "";
    throw new Error(`${prefix}${message}`);
  }

  return data;
}

/**
 * Complete a shopping item after successful verification.
 * Call this after verifyShoppingItem returns isMatch: true.
 * 
 * @param {string} listId - Shopping list ID
 * @param {string} itemId - Shopping item ID
 * @param {number} price - Price entered by the child
 * @param {string} token - Child authentication token
 * @returns {Promise<object>} Updated shopping list
 */
export async function completeShoppingItem(listId, itemId, price, token) {
  const headers = {
    "Content-Type": "application/json",
  };

  const response = await apiFetch(
    `${endpoints.shoppingLists}/${encodeURIComponent(
      listId
    )}/items/${encodeURIComponent(itemId)}/complete`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ price }),
    },
    token
  );

  const data = await parseJsonSafely(response);
  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" ? data : null) ||
      "Označavanje stavke kao kupljene nije uspjelo.";
    const prefix = response.status ? `${response.status}: ` : "";
    throw new Error(`${prefix}${message}`);
  }

  return data;
}