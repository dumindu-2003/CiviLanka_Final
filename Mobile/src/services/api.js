import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Change this to your computer's IPv4 address before testing on a phone.
// Do not use localhost. On a physical Android device, localhost means the phone itself.
// Find the address with: ipconfig
export const API_BASE_URL = "http://192.168.1.20:5000/api";

const TOKEN_KEY = "civilanka_token";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

export async function saveAuthToken(token) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export async function clearAuthToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  delete apiClient.defaults.headers.common.Authorization;
}

export async function restoreAuthToken() {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
  return token;
}

export async function checkBackendHealth() {
  try {
    const response = await apiClient.get("/health");

    if (!response.data || response.data.success !== true) {
      throw new Error("Health check failed. The server response was not successful.");
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error("Health check failed. The server could not complete the request.");
    }

    if (
      error.message === "Health check failed. The server response was not successful."
    ) {
      throw error;
    }

    throw new Error(
      "Backend unavailable. Start the CiviLanka API and set API_BASE_URL in src/services/api.js to this computer's IPv4 address."
    );
  }
}

export async function login(username, serviceNumber, password) {
  try {
    const response = await apiClient.post("/auth/login", {
      username,
      serviceNumber,
      password,
    });

    if (!response.data?.success || !response.data.token) {
      throw new Error("Login failed. Please try again.");
    }

    await saveAuthToken(response.data.token);
    return response.data.user;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    if (error.message === "Login failed. Please try again.") {
      throw error;
    }

    throw new Error(
      "Backend unavailable. Start the CiviLanka API and check the API address in src/services/api.js."
    );
  }
}

function readApiError(error, fallback) {
  if (error.response?.data?.message) {
    return new Error(error.response.data.message);
  }
  return new Error(fallback);
}

export async function getUsers() {
  try {
    const response = await apiClient.get("/users");
    return response.data.users || [];
  } catch (error) {
    throw readApiError(error, "Could not load users.");
  }
}

export async function getCurrentUser() {
  try {
    const response = await apiClient.get("/auth/me");
    if (!response.data?.user) {
      throw new Error("Could not load profile.");
    }
    return response.data.user;
  } catch (error) {
    if (error.message === "Could not load profile.") {
      throw error;
    }
    throw readApiError(error, "Could not load profile.");
  }
}

export async function saveNicForm(details) {
  try {
    const response = await apiClient.post("/nic-forms", details);
    return response.data.form;
  } catch (error) {
    const apiError = readApiError(error, "Could not save the NIC form.");
    apiError.fields = error.response?.data?.errors;
    throw apiError;
  }
}

export async function getNicApplications() {
  try {
    const response = await apiClient.get("/nic-forms");
    return response.data.applications || [];
  } catch (error) {
    throw readApiError(error, "Could not load NIC applications.");
  }
}

export async function approveNicApplication(id) {
  try {
    const response = await apiClient.post(`/nic-forms/${id}/approve`);
    return response.data.application;
  } catch (error) {
    throw readApiError(error, "Could not approve the NIC application.");
  }
}

export async function authorizeNicForm(id, credentials) {
  try {
    const response = await apiClient.post(`/nic-forms/${id}/authorize`, credentials);
    return response.data.receipt;
  } catch (error) {
    const apiError = readApiError(error, "Could not authorize the application.");
    apiError.fields = error.response?.data?.errors;
    throw apiError;
  }
}

export async function submitDeathReport(details) {
  try {
    const response = await apiClient.post("/death-reports", details);
    return response.data.report;
  } catch (error) {
    const apiError = readApiError(error, "Could not send the death report.");
    apiError.fields = error.response?.data?.errors;
    throw apiError;
  }
}

export async function getIncomingDeathReports() {
  try {
    const response = await apiClient.get("/death-reports/incoming");
    return response.data.reports || [];
  } catch (error) {
    throw readApiError(error, "Could not load death reports.");
  }
}

export async function updateDeathReport(id, details) {
  try {
    const response = await apiClient.patch(`/death-reports/${id}`, details);
    return response.data.report;
  } catch (error) {
    const apiError = readApiError(error, "Could not update the death report.");
    apiError.fields = error.response?.data?.errors;
    throw apiError;
  }
}

export async function approveDeathReport(id) {
  try {
    const response = await apiClient.post(`/death-reports/${id}/approve`);
    return response.data.report;
  } catch (error) {
    throw readApiError(error, "Could not approve the death report.");
  }
}

export async function getMyDeathReports() {
  try {
    const response = await apiClient.get("/death-reports");
    return response.data.reports || [];
  } catch (error) {
    throw readApiError(error, "Could not load death reports.");
  }
}

export async function createUser(account) {
  try {
    const response = await apiClient.post("/users", account);
    return response.data.user;
  } catch (error) {
    throw readApiError(error, "Could not add the user.");
  }
}
