import type { Metadata } from 'next';
import { ExpertInbox } from './inbox';

export const metadata: Metadata = {
  title: 'Questions for you | Whylode',
  robots: { index: false },
};

export default async function AskPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <ExpertInbox token={token} />;
}
