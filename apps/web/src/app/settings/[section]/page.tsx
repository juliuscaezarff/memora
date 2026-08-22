import { notFound } from "next/navigation";

import { SettingsPage, type SettingsSection } from "@/components/settings-page";

const sections = new Set<SettingsSection>(["labels", "mcp", "keyboard"]);

export default async function SettingsSectionPage({
	params,
}: {
	params: Promise<{ section: string }>;
}) {
	const { section } = await params;

	if (!sections.has(section as SettingsSection)) notFound();

	return <SettingsPage section={section as SettingsSection} />;
}
