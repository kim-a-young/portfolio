"use client";

type ResolvedTool =
  | { kind: "icon"; src: string; label: string }
  | { kind: "text"; label: string };

function resolveToolToken(token: string): ResolvedTool {
  const t = token.trim();
  const k = t.toLowerCase();

  if (k === "photoshop" || k === "ps") {
    return {
      kind: "icon",
      src: "/images/tools/photoshop.png",
      label: "Adobe Photoshop",
    };
  }
  if (k === "illustrator" || k === "ai") {
    return {
      kind: "icon",
      src: "/images/tools/illustrator.png",
      label: "Adobe Illustrator",
    };
  }
  if (k === "xd" || k === "adobe xd") {
    return {
      kind: "icon",
      src: "/images/tools/xd.png",
      label: "Adobe XD",
    };
  }
  if (k === "after effects" || k === "aftereffects" || k === "ae") {
    return {
      kind: "icon",
      src: "/images/tools/after-effects.png",
      label: "Adobe After Effects",
    };
  }
  if (k === "figma") {
    return {
      kind: "icon",
      src: "/images/tools/figma.png",
      label: "Figma",
    };
  }

  return { kind: "text", label: t };
}

export function ProjectDetailToolsRow({ detailTools }: { detailTools: string }) {
  const trimmed = detailTools.trim();
  const m = trimmed.match(/^Tool\s*:\s*(.*)$/i);
  const body = m?.[1]?.trim() ?? "";

  if (!m || !body) {
    return (
      <p className="mt-2 text-sm text-neutral-500 sm:text-[15px]">{trimmed}</p>
    );
  }

  const tokens = body
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const tools = tokens.map(resolveToolToken);

  return (
    <div
      className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-neutral-600 sm:text-[15px]"
      role="group"
      aria-label="사용 도구"
    >
      {tools.map((tool, i) => (
        <span key={`${i}-${tool.label}`} className="inline-flex items-center">
          {tool.kind === "icon" ? (
            // eslint-disable-next-line @next/next/no-img-element -- /public 정적 PNG; next/image 최적화 이슈 방지
            <img
              src={tool.src}
              alt={tool.label}
              width={16}
              height={16}
              className="h-4 w-4 shrink-0 object-contain"
              decoding="async"
            />
          ) : (
            <span className="text-neutral-500">{tool.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}
