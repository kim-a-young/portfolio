import Image from "next/image";
import Link from "next/link";

export default async function HappyHabitPage({
  params,
}: {
  params: Promise<Record<string, string | string[] | undefined>>;
}) {
  await params;
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <div className="mx-auto flex w-full max-w-none flex-col px-4 pb-[60px] pt-[40px]">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
            SKT 해피해빗 앱 리뉴얼
          </h1>
          <Link
            href="/"
            className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-600"
          >
            BACK
          </Link>
        </header>

        <div className="flex justify-center overflow-auto">
          <Image
            src="/images/pf_happyhabit.png"
            alt="SKT 해피해빗 앱 리뉴얼 상세 화면"
            width={800}
            height={800}
            className="h-auto w-auto max-w-none"
            priority
          />
        </div>
      </div>
    </main>
  );
}

