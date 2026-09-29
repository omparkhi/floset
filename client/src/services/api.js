import { API_BASE_URL } from "../config";
import { demoArticles } from "../data/demoArticles";
import { demoProducts } from "../data/demoProducts";

const getAuthHeaders = () => {
  const token = localStorage.getItem("floset_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = 2500) => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
  }
};

const getFilteredDemoProducts = (params = {}) => {
  const {
    category,
    gender,
    occasion,
    size,
    colour,
    minPrice,
    maxPrice,
    search,
    sort,
    featured,
    bestseller,
    duration = "duration3d",
  } = params;

  const filtered = demoProducts.filter((product) => {
    const price =
      product.pricing?.[duration] || product.pricing?.duration3d || 0;
    const searchableText = [
      product.name,
      product.description,
      product.category,
      product.brand,
      ...(product.occasions || []),
    ]
      .join(" ")
      .toLowerCase();

    if (
      category &&
      category !== "all" &&
      product.category.toLowerCase() !== String(category).toLowerCase()
    )
      return false;
    if (
      gender &&
      gender !== "all" &&
      product.gender !== gender &&
      product.gender !== "Unisex"
    )
      return false;
    if (
      occasion &&
      occasion !== "all" &&
      !product.occasions?.includes(occasion)
    )
      return false;
    if (size && size !== "all" && product.size !== size) return false;
    if (
      colour &&
      colour !== "all" &&
      !product.colour?.toLowerCase().includes(String(colour).toLowerCase())
    )
      return false;
    if (featured === "true" && !product.isFeatured) return false;
    if (bestseller === "true" && !product.isBestSeller) return false;
    if (minPrice && price < Number(minPrice)) return false;
    if (maxPrice && price > Number(maxPrice)) return false;
    if (search && !searchableText.includes(String(search).toLowerCase()))
      return false;
    return true;
  });

  if (sort === "price-low") {
    return filtered.sort(
      (a, b) => (a.pricing?.[duration] || 0) - (b.pricing?.[duration] || 0),
    );
  }
  if (sort === "price-high") {
    return filtered.sort(
      (a, b) => (b.pricing?.[duration] || 0) - (a.pricing?.[duration] || 0),
    );
  }
  if (sort === "popular") {
    return filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  return filtered;
};

export const api = {
  // Authentication
  auth: {
    login: async (credentials) => {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      return handleResponse(res);
    },
    register: async (userData) => {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      return handleResponse(res);
    },
    getMe: async () => {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    updateProfile: async (data) => {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
  },

  // Products (Sanitized catalogue & availability)
  products: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "" && val !== "all") {
          query.append(key, val);
        }
      });
      const url = `${API_BASE_URL}/products${query.toString() ? `?${query.toString()}` : ""}`;
      try {
        const res = await fetchWithTimeout(url);
        return handleResponse(res);
      } catch (error) {
        console.warn(
          "Using demo products because the catalogue API is unavailable:",
          error,
        );
        const products = getFilteredDemoProducts(params);
        return {
          success: true,
          count: products.length,
          products,
          demo: true,
        };
      }
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE_URL}/products/${id}`);
      return handleResponse(res);
    },
    checkAvailability: async (id, startDate, endDate) => {
      const query = new URLSearchParams();
      if (startDate) query.append("startDate", startDate);
      if (endDate) query.append("endDate", endDate);
      const res = await fetch(
        `${API_BASE_URL}/products/${id}/availability?${query.toString()}`,
      );
      return handleResponse(res);
    },
    listOutfit: async (outfitData) => {
      const res = await fetch(`${API_BASE_URL}/products/list-outfit`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(outfitData),
      });
      return handleResponse(res);
    },
    getHostListings: async () => {
      const res = await fetch(`${API_BASE_URL}/products/host/my-listings`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    updateHostListing: async (id, data) => {
      const res = await fetch(`${API_BASE_URL}/products/host/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    deleteHostListing: async (id) => {
      const res = await fetch(`${API_BASE_URL}/products/host/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Bookings
  cart: {
    get: async () => {
      const res = await fetch(`${API_BASE_URL}/cart`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    save: async (items) => {
      const res = await fetch(`${API_BASE_URL}/cart`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ items }),
      });
      return handleResponse(res);
    },
    clear: async () => {
      const res = await fetch(`${API_BASE_URL}/cart`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
  },

  bookings: {
    create: async (bookingData) => {
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(bookingData),
      });
      return handleResponse(res);
    },
    getMyBookings: async () => {
      const res = await fetch(`${API_BASE_URL}/bookings/my-bookings`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE_URL}/bookings/${id}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
  },

  orders: {
    create: async (orderData) => {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData),
      });
      return handleResponse(res);
    },
    getMyOrders: async () => {
      const res = await fetch(`${API_BASE_URL}/orders/my-orders`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    getAll: async () => {
      const res = await fetch(`${API_BASE_URL}/orders/admin/all`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    review: async (id, status) => {
      const res = await fetch(`${API_BASE_URL}/orders/${id}/review`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      return handleResponse(res);
    },
    updateItemStatus: async (id, itemId, status) => {
      const res = await fetch(
        `${API_BASE_URL}/orders/${id}/items/${itemId}/status`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ status }),
        },
      );
      return handleResponse(res);
    },
  },

  // Admin Portal
  admin: {
    getStats: async () => {
      const res = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    getPendingListings: async () => {
      const res = await fetch(`${API_BASE_URL}/admin/listings/pending`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    approveListing: async (id, data) => {
      const res = await fetch(`${API_BASE_URL}/admin/listings/${id}/approve`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    rejectListing: async (id, data) => {
      const res = await fetch(`${API_BASE_URL}/admin/listings/${id}/reject`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    getAllProducts: async () => {
      const res = await fetch(`${API_BASE_URL}/admin/products`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    updateProduct: async (id, data) => {
      const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    getAllBookings: async () => {
      const res = await fetch(`${API_BASE_URL}/admin/bookings`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    updateBookingStatus: async (id, data) => {
      const res = await fetch(`${API_BASE_URL}/admin/bookings/${id}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
  },
  // Journal / Editorial
  journal: {
    getTop: async () => {
      try {
        const res = await fetchWithTimeout(`${API_BASE_URL}/journal/top`);
        return handleResponse(res);
      } catch (error) {
        console.warn(
          "Using demo journal articles because the journal API is unavailable:",
          error,
        );
        return {
          success: true,
          articles: demoArticles.slice(0, 3),
          demo: true,
        };
      }
    },
    getAll: async () => {
      try {
        const res = await fetchWithTimeout(`${API_BASE_URL}/journal`);
        return handleResponse(res);
      } catch (error) {
        console.warn(
          "Using demo journal articles because the journal API is unavailable:",
          error,
        );
        return { success: true, articles: demoArticles, demo: true };
      }
    },
    getBySlug: async (slug) => {
      try {
        const res = await fetchWithTimeout(
          `${API_BASE_URL}/journal/${encodeURIComponent(slug)}`,
        );
        return handleResponse(res);
      } catch (error) {
        console.warn(
          "Using demo journal article because the journal API is unavailable:",
          error,
        );
        const article = demoArticles.find((item) => item.slug === slug);
        if (!article) throw new Error("Article not found");
        return { success: true, article, demo: true };
      }
    },
  },
};
