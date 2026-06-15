import { getTranslations } from "next-intl/server";
import { aiEnabled } from "@/lib/ai/client";
import { AiStudioClient } from "./AiStudioClient";

export default async function AiPage() {
  await getTranslations("ai");
  return <AiStudioClient live={aiEnabled()} />;
}
