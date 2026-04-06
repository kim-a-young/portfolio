import { HomePageClient } from "./home-page-client";

export default async function HomePage({
  params,
}: Readonly<{
  params: Promise<Record<string, string | string[] | undefined>>;
}>) {
  await params;
  return <HomePageClient />;
}
