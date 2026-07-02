// A utility function to fetch data from the backend
async function fetchFromAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`/api/${endpoint}`, options);
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ error: 'Request failed with no error body' }));
      throw new Error(errorBody.error || `HTTP error! status: ${response.status}`);
    }
    if (options.method === 'DELETE') {
      return response;
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    throw error;
  }
}

// Functions to fetch initial data
export const getProducts = () => fetchFromAPI('products.php');
export const getCategories = () => fetchFromAPI('categories.php');
export const getUsers = () => fetchFromAPI('users.php');
export const getSales = () => fetchFromAPI('sales_view.php');
export const getRoles = () => fetchFromAPI('roles.php');

// Functions for CRUD operations
export const createProduct = (productData) => fetchFromAPI('products_add.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(productData),
});

export const updateProduct = (productId, productData) => fetchFromAPI(`products_edit.php?id=${productId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(productData),
});

export const deleteProduct = (productId) => fetchFromAPI(`products_delete.php?id=${productId}`, {
  method: 'DELETE',
});

export const createCategory = (categoryData) => fetchFromAPI('categories_add.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(categoryData),
});

export const updateCategory = (categoryId, categoryData) => fetchFromAPI(`categories_edit.php?id=${categoryId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(categoryData),
});

export const deleteCategory = (categoryId) => fetchFromAPI(`categories_delete.php?id=${categoryId}`, {
  method: 'DELETE',
});

export const completeSale = (saleData) => fetchFromAPI('sales_add.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(saleData),
});

export const createUser = (userData) => fetchFromAPI('users_add.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(userData),
});

export const updateUser = (userId, userData) => fetchFromAPI(`users_edit.php?id=${userId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(userData),
});

export const deleteUser = (userId) => fetchFromAPI(`users_delete.php?id=${userId}`, {
  method: 'DELETE',
});