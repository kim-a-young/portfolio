/**
 * 렌더/이펙트 정리 시 빠르게 끊기도록 짧은 틱으로 나눈 sleep.
 */
export function cancellableSleep(
  ms: number,
  isCancelled: () => boolean
): Promise<void> {
  const tickMs = 48;
  let elapsed = 0;
  return new Promise((resolve) => {
    const step = () => {
      if (isCancelled()) {
        resolve();
        return;
      }
      if (elapsed >= ms) {
        resolve();
        return;
      }
      const d = Math.min(tickMs, ms - elapsed);
      elapsed += d;
      setTimeout(step, d);
    };
    step();
  });
}

/** 방금 붙인 덩어리 기준, 참고 스니펫과 동일한 보너스 지연(ms) */
export function gptLikeDelayAfterChunk(chunk: string): number {
  let delay = 20 + Math.random() * 40;
  if (/[.!?]/.test(chunk)) delay += 200;
  if (chunk.includes("\n")) delay += 300;
  return delay;
}

/** 첫 글자 나오기 전 대기 (참고 스니펫과 동일 분포) */
export function gptLikeInitialDelayMs(): number {
  return 400 + Math.random() * 600;
}

/**
 * 다음에 붙일 글자 수.
 * 대부분 1글자, 가끔 2~5글자 덩어리로 자연스러운 타이핑 변주.
 */
export function gptLikeChunkCharCount(): number {
  if (Math.random() < 0.76) return 1;
  return Math.floor(Math.random() * 4) + 2;
}
