"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Box, Container, Typography, Button, Chip } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PeopleIcon from "@mui/icons-material/People";

// ── Mock stats for the hero mockup card ──────────────────────────
const HERO_STATS = [
  { label: "Appointments Today", value: "48", delta: "+12%" },
  { label: "Active Patients", value: "1,284", delta: "+5%" },
  { label: "Avg. Wait Time", value: "6 min", delta: "-18%" },
];

export function HeroSection() {
  const t = useTranslations("landing.hero");

  return (
    <Box
      component="section"
      className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950"
    >
      {/* ── Animated background blobs ──────────────────────────── */}
      <motion.div
        className="absolute -top-24 -start-24 w-96 h-96 bg-blue-200/50 dark:bg-blue-700/20 rounded-full blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.15, 1], rotate: [0, 25, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-16 -end-16 w-[28rem] h-[28rem] bg-indigo-200/40 dark:bg-indigo-700/20 rounded-full blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.2, 1], rotate: [0, -20, 0] }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      <motion.div
        className="absolute top-1/2 start-1/3 w-64 h-64 bg-cyan-100/40 dark:bg-cyan-900/20 rounded-full blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <Container maxWidth="lg" className="relative z-10 py-20 md:py-28">
        <Box className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* ── Left: Text content ──────────────────────────────── */}
          <Box className="flex flex-col gap-6">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Chip
                label={t("badge")}
                size="small"
                icon={<CalendarMonthIcon style={{ fontSize: 16 }} />}
                className="self-start text-blue-700 border-blue-300 bg-blue-50 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700 font-medium"
                variant="outlined"
              />
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Typography
                variant="h1"
                component="h1"
                className="font-extrabold text-4xl sm:text-5xl md:text-6xl leading-tight text-gray-900 dark:text-white"
              >
                {t("headline")}
              </Typography>
            </motion.div>

            {/* Subheadline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography
                variant="h6"
                component="p"
                className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed font-normal max-w-lg"
              >
                {t("subheadline")}
              </Typography>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-col gap-2"
            >
              {["HIPAA Compliant", "No setup fee", "Cancel anytime"].map(
                (item) => (
                  <Box key={item} className="flex items-center gap-2">
                    <CheckCircleIcon
                      className="text-green-500"
                      sx={{ fontSize: 18 }}
                    />
                    <Typography
                      variant="body2"
                      className="text-gray-600 dark:text-gray-400"
                    >
                      {item}
                    </Typography>
                  </Box>
                ),
              )}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex flex-wrap gap-4 mt-2"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl font-semibold shadow-lg shadow-blue-200 dark:shadow-blue-900/50"
                  sx={{ py: 1.5 }}
                >
                  {t("cta_primary")}
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  variant="outlined"
                  size="large"
                  className="border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400 px-8 rounded-xl font-semibold"
                  sx={{ py: 1.5 }}
                >
                  {t("cta_secondary")}
                </Button>
              </motion.div>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex items-center gap-3 mt-2"
            >
              <Box className="flex -space-x-2">
                {["#3b82f6", "#6366f1", "#10b981", "#f59e0b"].map(
                  (color, i) => (
                    <Box
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: color, zIndex: 4 - i }}
                    >
                      <PeopleIcon sx={{ fontSize: 14 }} />
                    </Box>
                  ),
                )}
              </Box>
              <Typography
                variant="body2"
                className="text-gray-600 dark:text-gray-400"
              >
                <span className="font-semibold text-gray-900 dark:text-white">
                  500+
                </span>{" "}
                clinics already on board
              </Typography>
            </motion.div>
          </Box>

          {/* ── Right: Mockup dashboard card ───────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="hidden lg:block"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Box className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* Card header */}
                <Box className="bg-blue-600 px-6 py-4 flex items-center gap-3">
                  <Box className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                    DF
                  </Box>
                  <Typography className="text-white font-semibold">
                    DentiFlow Dashboard
                  </Typography>
                  <Box className="ms-auto flex gap-1.5">
                    {["bg-red-400", "bg-yellow-400", "bg-green-400"].map(
                      (c) => (
                        <div
                          key={c}
                          className={`w-3 h-3 rounded-full ${c} opacity-80`}
                        />
                      ),
                    )}
                  </Box>
                </Box>

                {/* Stats grid */}
                <Box className="grid grid-cols-3 gap-px bg-gray-100 dark:bg-gray-700">
                  {HERO_STATS.map((stat) => (
                    <Box
                      key={stat.label}
                      className="bg-white dark:bg-gray-800 px-4 py-5 flex flex-col gap-1"
                    >
                      <Typography
                        variant="caption"
                        className="text-gray-500 dark:text-gray-400 text-xs"
                      >
                        {stat.label}
                      </Typography>
                      <Typography className="font-bold text-xl text-gray-900 dark:text-white">
                        {stat.value}
                      </Typography>
                      <Typography
                        variant="caption"
                        className={`text-xs font-medium ${stat.delta.startsWith("+") ? "text-green-500" : "text-red-500"}`}
                      >
                        {stat.delta}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Appointment list preview */}
                <Box className="p-6 flex flex-col gap-3">
                  <Typography
                    variant="caption"
                    className="text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide text-xs"
                  >
                    Upcoming Appointments
                  </Typography>
                  {[
                    {
                      time: "09:00",
                      name: "Emma Wilson",
                      type: "Checkup",
                      color: "bg-blue-100 text-blue-700",
                    },
                    {
                      time: "10:30",
                      name: "Carlos Rivera",
                      type: "Cleaning",
                      color: "bg-green-100 text-green-700",
                    },
                    {
                      time: "11:15",
                      name: "Aisha Patel",
                      type: "X-Ray",
                      color: "bg-purple-100 text-purple-700",
                    },
                  ].map((appt) => (
                    <Box
                      key={appt.time}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50"
                    >
                      <Typography
                        variant="caption"
                        className="text-gray-500 dark:text-gray-400 font-mono w-10 shrink-0"
                      >
                        {appt.time}
                      </Typography>
                      <Typography
                        variant="body2"
                        className="font-medium text-gray-900 dark:text-white flex-1"
                      >
                        {appt.name}
                      </Typography>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${appt.color}`}
                      >
                        {appt.type}
                      </span>
                    </Box>
                  ))}
                </Box>
              </Box>
            </motion.div>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}
