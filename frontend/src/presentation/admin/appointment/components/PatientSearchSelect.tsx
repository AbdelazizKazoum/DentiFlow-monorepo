"use client";

import { useState, useEffect, useMemo } from "react";
import { Autocomplete, TextField, Avatar, Box } from "@mui/material";
import { Search, Phone, User, CheckCircle2, Plus } from "lucide-react";
import { useAppointmentStore } from "@/presentation/stores/appointmentStore";
import type { Patient } from "@/domain/patient/entities/patient";
import { TF_SX, AVATAR_COLORS } from "../../patient/patientConfig";

interface PatientSearchSelectProps {
  value: string;
  onChange: (patientName: string, patientId?: string, patientPhone?: string) => void;
  error?: boolean;
  helperText?: string;
}

// Deterministic color from name so the same patient always gets the same color
function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

// Highlight matching characters in the text
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            style={{
              background: "#dbeafe",
              color: "#1d4ed8",
              borderRadius: 2,
              padding: "0 1px",
              fontWeight: 600,
            }}
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

// Sentinel that represents "use the typed text as a new patient"
const NEW_PATIENT_SENTINEL = "__NEW_PATIENT__";

export function PatientSearchSelect({
  value,
  onChange,
  error,
  helperText,
}: PatientSearchSelectProps) {
  const { searchResults, isSearchingPatients, searchPatients } = useAppointmentStore();
  const [inputValue, setInputValue] = useState(value);
  const [open, setOpen] = useState(false);

  // Debounced search
  useEffect(() => {
    if (inputValue.trim().length >= 2) {
      const id = setTimeout(() => searchPatients(inputValue), 300);
      return () => clearTimeout(id);
    }
  }, [inputValue, searchPatients]);

  useEffect(() => { setInputValue(value); }, [value]);

  const options = useMemo<(Patient | typeof NEW_PATIENT_SENTINEL)[]>(() => {
    if (inputValue.trim().length < 2) return [];
    return [...searchResults, NEW_PATIENT_SENTINEL];
  }, [searchResults, inputValue]);

  const handleInputChange = (_: unknown, val: string) => setInputValue(val);

  const handleChange = (_: unknown, picked: Patient | string | null) => {
    if (!picked || picked === NEW_PATIENT_SENTINEL) {
      onChange(inputValue.trim());
    } else if (typeof picked === "string") {
      onChange(picked);
    } else {
      onChange(picked.fullName, picked.id, picked.phone);
    }
  };

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      getOptionLabel={(opt) =>
        opt === NEW_PATIENT_SENTINEL || typeof opt === "string" ? inputValue : opt.fullName
      }
      isOptionEqualToValue={(opt, val) => {
        if (opt === NEW_PATIENT_SENTINEL || val === NEW_PATIENT_SENTINEL) return false;
        if (typeof opt === "string" || typeof val === "string") return opt === val;
        return opt.id === val.id;
      }}
      filterOptions={(x) => x} // server-side search — no client filter
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleChange}
      loading={isSearchingPatients}
      freeSolo
      clearOnBlur={false}
      slotProps={{
        popper: {
          sx: {
            "& .MuiPaper-root": {
              borderRadius: "12px",
              boxShadow:
                "0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 30px -5px rgba(0,0,0,0.12)",
              border: "1px solid var(--border-ui)",
              overflow: "hidden",
              mt: 0.5,
            },
            "& .MuiAutocomplete-listbox": { p: 0 },
            "& .MuiAutocomplete-loading": {
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              py: 2,
              textAlign: "center",
            },
          },
        },
      }}
      renderInput={(params) => {
        // Must merge our slotProps INTO the params ones — overwriting loses Autocomplete's inputRef
        const existingSlotProps = (params.slotProps ?? {}) as Record<string, unknown>;
        const existingInputSlot = (existingSlotProps.input ?? {}) as Record<string, unknown>;
        return (
          <TextField
            {...params}
            label="Patient"
            placeholder="Search by name or phone…"
            error={error}
            helperText={helperText}
            sx={{
              ...TF_SX,
              "& .MuiInputBase-input::placeholder": { color: "var(--text-placeholder)", opacity: 1 },
            }}
            slotProps={{
              ...existingSlotProps,
              input: {
                ...existingInputSlot,
                startAdornment: (
                  <Search
                    size={15}
                    style={{ color: "var(--text-muted)", marginRight: 6, flexShrink: 0 }}
                  />
                ),
              },
            }}
          />
        );
      }}
      renderOption={(props, option) => {
        const { key: _key, ...rest } = props as { key: React.Key } & React.HTMLAttributes<HTMLLIElement>;

        /* ── "Add as new patient" row ── */
        if (option === NEW_PATIENT_SENTINEL) {
          return (
            <li
              key="__new_patient__"
              {...rest}
              style={{
                padding: "10px 14px",
                borderTop: "1px solid var(--border-ui)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                background: "transparent",
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: "1.5px dashed #94a3b8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Plus size={14} color="#64748b" />
              </span>
              <span style={{ fontSize: "0.82rem", color: "#1d4ed8", fontWeight: 500 }}>
                Continue as &ldquo;
                <strong style={{ fontWeight: 700 }}>{inputValue.trim()}</strong>
                &rdquo; &mdash; new patient
              </span>
            </li>
          );
        }

        /* ── Existing patient row ── */
        const patient = option as Patient;
        const color = avatarColor(patient.fullName);

        return (
          <li
            key={patient.id}
            {...rest}
            style={{ padding: 0 }}
          >

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                px: "14px",
                py: "10px",
                width: "100%",
                "&:hover": { background: "#f8fafc" },
                cursor: "pointer",
              }}
            >
              {/* Avatar */}
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  bgcolor: `${color}22`,
                  color,
                  border: `1.5px solid ${color}44`,
                  flexShrink: 0,
                }}
              >
                {initials(patient.fullName)}
              </Avatar>

              {/* Name + details */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* Row 1: name */}
                <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--foreground)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <HighlightMatch text={patient.fullName} query={inputValue} />
                  </span>
                </Box>

                {/* Row 2: phone */}
                {patient.phone && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      mt: "2px",
                    }}
                  >
                    <Phone size={11} color="#94a3b8" />
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        letterSpacing: "0.01em",
                      }}
                    >
                      <HighlightMatch text={patient.phone} query={inputValue} />
                    </span>
                  </Box>
                )}
              </Box>

              {/* Check icon if already selected */}
              {value === patient.fullName && (
                <CheckCircle2 size={16} color="#1d4ed8" style={{ flexShrink: 0 }} />
              )}
            </Box>
          </li>
        );
      }}
      noOptionsText={
        inputValue.trim().length >= 2 && !isSearchingPatients ? (
          <Box
            sx={{
              py: "18px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <User size={22} color="#cbd5e1" />
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
              No patients found
            </span>
            <span style={{ fontSize: "0.73rem", color: "#94a3b8" }}>
              You can enter a name and continue as a new patient
            </span>
          </Box>
        ) : (
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Type at least 2 characters to search
          </span>
        )
      }
    />
  );
}