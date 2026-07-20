import { ProcessoDetailView } from "@/components/processos/ProcessoDetailView";

type ProcessoDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProcessoDetailPage({
  params,
}: ProcessoDetailPageProps) {
  const { id } = await params;

  return <ProcessoDetailView id={id} />;
}
