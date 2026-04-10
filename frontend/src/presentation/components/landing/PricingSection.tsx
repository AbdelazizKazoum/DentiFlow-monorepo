"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Box,
  Container,
  Typography,
  Button,
  Divider,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { PRICING_PLANS } from "@/application/landing/landingMockData";
import { useScrollAnimation } from "@/infrastructure/hooks/useScrollAnimation";
import type { PricingPlan } from "@/domain/landing/types";

// ── Single pricing card ──────────────────────────────────────────
function PricingCard({ plan, index }: { plan: PricingPlan; index: number }) {
  const { ref, isInView } = useScrollAnimation(0.1);
  const t = useTranslations();

  const isHighlighted = plan.highlighted;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      whileHover={{ y: -8 }}
      className="h-full"
    >
      <Box
        className={`h-full flex flex-col p-8 rounded-2xl border-2 transition-colors duration-300 ${
          isHighlighted
            ? "bg-blue-600 border-blue-600 shadow-2xl shadow-blue-300/30 dark:shadow-blue-900/40"
            : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-lg"
        }`}
      >
        {/* Most popular badge */}
        {isHighlighted && (
          <Box className="mb-4">
            <Chip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              label={t("landing.pricing.most_popular" as any)}
              size="small"
              className="bg-white/20 text-white border-white/30 font-semibold"
              variant="outlined"
            />
          </Box>
        )}

        {/* Plan name */}
        <Typography
          variant="h5"
          className={`font-bold mb-1 ${isHighlighted ? "text-white" : "text-gray-900 dark:text-white"}`}
        >
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {t(plan.nameKey as any)}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          className={`mb-6 ${isHighlighted ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}
        >
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {t(plan.descriptionKey as any)}
        </Typography>

        {/* Price */}
        <Box className="mb-6">
          {plan.price !== null ? (
            <Box className="flex items-end gap-1">
              <Typography
                variant="h2"
                component="span"
                className={`font-extrabold leading-none ${isHighlighted ? "text-white" : "text-gray-900 dark:text-white"}`}
              >
                ${plan.price}
              </Typography>
              <Typography
                component="span"
                className={`mb-1.5 text-sm ${isHighlighted ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}
              >
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {t("landing.pricing.per_month" as any)}
              </Typography>
            </Box>
          ) : (
            <Typography
              variant="h3"
              className={`font-extrabold ${isHighlighted ? "text-white" : "text-gray-900 dark:text-white"}`}
            >
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {t("landing.pricing.custom" as any)}
            </Typography>
          )}
        </Box>

        <Divider
          className={
            isHighlighted
              ? "border-white/20 mb-6"
              : "border-gray-100 dark:border-gray-700 mb-6"
          }
        />

        {/* Feature list */}
        <Box className="flex flex-col gap-3 flex-1 mb-8">
          {plan.featuresKeys.map((fKey) => (
            <Box key={fKey} className="flex items-start gap-2.5">
              <CheckCircleIcon
                className={`shrink-0 mt-0.5 ${isHighlighted ? "text-blue-100" : "text-blue-500"}`}
                sx={{ fontSize: 18 }}
              />
              <Typography
                variant="body2"
                className={
                  isHighlighted
                    ? "text-blue-50"
                    : "text-gray-700 dark:text-gray-300"
                }
              >
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {t(fKey as any)}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* CTA */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant={isHighlighted ? "contained" : "outlined"}
            fullWidth
            size="large"
            className={
              isHighlighted
                ? "bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-semibold shadow-md"
                : "border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl font-semibold"
            }
            sx={{ py: 1.5 }}
          >
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {t(plan.ctaKey as any)}
          </Button>
        </motion.div>
      </Box>
    </motion.div>
  );
}

// ── Section ───────────────────────────────────────────────────────
export function PricingSection() {
  const t = useTranslations("landing.pricing");
  const { ref, isInView } = useScrollAnimation(0.1);

  return (
    <Box
      component="section"
      id="pricing"
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
            className="text-lg max-w-xl mx-auto text-gray-600 dark:text-gray-400"
          >
            {t("subtitle")}
          </Typography>
        </motion.div>

        {/* Cards */}
        <Box className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PRICING_PLANS.map((plan, index) => (
            <PricingCard key={plan.id} plan={plan} index={index} />
          ))}
        </Box>
      </Container>
    </Box>
  );
}
