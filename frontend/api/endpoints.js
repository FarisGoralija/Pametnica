const BASE_URL = "https://pametnica-production.up.railway.app/api";

export const endpoints = {
  registerParent: `${BASE_URL}/Auth/register-parent`,
  loginParent: `${BASE_URL}/Auth/login`,
  createChild: `${BASE_URL}/Children`,
  getChildren: `${BASE_URL}/Children`,
  loginChild: `${BASE_URL}/Auth/login-child`,
  shoppingLists: `${BASE_URL}/ShoppingLists`,
  parentShoppingLists: `${BASE_URL}/children`,
};

async function parseJsonSafely(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
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
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const body = {
    monthlyAllowance: 0,
    ...payload,
  };
  if (parentEmail) {
    body.parentEmail = parentEmail;
  }

  const response = await fetch(endpoints.createChild, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

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
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(endpoints.getChildren, {
    method: "GET",
    headers,
  });

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

export async function updateChildAllowance(childId, monthlyAllowance, token) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${endpoints.createChild}/${encodeURIComponent(childId)}/allowance`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({ monthlyAllowance }),
    }
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
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${endpoints.createChild}/${encodeURIComponent(childId)}/deduct-points`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ points }),
    }
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
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(endpoints.shoppingLists, {
    method: "POST",
    headers,
    body: JSON.stringify({
      title,
      type: mapListTypeToBackend(listType),
    }),
  });

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
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(
    `${endpoints.shoppingLists}/${encodeURIComponent(listId)}/items`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ name }),
    }
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
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(
    `${endpoints.shoppingLists}/${encodeURIComponent(
      listId
    )}/items/${encodeURIComponent(itemId)}`,
    {
      method: "DELETE",
      headers,
    }
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
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(
    `${endpoints.shoppingLists}/${encodeURIComponent(listId)}/submit`,
    {
      method: "POST",
      headers,
    }
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
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(
    `${endpoints.shoppingLists}/${encodeURIComponent(listId)}`,
    {
      method: "DELETE",
      headers,
    }
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
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${endpoints.shoppingLists}/active`, {
    method: "GET",
    headers,
  });

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

export async function updateShoppingListTitle(listId, title, token) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(
    `${endpoints.shoppingLists}/${encodeURIComponent(listId)}/title`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({ title }),
    }
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
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${endpoints.shoppingLists}/pending`, {
    method: "GET",
    headers,
  });

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
  if (parentToken) headers.Authorization = `Bearer ${parentToken}`;

  const response = await fetch(
    `${endpoints.parentShoppingLists}/${encodeURIComponent(
      childId
    )}/shopping-lists/active`,
    {
      method: "GET",
      headers,
    }
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
  if (parentToken) headers.Authorization = `Bearer ${parentToken}`;

  const response = await fetch(
    `${endpoints.parentShoppingLists}/${encodeURIComponent(
      childId
    )}/shopping-lists/pending`,
    {
      method: "GET",
      headers,
    }
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
  if (parentToken) headers.Authorization = `Bearer ${parentToken}`;

  const response = await fetch(
    `${endpoints.shoppingLists}/${encodeURIComponent(listId)}/approve`,
    {
      method: "PUT",
      headers,
    }
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
  if (parentToken) headers.Authorization = `Bearer ${parentToken}`;

  const response = await fetch(
    `${endpoints.shoppingLists}/${encodeURIComponent(listId)}/reject`,
    {
      method: "PUT",
      headers,
    }
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
  if (parentToken) headers.Authorization = `Bearer ${parentToken}`;

  const url = `${endpoints.shoppingLists}/${encodeURIComponent(
    listId
  )}/items/${encodeURIComponent(itemId)}`;

  const response = await fetch(url, {
    method: remove ? "DELETE" : "PUT",
    headers,
    body: remove ? undefined : JSON.stringify({ name }),
  });

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
