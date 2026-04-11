import { NewShowcaseClient } from "@/components/NewShowcaseClient";

/** 클라이언트 쇼케이스만 렌더 — async/params 불필요(환경별 RSC 이슈 방지) */
export default function V2ShowcasePage() {
  return <NewShowcaseClient />;
}
