import { auth } from '@clerk/nextjs/server';

async function DocLayout() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('User is not authenticated');
  }
  return <div>DocLayout</div>;
}
export default DocLayout;
