import Image from "next/image";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-center px-4 py-20 sm:px-6">
      <Image src="/brand/logo.svg" alt="Whylode" width={156} height={40} priority />
      <h1 className="mt-10 max-w-3xl text-[57px] font-semibold leading-[1.09] tracking-tight sm:text-[84px] sm:leading-[1.06]">
        The code survived. The reason didn&apos;t.
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate">
        Whylode runs inside IBM Bob. When a rule changes, it traces every line that has to change,
        asks the one person who knows why, and keeps the answer.
      </p>
    </main>
  );
}
