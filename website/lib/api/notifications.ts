import { ApiRequestError, extractApiErrorMessage, resolveApiBaseUrl } from "@/lib/api/authenticatedRequest";
import {
  createInstallationRegistrationPayload,
  type NotificationInstallationPayload,
} from "@/lib/notifications/installation";

type NotificationApiError =
  | {
      code?: string;
      details?: string;
    }
  | string
  | null;

type NotificationApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  error?: NotificationApiError;
};

export type PushTokenRegisterPayload = {
  installation_id: string;
  token: string;
  provider: "firebase";
  channel: "push";
};

export type PushTokenUnregisterPayload = {
  installation_id: string;
  token: string;
  reason: string;
};

function extractErrorCode(data: unknown) {
  if (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as { error?: unknown }).error === "object" &&
    (data as { error?: unknown }).error !== null &&
    "code" in ((data as { error: { code?: unknown } }).error || {}) &&
    typeof (data as { error: { code?: unknown } }).error.code === "string"
  ) {
    return (data as { error: { code: string } }).error.code;
  }

  return undefined;
}

async function notificationRequest<T>(
  endpoint: string,
  {
    method = "POST",
    accessToken,
    jsonBody,
    fallbackError,
  }: {
    method?: "POST" | "PUT";
    accessToken?: string;
    jsonBody?: unknown;
    fallbackError: string;
  }
): Promise<T> {
  const headers = new Headers({
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  });

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${resolveApiBaseUrl()}${endpoint}`, {
    method,
    headers,
    body: jsonBody !== undefined ? JSON.stringify(jsonBody) : undefined,
    cache: "no-store",
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new ApiRequestError(extractApiErrorMessage(data, fallbackError), {
      status: response.status,
      code: extractErrorCode(data),
    });
  }

  const parsed = data as NotificationApiResponse<T>;
  if (!parsed?.success) {
    throw new ApiRequestError(parsed?.message || extractApiErrorMessage(data, fallbackError), {
      status: response.status,
      code: extractErrorCode(data),
    });
  }

  return parsed.data as T;
}

function isInstallationNotFound(error: unknown) {
  return (
    error instanceof ApiRequestError &&
    error.status === 404 &&
    (error.code === "installation_not_found" || error.message.toLowerCase().includes("installation"))
  );
}

function isPushTokenNotFound(error: unknown) {
  return error instanceof ApiRequestError && error.status === 404 && error.code === "push_token_not_found";
}

export async function registerNotificationInstallation(
  payload: NotificationInstallationPayload,
  accessToken?: string | null
) {
  return notificationRequest<unknown>("/api/v1/notifications/installations/register", {
    method: "POST",
    accessToken: accessToken || undefined,
    jsonBody: payload,
    fallbackError: "Failed to register notification installation",
  });
}

export async function bindNotificationInstallation(installationId: string, accessToken: string) {
  try {
    return await notificationRequest<unknown>(
      `/api/v1/notifications/installations/${encodeURIComponent(installationId)}/bind`,
      {
        method: "POST",
        accessToken,
        fallbackError: "Failed to bind notification installation",
      }
    );
  } catch (error) {
    if (!isInstallationNotFound(error)) {
      throw error;
    }

    await registerNotificationInstallation(createInstallationRegistrationPayload(installationId), accessToken);
    return notificationRequest<unknown>(
      `/api/v1/notifications/installations/${encodeURIComponent(installationId)}/bind`,
      {
        method: "POST",
        accessToken,
        fallbackError: "Failed to bind notification installation",
      }
    );
  }
}

export async function unbindNotificationInstallation(installationId: string, accessToken: string) {
  try {
    return await notificationRequest<unknown>(
      `/api/v1/notifications/installations/${encodeURIComponent(installationId)}/unbind`,
      {
        method: "POST",
        accessToken,
        fallbackError: "Failed to unbind notification installation",
      }
    );
  } catch (error) {
    if (isInstallationNotFound(error)) {
      return null;
    }
    throw error;
  }
}

export async function registerNotificationPushToken(
  payload: PushTokenRegisterPayload,
  accessToken?: string | null
) {
  return notificationRequest<unknown>("/api/v1/notifications/push-tokens/register", {
    method: "POST",
    accessToken: accessToken || undefined,
    jsonBody: payload,
    fallbackError: "Failed to register push token",
  });
}

export async function unregisterNotificationPushToken(
  payload: PushTokenUnregisterPayload,
  accessToken?: string | null
) {
  try {
    return await notificationRequest<unknown>("/api/v1/notifications/push-tokens/unregister", {
      method: "POST",
      accessToken: accessToken || undefined,
      jsonBody: payload,
      fallbackError: "Failed to unregister push token",
    });
  } catch (error) {
    if (isPushTokenNotFound(error)) {
      return null;
    }
    throw error;
  }
}
