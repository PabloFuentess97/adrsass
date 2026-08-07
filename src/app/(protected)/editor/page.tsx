import { requireAdminPage } from "@/lib/auth/require-admin";
import { EditorShell } from "@/components/editor/editor-shell";

export default async function EditorPage() {
  await requireAdminPage();
  return <EditorShell />;
}
