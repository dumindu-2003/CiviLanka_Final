import axios from "axios";
import { NativeModules } from "react-native";
import getDevServer from "react-native/Libraries/Core/Devtools/getDevServer";
import * as SecureStore from "expo-secure-store";
import { PUBLIC_API_URL } from "../constants/publicApiUrl";

function hostFromUrl(url) {
  if (typeof url !== "string") {
    return null;
  }

  const match = url.match(/https?:\/\/([^:/]+)/);
  return match?.[1] || null;
}

function publishedApiUrl() {
  const value = String(PUBLIC_API_URL || "").trim().replace(/\/$/, "");
  if (!value) {
    return null;
  }

  return value.endsWith("/api") ? value : `${value}/api`;
}

function lanApiUrl() {
  const devServerUrl = (() => {
    try {
      return getDevServer()?.url;
    } catch {
      return null;
    }
  })();
  const host =
    hostFromUrl(NativeModules?.SourceCode?.scriptURL) || hostFromUrl(devServerUrl);

  if (
    !host ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".exp.direct") ||
    host.endsWith(".loca.lt") ||
    host.endsWith(".trycloudflare.com")
  ) {
    return null;
  }

  return `http://${host}:5000/api`;
}

// Same Wi-Fi or hotspot uses the computer directly. A public address is only
// used when the phone did not load the app from this computer's own IP.
function apiBaseUrl() {
  return lanApiUrl() || publishedApiUrl() || "";
}

export const API_BASE_URL = apiBaseUrl();

const TOKEN_KEY = "civilanka_token";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    Accept: "application/json",
    "Bypass-Tunnel-Reminder": "true",
  },
});

apiClient.interceptors.request.use((config) => {
  if (!config.__triedPublic) {
    config.baseURL = apiBaseUrl();
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const published = publishedApiUrl();
    const current = config?.baseURL;
    if (!config || config.__triedPublic || error.response || !published || published === current) {
      return Promise.reject(error);
    }

    config.__triedPublic = true;
    config.baseURL = published;
    return apiClient.request(config);
  }
);

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

export async function submitMarriageRegistration(details) {
  try {
    const response = await apiClient.post("/marriage-registrations", details);
    return response.data.registration;
  } catch (error) {
    const apiError = readApiError(error, "Could not send the marriage registration.");
    apiError.fields = error.response?.data?.errors;
    throw apiError;
  }
}

export async function getMyMarriageRegistrations() {
  try {
    const response = await apiClient.get("/marriage-registrations");
    return response.data.registrations || [];
  } catch (error) {
    throw readApiError(error, "Could not load marriage certificates.");
  }
}

export async function getIncomingMarriageRegistrations() {
  try {
    const response = await apiClient.get("/marriage-registrations/incoming");
    return response.data.registrations || [];
  } catch (error) {
    throw readApiError(error, "Could not load marriage registrations.");
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
    const apiError = readApiError(error, "Could not add the user.");
    apiError.fields = error.response?.data?.errors;
    throw apiError;
  }
}

export async function updateUser(id, account) {
  try {
    const response = await apiClient.patch(`/users/${id}`, account);
    return response.data.user;
  } catch (error) {
    const apiError = readApiError(error, "Could not update the user.");
    apiError.fields = error.response?.data?.errors;
    throw apiError;
  }
}

export async function getBankCertificates(type) {
  try {
    const response = await apiClient.get("/identity/certificates", {
      params: { type },
    });
    return response.data.certificates || [];
  } catch (error) {
    throw readApiError(error, "Could not load certificates.");
  }
}

export async function verifyIdentity(number) {
  try {
    const response = await apiClient.get("/identity/verify", {
      params: { q: number },
    });
    return response.data.match || null;
  } catch (error) {
    throw readApiError(error, "Could not verify this number.");
  }
}

export async function deleteUser(id) {
  try {
    await apiClient.delete(`/users/${id}`);
  } catch (error) {
    throw readApiError(error, "Could not delete the user.");
  }
}
