import React from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Divider,
} from "@mui/material";
import { User, Phone, MapPin, Activity, Heart, FileText } from "lucide-react";
import { PatientStatus, PatientGender } from "@/domain/patient/entities/patient";
import { TF_SX } from "../../patientConfig";
import type { PatientFormState } from "../../types";
import { SectionHeader } from "./SharedUI";

interface PatientRecordSectionProps {
  form: PatientFormState;
  onChange: (form: PatientFormState) => void;
}

export function PatientRecordSection({ form, onChange }: PatientRecordSectionProps) {
  const inp =
    (field: keyof PatientFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...form, [field]: e.target.value });

  return (
    <div className="flex flex-col gap-4">
      {/* Personal Information */}
      <div>
        <SectionHeader
          icon={<User />}
          title="Personal Information"
          iconColor="#0f8aa3"
          iconBg="#eff6ff"
        />
        <div className="flex flex-col gap-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <TextField
              label="First Name"
              fullWidth
              required
              value={form.firstName}
              onChange={inp("firstName")}
              sx={TF_SX}
              placeholder="e.g. Fatima"
            />
            <TextField
              label="Last Name"
              fullWidth
              required
              value={form.lastName}
              onChange={inp("lastName")}
              sx={TF_SX}
              placeholder="e.g. Benali"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <TextField
              label="Date of Birth"
              type="date"
              fullWidth
              value={form.dateOfBirth}
              onChange={inp("dateOfBirth")}
              sx={TF_SX}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <FormControl fullWidth sx={TF_SX}>
              <InputLabel>Gender</InputLabel>
              <Select
                label="Gender"
                value={form.gender}
                onChange={(e) =>
                  onChange({
                    ...form,
                    gender: e.target.value as PatientGender | "",
                  })
                }
              >
                <MenuItem value="">
                  <em style={{ fontSize: 14, color: "var(--text-placeholder)" }}>
                    Not specified
                  </em>
                </MenuItem>
                <MenuItem value={PatientGender.MALE}>Male</MenuItem>
                <MenuItem value={PatientGender.FEMALE}>Female</MenuItem>
                <MenuItem value={PatientGender.OTHER}>Other</MenuItem>
              </Select>
            </FormControl>
          </div>
          <TextField
            label="CNIE (National Identity Number)"
            fullWidth
            value={form.cnie}
            onChange={inp("cnie")}
            sx={TF_SX}
            placeholder="e.g. MR-12345"
          />
        </div>
      </div>

      <Divider sx={{ borderColor: "var(--border-ui)" }} />

      {/* Contact Details */}
      <div>
        <SectionHeader
          icon={<Phone />}
          title="Contact Details"
          iconColor="#0891b2"
          iconBg="#ecfeff"
        />
        <div className="flex flex-col gap-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              value={form.email}
              onChange={inp("email")}
              sx={TF_SX}
              placeholder="e.g. fatima@email.com"
            />
            <TextField
              label="Phone Number"
              fullWidth
              value={form.phone}
              onChange={inp("phone")}
              sx={TF_SX}
              placeholder="+212 6XX-XXXXXX"
            />
          </div>
          <TextField
            label="Address"
            fullWidth
            value={form.address}
            onChange={inp("address")}
            sx={TF_SX}
            placeholder="Street, City, Postal Code"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <MapPin size={14} color="var(--text-placeholder)" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </div>
      </div>

      <Divider sx={{ borderColor: "var(--border-ui)" }} />

      {/* Patient Status */}
      <div>
        <SectionHeader
          icon={<Activity />}
          title="Patient Status"
          iconColor="#279C41"
          iconBg="#E8F8EC"
        />
        <FormControl fullWidth sx={TF_SX}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={form.status}
            onChange={(e) =>
              onChange({ ...form, status: e.target.value as PatientStatus })
            }
          >
            <MenuItem value={PatientStatus.ACTIVE}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Active — Currently receiving care
              </span>
            </MenuItem>
            <MenuItem value={PatientStatus.INACTIVE}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                Inactive — Temporarily inactive
              </span>
            </MenuItem>
            <MenuItem value={PatientStatus.ARCHIVED}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                Archived — Record archived
              </span>
            </MenuItem>
          </Select>
        </FormControl>
      </div>

      <Divider sx={{ borderColor: "var(--border-ui)" }} />

      {/* Medical Information */}
      <div>
        <SectionHeader
          icon={<Heart />}
          title="Medical Information"
          iconColor="#dc2626"
          iconBg="#fff5f5"
        />
        <div className="flex flex-col gap-1">
          <TextField
            label="Known Allergies"
            fullWidth
            value={form.allergies}
            onChange={inp("allergies")}
            sx={{ ...TF_SX, mb: 2 }}
            placeholder="e.g. Penicillin, Latex, Aspirin"
            helperText="List all known allergies, separated by commas"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <TextField
              label="Chronic Conditions"
              fullWidth
              value={form.chronicConditions}
              onChange={inp("chronicConditions")}
              sx={TF_SX}
              placeholder="e.g. Diabetes Type 2"
            />
            <TextField
              label="Current Medications"
              fullWidth
              value={form.currentMedications}
              onChange={inp("currentMedications")}
              sx={TF_SX}
              placeholder="e.g. Metformin 500mg"
            />
          </div>
          <TextField
            label="Medical Notes"
            fullWidth
            multiline
            rows={3}
            value={form.medicalNotes}
            onChange={inp("medicalNotes")}
            sx={TF_SX}
            placeholder="Additional medical notes from doctors..."
          />
        </div>
      </div>

      <Divider sx={{ borderColor: "var(--border-ui)" }} />

      {/* Administrative Notes */}
      <div>
        <SectionHeader
          icon={<FileText />}
          title="Administrative Notes"
          iconColor="#7c3aed"
          iconBg="#f5f3ff"
        />
        <TextField
          label="Notes"
          fullWidth
          multiline
          rows={3}
          value={form.notes}
          onChange={inp("notes")}
          sx={TF_SX}
          placeholder="Administrative notes (non-medical)..."
        />
      </div>
    </div>
  );
}
