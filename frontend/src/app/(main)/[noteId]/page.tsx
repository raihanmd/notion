type Props = {
  params: Promise<{ noteId: string }>;
};

export default async function page({ params }: Props) {
  const { noteId } = await params;
  return <div className="px-1 py-4">{noteId}</div>;
}
