import { Footer, Nav } from '@/components/site';
import { TextLink } from '@/components/ui';

export default function ChangeNotFound() {
  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-24 sm:px-6">
        <h1 className="display text-[40px] leading-[1.2]">This change doesn&apos;t exist.</h1>
        <p className="mt-4 text-steel">It may have been removed, or the link has a typo.</p>
        <div className="mt-6"><TextLink href="/changes">All changes</TextLink></div>
      </main>
      <Footer />
    </>
  );
}
