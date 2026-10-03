/**
 * 视觉母题「风线」：三条缓慢流动的曲线，纯装饰。
 */
export function WindLines({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 720 220"
      fill="none"
      aria-hidden="true"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <path className="wind-line" d="M-20 64 C 120 24, 250 104, 390 60 S 650 36, 760 76" />
      <path
        className="wind-line wind-line-2"
        d="M-20 118 C 140 158, 300 76, 460 118 S 670 148, 760 104"
      />
      <path
        className="wind-line wind-line-3"
        d="M-20 170 C 160 138, 330 198, 490 156 S 690 128, 760 168"
      />
    </svg>
  );
}
