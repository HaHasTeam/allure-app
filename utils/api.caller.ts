import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type Method,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { handleApiError } from "./error-handler";

// Create a custom axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token key in AsyncStorage
export const ACCESS_TOKEN = "accessToken";

// Request interceptor for adding token and handling request errors
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem(ACCESS_TOKEN);

      // If token exists, add it to the headers
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling response errors
apiClient.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx causes this function to trigger
    return response;
  },
  async (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Handle unauthorized errors (401)
const handleUnauthorized = async () => {
  try {
    // Clear token from storage
    await AsyncStorage.removeItem(ACCESS_TOKEN);

    // You might want to redirect to login screen or refresh token
    // For example, if using React Navigation:
    // navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  } catch (error) {
    console.error("Error handling unauthorized status:", error);
  }
};

/**
 * Creates a request using the configured Axios instance.
 *
 * @param {string} endpoint - The API endpoint to which the request should be made.
 * @param {string} method - The HTTP method for the request (e.g., 'GET', 'POST', 'PUT', 'DELETE').
 * @param {object} [headers={}] - An object containing custom headers for the request. Default is an empty object.
 * @param {object} [params={}] - An object containing URL parameters for the request. Default is an empty object.
 * @param {object} [body={}] - An object containing the request body. Default is an empty object.
 * @returns {Promise} - A Promise that resolves to the response of the HTTP request.
 */
export const request = (
  endpoint: string,
  method: Method,
  headers: object = {},
  params: object = {},
  body: object = {}
): Promise<AxiosResponse> => {
  return apiClient({
    url: endpoint,
    method,
    headers: Object.assign({}, headers),
    params: Object.assign({}, params),
    data: body,
  });
};

/**
 * Sends a GET request to the specified endpoint.
 *
 * @param {string} endpoint - The API endpoint to which the GET request should be made.
 * @param {object} [params={}] - An object containing URL parameters for the request. Default is an empty object.
 * @param {object} [headers={}] - An object containing custom headers for the request. Default is an empty object.
 * @returns {Promise<AxiosResponse>} - A Promise that resolves to the response of the GET request.
 */
export const GET = (
  endpoint: string,
  params: object = {},
  headers: object = {}
): Promise<AxiosResponse> => {
  return request(endpoint, "GET", headers, params);
};

/**
 * Sends a POST request to the specified endpoint.
 *
 * @param {string} endpoint - The API endpoint to which the POST request should be made.
 * @param {object} [body={}] - An object containing the request body. Default is an empty object.
 * @param {object} [params={}] - An object containing URL parameters for the request. Default is an empty object.
 * @param {object} [headers={}] - An object containing custom headers for the request. Default is an empty object.
 * @returns {Promise<AxiosResponse>} - A Promise that resolves to the response of the POST request.
 */
export const POST = (
  endpoint: string,
  body: object = {},
  params: object = {},
  headers: object = {}
): Promise<AxiosResponse> => {
  return request(endpoint, "POST", headers, params, body);
};

/**
 * Sends a PUT request to the specified endpoint.
 *
 * @param {string} endpoint - The API endpoint to which the PUT request should be made.
 * @param {object} [body={}] - An object containing the request body. Default is an empty object.
 * @param {object} [params={}] - An object containing URL parameters for the request. Default is an empty object.
 * @param {object} [headers={}] - An object containing custom headers for the request. Default is an empty object.
 * @returns {Promise<AxiosResponse>} - A Promise that resolves to the response of the PUT request.
 */
export const PUT = (
  endpoint: string,
  body: object = {},
  params: object = {},
  headers: object = {}
): Promise<AxiosResponse> => {
  return request(endpoint, "PUT", headers, params, body);
};

/**
 * Sends a PATCH request to the specified endpoint.
 *
 * @param {string} endpoint - The API endpoint to which the PATCH request should be made.
 * @param {object} [body={}] - An object containing the request body. Default is an empty object.
 * @param {object} [params={}] - An object containing URL parameters for the request. Default is an empty object.
 * @param {object} [headers={}] - An object containing custom headers for the request. Default is an empty object.
 * @returns {Promise<AxiosResponse>} - A Promise that resolves to the response of the PATCH request.
 */
export const PATCH = (
  endpoint: string,
  body: object = {},
  params: object = {},
  headers: object = {}
): Promise<AxiosResponse> => {
  return request(endpoint, "PATCH", headers, params, body);
};

/**
 * Sends a DELETE request to the specified endpoint.
 *
 * @param {string} endpoint - The API endpoint to which the DELETE request should be made.
 * @param {object} [body={}] - An object containing the request body. Default is an empty object.
 * @param {object} [params={}] - An object containing URL parameters for the request. Default is an empty object.
 * @param {object} [headers={}] - An object containing custom headers for the request. Default is an empty object.
 * @returns {Promise<AxiosResponse>} - A Promise that resolves to the response of the DELETE request.
 */
export const DELETE = (
  endpoint: string,
  body: object = {},
  params: object = {},
  headers: object = {}
): Promise<AxiosResponse> => {
  return request(endpoint, "DELETE", headers, params, body);
};

// Helper function to set the auth token
export const setAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(ACCESS_TOKEN, token);
  } catch (error) {
    console.error("Error setting auth token:", error);
  }
};

// Helper function to get the auth token
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(ACCESS_TOKEN);
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

// Helper function to clear the auth token
export const clearAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ACCESS_TOKEN);
  } catch (error) {
    console.error("Error clearing auth token:", error);
  }
};

/**
 * Utility function to safely use API calls with error handling
 * @param apiCall The API call function to execute
 * @returns A promise that resolves to the API response or rejects with a standardized error
 */
export const safeApiCall = async <T>(apiCall: Promise<T>): Promise<T> => {
  try {
    return await apiCall;
  } catch (error) {
    throw handleApiError(error as AxiosError);
  }
};
