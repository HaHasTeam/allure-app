import { AxiosError } from "axios";

// Custom error class for API errors
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Handles API errors and returns a standardized error object
 * @param error The error object from axios
 * @returns A standardized error object
 */
export const handleApiError = (error: AxiosError): ApiError => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { status, data } = error.response;
    const message = getErrorMessage(status, data);

    return new ApiError(message, status, data);
  } else if (error.request) {
    // The request was made but no response was received
    return new ApiError(
      "No response received from server. Please check your internet connection.",
      0,
      null
    );
  } else {
    // Something happened in setting up the request
    return new ApiError(
      error.message || "An unexpected error occurred",
      0,
      null
    );
  }
};

/**
 * Gets a user-friendly error message based on the status code and response data
 * @param status HTTP status code
 * @param data Response data
 * @returns A user-friendly error message
 */
const getErrorMessage = (status: number, data: any): string => {
  // Extract error message from response data if available
  const serverMessage = data?.message || data?.error || JSON.stringify(data);

  switch (status) {
    case 400:
      return `Bad Request: ${serverMessage}`;
    case 401:
      return "Your session has expired. Please log in again.";
    case 403:
      return "You do not have permission to access this resource.";
    case 404:
      return "The requested resource was not found.";
    case 422:
      return `Validation Error: ${serverMessage}`;
    case 500:
      return "An internal server error occurred. Please try again later.";
    case 503:
      return "Service unavailable. Please try again later.";
    default:
      return `Error (${status}): ${serverMessage}`;
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
    if (error instanceof AxiosError) {
      throw handleApiError(error);
    }
    throw error;
  }
};
