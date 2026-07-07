import React from "react";
import {useTranslations} from "next-intl";
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
  const t = useTranslations("admin.patients.form");
  const common = useTranslations("admin.patients");
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
          title={t("personalInformation")}
          iconColor="#0f8aa3"
          iconBg="#eff6ff"
        />
        <div className="flex flex-col gap-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <TextField
              label={t("firstName")}
              fullWidth
              required
              value={form.firstName}
              onChange={inp("firstName")}
              sx={TF_SX}
              placeholder={t("firstNamePlaceholder")}
            />
            <TextField
              label={t("lastName")}
              fullWidth
              required
              value={form.lastName}
              onChange={inp("lastName")}
              sx={TF_SX}
              placeholder={t("lastNamePlaceholder")}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <TextField
              label={t("dateOfBirth")}
              type="date"
              fullWidth
              value={form.dateOfBirth}
              onChange={inp("dateOfBirth")}
              sx={TF_SX}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <FormControl fullWidth sx={TF_SX}>
              <InputLabel>{t("gender")}</InputLabel>
              <Select
                label={t("gender")}
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
                    {t("notSpecified")}
                  </em>
                </MenuItem>
                <MenuItem value={PatientGender.MALE}>{common("gender.MALE")}</MenuItem>
                <MenuItem value={PatientGender.FEMALE}>{common("gender.FEMALE")}</MenuItem>
                <MenuItem value={PatientGender.OTHER}>{common("gender.OTHER")}</MenuItem>
              </Select>
            </FormControl>
          </div>
          <TextField
            label={t("cnie")}
            fullWidth
            value={form.cnie}
            onChange={inp("cnie")}
            sx={TF_SX}
            placeholder={t("cniePlaceholder")}
          />
        </div>
      </div>

      <Divider sx={{ borderColor: "var(--border-ui)" }} />

      {/* Contact Details */}
      <div>
        <SectionHeader
          icon={<Phone />}
          title={t("contactDetails")}
          iconColor="#0891b2"
          iconBg="#ecfeff"
        />
        <div className="flex flex-col gap-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <TextField
              label={t("email")}
              type="email"
              fullWidth
              required
              value={form.email}
              onChange={inp("email")}
              sx={TF_SX}
              placeholder={t("emailPlaceholder")}
            />
            <TextField
              label={t("phone")}
              fullWidth
              value={form.phone}
              onChange={inp("phone")}
              sx={TF_SX}
              placeholder={t("phonePlaceholder")}
            />
          </div>
          <TextField
            label={t("address")}
            fullWidth
            value={form.address}
            onChange={inp("address")}
            sx={TF_SX}
            placeholder={t("addressPlaceholder")}
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
          title={t("patientStatus")}
          iconColor="#279C41"
          iconBg="#E8F8EC"
        />
        <FormControl fullWidth sx={TF_SX}>
          <InputLabel>{t("status")}</InputLabel>
          <Select
            label={t("status")}
            value={form.status}
            onChange={(e) =>
              onChange({ ...form, status: e.target.value as PatientStatus })
            }
          >
            <MenuItem value={PatientStatus.ACTIVE}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                {t("statusDescriptions.active")}
              </span>
            </MenuItem>
            <MenuItem value={PatientStatus.INACTIVE}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                {t("statusDescriptions.inactive")}
              </span>
            </MenuItem>
            <MenuItem value={PatientStatus.ARCHIVED}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                {t("statusDescriptions.archived")}
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
          title={t("medicalInformation")}
          iconColor="#dc2626"
          iconBg="#fff5f5"
        />
        <div className="flex flex-col gap-1">
          <TextField
            label={t("allergies")}
            fullWidth
            value={form.allergies}
            onChange={inp("allergies")}
            sx={{ ...TF_SX, mb: 2 }}
            placeholder={t("allergiesPlaceholder")}
            helperText={t("allergiesHelper")}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <TextField
              label={t("chronicConditions")}
              fullWidth
              value={form.chronicConditions}
              onChange={inp("chronicConditions")}
              sx={TF_SX}
              placeholder={t("chronicConditionsPlaceholder")}
            />
            <TextField
              label={t("currentMedications")}
              fullWidth
              value={form.currentMedications}
              onChange={inp("currentMedications")}
              sx={TF_SX}
              placeholder={t("currentMedicationsPlaceholder")}
            />
          </div>
          <TextField
            label={t("medicalNotes")}
            fullWidth
            multiline
            rows={3}
            value={form.medicalNotes}
            onChange={inp("medicalNotes")}
            sx={TF_SX}
            placeholder={t("medicalNotesPlaceholder")}
          />
        </div>
      </div>

      <Divider sx={{ borderColor: "var(--border-ui)" }} />

      {/* Administrative Notes */}
      <div>
        <SectionHeader
          icon={<FileText />}
          title={t("administrativeNotes")}
          iconColor="#7c3aed"
          iconBg="#f5f3ff"
        />
        <TextField
          label={t("notes")}
          fullWidth
          multiline
          rows={3}
          value={form.notes}
          onChange={inp("notes")}
          sx={TF_SX}
          placeholder={t("notesPlaceholder")}
        />
      </div>
    </div>
  );
}
