"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState, useEffect, useCallback } from "react";
import { Box, Container, Typography, IconButton, Avatar } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";

import { TESTIMONIALS } from "@/application/landing/landingMockData";
import { useScrollAnimation } from "@/infrastructure/hooks/useScrollAnimation";

const AUTOPLAY_INTERVAL = 5000;

const AVATAR_COLORS = ["#3b82f6", "#6366f1", "#10b981", "#f59e0b"];

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 260 : -260,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -260 : 260,
    opacity: 0,
    scale: 0.96,
  }),
};

export function TestimonialsSection() {
  const t = useTranslations("landing.testimonials");
  const { ref, isInView } = useScrollAnimation(0.1);

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
  }, []);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrent(
      (prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length,
    );
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
    },
    [current],
  );

  // Auto-play
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(goNext, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [goNext, isPaused]);

  const testimonial = TESTIMONIALS[current];

  return (
    <Box
      component="section"
      id="testimonials"
      className="py-24 bg-white dark:bg-gray-800"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Container maxWidth="lg">
        {/* Heading */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Typography
            variant="h2"
            className="font-bold text-3xl md:text-4xl text-gray-900 dark:text-white mb-4"
          >
            {t("title")}
          </Typography>
          <Typography
            color="text.secondary"
            className="text-lg text-gray-600 dark:text-gray-400"
          >
            {t("subtitle")}
          </Typography>
        </motion.div>

        {/* Carousel */}
        <Box className="relative flex items-center justify-center gap-4">
          {/* Prev button */}
          <IconButton
            onClick={goPrev}
            aria-label="Previous testimonial"
            className="shrink-0 bg-white dark:bg-gray-700 shadow-md hover:bg-blue-50 dark:hover:bg-gray-600 border border-gray-100 dark:border-gray-600 z-10"
            sx={{ width: 44, height: 44 }}
          >
            <ChevronLeftIcon />
          </IconButton>

          {/* Slide viewport */}
          <Box className="overflow-hidden flex-1 max-w-2xl">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              >
                <Box className="p-8 md:p-10 rounded-2xl bg-blue-50 dark:bg-gray-700 relative overflow-hidden">
                  {/* Quote decoration */}
                  <FormatQuoteIcon
                    className="absolute top-4 start-4 text-blue-200 dark:text-blue-800 opacity-60"
                    sx={{ fontSize: 56 }}
                  />

                  {/* Star rating */}
                  <Box className="flex gap-0.5 mb-5">
                    {Array.from({ length: 5 }).map((_, i) =>
                      i < testimonial.rating ? (
                        <StarIcon
                          key={i}
                          className="text-yellow-400"
                          sx={{ fontSize: 20 }}
                        />
                      ) : (
                        <StarBorderIcon
                          key={i}
                          className="text-gray-300 dark:text-gray-500"
                          sx={{ fontSize: 20 }}
                        />
                      ),
                    )}
                  </Box>

                  {/* Content */}
                  <Typography
                    variant="body1"
                    className="text-gray-700 dark:text-gray-200 text-lg italic leading-relaxed mb-8 relative z-10"
                  >
                    &ldquo;{testimonial.content}&rdquo;
                  </Typography>

                  {/* Author */}
                  <Box className="flex items-center gap-4">
                    <Avatar
                      style={{
                        backgroundColor:
                          AVATAR_COLORS[parseInt(testimonial.id) - 1] ??
                          AVATAR_COLORS[0],
                      }}
                      className="font-bold text-sm w-12 h-12 shrink-0"
                      sx={{ width: 48, height: 48 }}
                    >
                      {testimonial.initials}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        className="font-semibold text-gray-900 dark:text-white leading-tight"
                      >
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role} · {testimonial.clinic}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            </AnimatePresence>
          </Box>

          {/* Next button */}
          <IconButton
            onClick={goNext}
            aria-label="Next testimonial"
            className="shrink-0 bg-white dark:bg-gray-700 shadow-md hover:bg-blue-50 dark:hover:bg-gray-600 border border-gray-100 dark:border-gray-600 z-10"
            sx={{ width: 44, height: 44 }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {/* Dot indicators */}
        <Box
          className="flex justify-center gap-2 mt-8"
          role="tablist"
          aria-label="Testimonial navigation"
        >
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={`Go to testimonial ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                i === current
                  ? "bg-blue-600 w-6"
                  : "bg-gray-300 dark:bg-gray-600 w-2 hover:bg-gray-400 dark:hover:bg-gray-500"
              }`}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
}
