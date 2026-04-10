"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Box, Container, Typography, Paper } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import BarChartIcon from "@mui/icons-material/BarChart";
import SecurityIcon from "@mui/icons-material/Security";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { type SvgIconComponent } from "@mui/icons-material";

import { FEATURES } from "@/application/landing/landingMockData";
import { useScrollAnimation } from "@/infrastructure/hooks/useScrollAnimation";
import type { Feature } from "@/domain/landing/types";

// ── Icon registry ────────────────────────────────────────────────
const ICON_MAP: Record<string, SvgIconComponent> = {
  CalendarMonth: CalendarMonthIcon,
  People: PeopleIcon,
  Receipt: ReceiptIcon,
  BarChart: BarChartIcon,
  Security: SecurityIcon,
  NotificationsActive: NotificationsActiveIcon,
};

// ── Feature card ─────────────────────────────────────────────────
function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = useTranslations("landing.features.items" as any);
  const { ref, isInView } = useScrollAnimation();
  const IconComponent = ICON_MAP[feature.icon];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="h-full"
    >
      <motion.div
        whileHover={{ y: -6, scale: 1.02 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="h-full"
      >
        <Paper
          elevation={0}
          className="p-7 h-full rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col gap-4 cursor-default hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-xl transition-all duration-300"
        >
          {/* Icon container */}
          <Box className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            {IconComponent && (
              <IconComponent
                className="text-blue-600 dark:text-blue-400"
                sx={{ fontSize: 24 }}
              />
            )}
          </Box>
          <Typography
            variant="h6"
            className="font-semibold text-gray-900 dark:text-white leading-snug"
          >
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {t(`${feature.id}.title` as any)}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            className="leading-relaxed text-gray-600 dark:text-gray-400"
          >
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {t(`${feature.id}.description` as any)}
          </Typography>
        </Paper>
      </motion.div>
    </motion.div>
  );
}

// ── Section ───────────────────────────────────────────────────────
export function FeaturesSection() {
  const t = useTranslations("landing.features");
  const { ref, isInView } = useScrollAnimation(0.1);

  return (
    <Box
      component="section"
      id="features"
      className="py-24 bg-gray-50 dark:bg-gray-900"
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
            className="text-lg max-w-2xl mx-auto text-gray-600 dark:text-gray-400"
          >
            {t("subtitle")}
          </Typography>
        </motion.div>

        {/* Cards grid */}
        <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </Box>
      </Container>
    </Box>
  );
}
