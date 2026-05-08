import React, { useRef, useState, useEffect } from "react";
import {
  Typography,
  Chip,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import { Shield, FolderOpen, FileText, Upload, X, Plus } from "lucide-react";
import { InsuranceTemplate } from "@/domain/patient/entities/insuranceTemplate";
import { DOC_TYPE_CONFIG, TF_SX } from "../../patientConfig";
import type { DocumentItemState } from "../../types";
import { DocumentType, outlinedBtnSx, primaryBtnSx } from "./SharedUI";

interface DocumentsSectionProps {
  open: boolean;
  documents: DocumentItemState[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentItemState[]>>;
  insuranceTemplates: InsuranceTemplate[];
}

export function DocumentsSection({
  open,
  documents,
  setDocuments,
  insuranceTemplates,
}: DocumentsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDocForm, setShowDocForm] = useState(false);
  const [docForm, setDocForm] = useState<{
    type: DocumentType;
    title: string;
    fileName: string;
    fileUrl: string;
  }>({ type: DocumentType.GENERAL, title: "", fileName: "", fileUrl: "" });

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setDocForm({
          type: DocumentType.GENERAL,
          title: "",
          fileName: "",
          fileUrl: "",
        });
        setShowDocForm(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleAddDocument = () => {
    if (!docForm.fileName && !docForm.fileUrl) return;
    setDocuments((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        type: docForm.type,
        fileUrl: docForm.fileUrl || docForm.fileName,
        title: docForm.title,
        createdAt: new Date().toISOString(),
      },
    ]);
    setDocForm({
      type: DocumentType.GENERAL,
      title: "",
      fileName: "",
      fileUrl: "",
    });
    setShowDocForm(false);
  };

  const handleRemoveDocument = (id: string) =>
    setDocuments((prev) => prev.filter((d) => d.id !== id));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file)
      setDocForm((f) => ({
        ...f,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
      }));
  };

  return (
    <div className="flex flex-col gap-3">
      {insuranceTemplates.length > 0 && (
        <div
          style={{
            borderRadius: 12,
            border: "1px solid var(--border-ui)",
            overflow: "hidden",
            marginBottom: 4,
          }}
        >
          <div
            style={{
              padding: "10px 14px",
              background: "linear-gradient(135deg, #ecfeff 0%, #e0f2fe 100%)",
              borderBottom: "1px solid var(--border-ui)",
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <Shield size={13} color="#0891b2" />
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#0891b2" }}>
              Insurance Templates
            </Typography>
            <Chip
              label={insuranceTemplates.length}
              size="small"
              sx={{
                ml: "auto",
                height: 20,
                fontSize: 10,
                fontWeight: 700,
                background: "#cffafe",
                color: "#0891b2",
              }}
            />
          </div>
          <div className="flex flex-col">
            {insuranceTemplates.map((tpl, idx) => (
              <div
                key={tpl.id}
                className="flex items-center gap-3 p-3"
                style={{
                  borderTop: idx > 0 ? "1px solid var(--border-ui)" : "none",
                  background: "var(--surface-card)",
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: "#e0f2fe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FileText size={14} color="#0891b2" />
                </div>
                <div className="flex-1 min-w-0">
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--foreground)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tpl.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: "var(--text-placeholder)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tpl.getFileName()}
                  </Typography>
                </div>
                <Button
                  component="a"
                  href={tpl.fileUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  variant="outlined"
                  startIcon={<Upload size={11} />}
                  sx={{
                    ...outlinedBtnSx,
                    padding: "4px 12px",
                    fontSize: "0.75rem",
                    flexShrink: 0,
                  }}
                >
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {documents.length === 0 && !showDocForm && (
        <div
          style={{
            textAlign: "center",
            padding: "28px 16px",
            borderRadius: 12,
            border: "1px dashed var(--border-ui)",
            background: "var(--surface-page)",
          }}
        >
          <FolderOpen
            size={28}
            color="var(--text-placeholder)"
            style={{ margin: "0 auto 8px" }}
          />
          <Typography
            sx={{
              fontSize: 13,
              color: "var(--text-placeholder)",
              fontWeight: 500,
            }}
          >
            No documents uploaded yet
          </Typography>
        </div>
      )}

      {documents.length > 0 && (
        <div className="flex flex-col gap-2">
          {documents.map((doc) => {
            const dtCfg =
              DOC_TYPE_CONFIG[doc.type as keyof typeof DOC_TYPE_CONFIG];
            return (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3"
                style={{
                  borderRadius: 10,
                  border: "1px solid var(--border-ui)",
                  background: "var(--surface-page)",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: dtCfg?.bg ?? "#f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FileText size={15} color={dtCfg?.color ?? "#64748b"} />
                </div>
                <div className="flex-1 min-w-0">
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--foreground)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {doc.title || doc.fileUrl.split("/").pop() || "Document"}
                  </Typography>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Chip
                      label={dtCfg?.label ?? doc.type}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: 10,
                        fontWeight: 700,
                        background: dtCfg?.bg ?? "#f1f5f9",
                        color: dtCfg?.color ?? "#64748b",
                      }}
                    />
                    <Typography
                      sx={{ fontSize: 10, color: "var(--text-placeholder)" }}
                    >
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </Typography>
                  </div>
                </div>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveDocument(doc.id)}
                  sx={{
                    color: "var(--text-placeholder)",
                    "&:hover": { color: "#dc2626", background: "#fef2f2" },
                  }}
                >
                  <X size={14} />
                </IconButton>
              </div>
            );
          })}
        </div>
      )}

      {showDocForm ? (
        <div
          style={{
            border: "1px solid var(--border-ui)",
            borderRadius: 12,
            padding: 16,
            background: "var(--surface-page)",
          }}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormControl fullWidth sx={TF_SX}>
              <InputLabel>Document Type</InputLabel>
              <Select
                label="Document Type"
                value={docForm.type}
                onChange={(e) =>
                  setDocForm((f) => ({
                    ...f,
                    type: e.target.value as DocumentType,
                  }))
                }
              >
                {Object.values(DocumentType).map((t) => (
                  <MenuItem key={t} value={t} sx={{ fontSize: "0.875rem" }}>
                    <span className="flex items-center gap-2">
                      <span
                        style={{
                          display: "inline-block",
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background:
                            DOC_TYPE_CONFIG[t as keyof typeof DOC_TYPE_CONFIG]
                              ?.color ?? "#64748b",
                          flexShrink: 0,
                        }}
                      />
                      {DOC_TYPE_CONFIG[t as keyof typeof DOC_TYPE_CONFIG]
                        ?.label ?? t}
                    </span>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Title (optional)"
              fullWidth
              value={docForm.title}
              onChange={(e) =>
                setDocForm((f) => ({ ...f, title: e.target.value }))
              }
              sx={TF_SX}
              placeholder="e.g. Insurance Card"
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: "none" }}
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: "100%",
              padding: "22px 16px",
              borderRadius: 10,
              border: `2px dashed ${
                docForm.fileName ? "var(--brand-primary)" : "var(--border-ui)"
              }`,
              background: docForm.fileName ? "#eff6ff" : "var(--surface-card)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              transition: "all 0.15s",
            }}
          >
            <Upload
              size={22}
              color={
                docForm.fileName
                  ? "var(--brand-primary)"
                  : "var(--text-placeholder)"
              }
            />
            {docForm.fileName ? (
              <>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--brand-primary)",
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {docForm.fileName}
                </Typography>
                <Typography sx={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Click to change file
                </Typography>
              </>
            ) : (
              <>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--foreground)",
                  }}
                >
                  Click to upload a file
                </Typography>
                <Typography sx={{ fontSize: 11, color: "var(--text-muted)" }}>
                  PDF, JPG, PNG, DOC — up to 10 MB
                </Typography>
              </>
            )}
          </button>
          <div className="flex justify-end gap-2">
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setShowDocForm(false);
                setDocForm({
                  type: DocumentType.GENERAL,
                  title: "",
                  fileName: "",
                  fileUrl: "",
                });
              }}
              sx={outlinedBtnSx}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              disabled={!docForm.fileName && !docForm.fileUrl}
              onClick={handleAddDocument}
              startIcon={<Upload size={13} />}
              sx={primaryBtnSx}
            >
              Upload Document
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outlined"
          fullWidth
          onClick={() => setShowDocForm(true)}
          startIcon={<Plus size={14} />}
          sx={{
            ...outlinedBtnSx,
            borderStyle: "dashed",
            padding: "10px 14px",
            color: "var(--text-muted)",
            "&:hover": {
              borderColor: "var(--brand-primary)",
              color: "var(--brand-primary)",
              background: "#eff6ff",
            },
          }}
        >
          Add Document
        </Button>
      )}
    </div>
  );
}
