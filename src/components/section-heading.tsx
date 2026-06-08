type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  light?: boolean;
  className?: string;
};

/** Estilo de sección inspirado en vegalta.co.jp */
export function SectionHeading({
  title,
  subtitle,
  light = false,
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`text-center ${className}`}>
      <h2
        className={`vegalta-section-title text-xl sm:text-2xl md:text-3xl font-bold px-2 ${
          light ? "text-white" : "text-vegalta-royal-blue"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-1 text-sm tracking-wide ${
            light ? "text-white/70" : "text-vegalta-blue/60"
          }`}
        >
          {subtitle}
        </p>
      )}
      <div
        className={`mx-auto mt-3 h-0.5 w-16 ${
          light ? "bg-vegalta-gold-light" : "bg-vegalta-gold"
        }`}
      />
    </div>
  );
}
