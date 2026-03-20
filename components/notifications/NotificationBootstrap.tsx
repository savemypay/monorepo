"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { bindNotificationInstallation, registerNotificationInstallation } from "@/lib/api/notifications";
import { registerBrowserPushToken } from "@/lib/notifications/firebase";
import { createInstallationRegistrationPayload } from "@/lib/notifications/installation";

export default function NotificationBootstrap() {
  const { accessToken, hasHydrated } = useAuthStore();
  const lastRegistrationMode = useRef<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;

    const registrationMode = accessToken ? "authenticated" : "anonymous";
    if (lastRegistrationMode.current === registrationMode) return;
    lastRegistrationMode.current = registrationMode;

    const payload = createInstallationRegistrationPayload();
    void (async () => {
      try {
        await registerNotificationInstallation(payload, accessToken);
        if (accessToken) {
          await bindNotificationInstallation(payload.installation_id, accessToken);
          await registerBrowserPushToken(accessToken).catch(() => null);
        }
      } catch {
        // Notification installation bootstrap should never block page rendering.
      }
    })();
  }, [accessToken, hasHydrated]);

  return null;
}
