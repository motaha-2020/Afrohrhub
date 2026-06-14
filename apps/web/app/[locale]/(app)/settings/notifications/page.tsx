import { getTranslations } from "next-intl/server";
import {
  CHANNEL_DELIVERY_STATS,
  NOTIFICATION_TEMPLATES,
} from "@/lib/data/mock/notification-templates";
import { NotificationTemplatesClient } from "./NotificationTemplatesClient";

export default async function NotificationTemplatesPage() {
  await getTranslations("notificationTemplates");
  return (
    <NotificationTemplatesClient
      templates={NOTIFICATION_TEMPLATES}
      stats={CHANNEL_DELIVERY_STATS}
    />
  );
}
