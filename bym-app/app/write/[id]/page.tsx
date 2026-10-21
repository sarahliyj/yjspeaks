import { EditorPage } from '@/components/writer/editor-page';

export default async function ArticleEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditorPage id={id} />;
}
