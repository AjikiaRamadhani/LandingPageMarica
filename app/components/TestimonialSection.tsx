"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useAnimationControls, type PanInfo } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const avatarColors = [
  "bg-marica-maroon",
  "bg-marica-teal",
  "bg-[#e0507a]",
  "bg-marica-violet-deep",
];

const testimonials = [
  {
    key: "sarah",
    name: "Bunda Sarah",
    role: "Ibu Rumah Tangga",
    quote:
      "Marica benar-benar jadi penyelamat di akhir pekan! Si Kecil betah banget main board game dan workshop-nya sangat edukatif.",
  },
  {
    key: "maya",
    name: "Bunda Maya",
    role: "Working Mom",
    quote:
      "Edu-Kit bulanannya sangat membantu saya yang sibuk untuk tetap bisa memberikan aktivitas berkualitas di rumah.",
  },
  {
    key: "rina",
    name: "Bunda Rina",
    role: "Guru PAUD",
    quote:
      "Standar keamanannya luar biasa. Saya merasa tenang membiarkan anak bereksplorasi di Experience Store Marica.",
  },
  {
    key: "ani",
    name: "Bunda Ani",
    role: "Entrepreneur",
    quote:
      "Konsep phygital-nya keren banget. Anak belajar mandiri tapi tetap ada interaksi nyata.",
  },
];

const AUTOPLAY_INTERVAL = 4500;

export default function TestimonialSection() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();

  const [index, setIndex] = useState(0);
  const [cardStep, setCardStep] = useState(0);
  const [maxIndex, setMaxIndex] = useState(testimonials.length - 1);
  const [isPaused, setIsPaused] = useState(false);

  // Measure card width + gap responsively
  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      const viewport = viewportRef.current;
      if (!track || !viewport) return;
      const firstCard = track.children[0] as HTMLElement | undefined;
      if (!firstCard) return;

      const trackStyle = getComputedStyle(track);
      const gap = parseFloat(trackStyle.columnGap || trackStyle.gap || "0");
      const step = firstCard.offsetWidth + gap;
      setCardStep(step);

      const visibleCount = Math.max(1, Math.floor(viewport.offsetWidth / step));
      setMaxIndex(Math.max(0, testimonials.length - visibleCount));
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(next, 0), maxIndex);
      setIndex(clamped);
    },
    [maxIndex]
  );

  useEffect(() => {
    controls.start({
      x: -index * cardStep,
      transition: { type: "spring", stiffness: 320, damping: 34 },
    });
  }, [index, cardStep, controls]);

  // Autoplay
  useEffect(() => {
    if (isPaused || maxIndex === 0) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(id);
  }, [isPaused, maxIndex]);

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const { offset, velocity } = info;
    if (offset.x < -60 || velocity.x < -400) {
      goTo(index + 1);
    } else if (offset.x > 60 || velocity.x > 400) {
      goTo(index - 1);
    } else {
      controls.start({
        x: -index * cardStep,
        transition: { type: "spring", stiffness: 320, damping: 34 },
      });
    }
  };

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-marica-amber-dark via-marica-amber to-marica-amber px-6 py-20 lg:px-10 lg:py-28"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-white/10 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="font-display text-[1.7rem] font-semibold leading-tight text-marica-ink sm:text-3xl lg:text-[2.2rem]"
        >
          Apa Kata Bunda?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-3 max-w-md font-body text-sm leading-relaxed text-marica-ink/80 sm:text-base"
        >
          Cerita nyata dari para Bunda yang sudah tumbuh bersama Marica.
        </motion.p>
      </div>

      {/* Carousel */}
      <div className="relative z-10 mx-auto mt-12 max-w-6xl lg:mt-16">
        <div ref={viewportRef} className="overflow-hidden">
          <motion.div
            ref={trackRef}
            className="flex cursor-grab gap-5 active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: -maxIndex * cardStep, right: 0 }}
            dragElastic={0.12}
            animate={controls}
            onDragEnd={handleDragEnd}
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={t.key}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="relative w-[78%] shrink-0 select-none overflow-hidden rounded-[24px] bg-marica-cream p-6 shadow-[0_14px_35px_rgba(120,60,10,0.14)] transition-shadow hover:shadow-[0_20px_45px_rgba(120,60,10,0.22)] sm:w-[46%] lg:w-[24%]"
              >
                <Quote
                  className="pointer-events-none absolute -right-2 -top-2 h-16 w-16 text-marica-amber/25"
                  fill="currentColor"
                />

                <div className="relative flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-base font-semibold text-white ring-4 ring-white ${avatarColors[i % avatarColors.length]}`}
                  >
                    {t.name.replace("Bunda ", "")[0]}
                  </div>
                  <div className="leading-tight">
                    <p className="font-display text-[15px] font-semibold text-marica-ink">
                      {t.name}
                    </p>
                    <p className="font-body text-xs text-marica-ink-soft">
                      {t.role}
                    </p>
                  </div>
                </div>

                <div className="relative mt-4 flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <motion.span
                      key={si}
                      initial={{ opacity: 0, scale: 0.4 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ duration: 0.3, delay: i * 0.1 + 0.2 + si * 0.06 }}
                    >
                      <Star
                        className="h-4 w-4 text-marica-amber-dark"
                        fill="currentColor"
                      />
                    </motion.span>
                  ))}
                </div>

                <p className="relative mt-4 font-body text-sm italic leading-relaxed text-marica-ink-soft">
                  &quot;{t.quote}&quot;
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Arrows */}
        <button
          type="button"
          aria-label="Testimoni sebelumnya"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          className="absolute left-0 top-1/2 hidden -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full bg-white p-2.5 text-marica-ink shadow-lg transition hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 lg:flex"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Testimoni berikutnya"
          onClick={() => goTo(index + 1)}
          disabled={index >= maxIndex}
          className="absolute right-0 top-1/2 hidden translate-x-4 -translate-y-1/2 items-center justify-center rounded-full bg-white p-2.5 text-marica-ink shadow-lg transition hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 lg:flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Dots */}
      <div className="relative z-10 mt-6 flex items-center justify-center gap-2">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Ke slide ${i + 1}`}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === i ? "w-6 bg-marica-ink" : "w-2 bg-marica-ink/30"
            }`}
          />
        ))}
      </div>
    </section>
  );
}