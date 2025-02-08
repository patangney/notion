import RoomProvider from '@/components/RoomProvider';

async function DocLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RoomProvider roomId={id}>{children}</RoomProvider>;
}
export default DocLayout;
