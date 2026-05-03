import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Typography,
  InputAdornment,
} from "@mui/material";
import {X, Eye, EyeOff} from "lucide-react";
import {useState} from "react";
import {StaffRole, StaffStatus} from "@/domain/staff/entities/staff";
import type {StaffFormState} from "../hooks/useStaffPage";

interface StaffFormModalProps {
  open: boolean;
  onClose: () => void;
  form: StaffFormState;
  onFormChange: (form: StaffFormState) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  error: string;
}

export function StaffFormModal({
  open,
  onClose,
  form,
  onFormChange,
  onSave,
  onDelete,
  error,
}: StaffFormModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "16px",
            boxShadow:
              "0 20px 40px -10px rgba(0,0,0,0.15), 0 10px 20px -15px rgba(0,0,0,0.1)",
            border: "1px solid var(--border-ui)",
            backgroundColor: "var(--surface-card)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: "20px 24px",
          borderBottom: "1px solid var(--border-ui)",
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{fontWeight: 700, color: "var(--foreground)"}}
        >
          {form.id ? "Edit Staff Member" : "Add Staff Member"}
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{color: "var(--text-muted)"}}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: "24px",
          "& .MuiTextField-root": {mb: "16px"},
          "& .MuiInputLabel-root": {fontSize: "0.875rem"},
          "& .MuiInputBase-input": {fontSize: "0.875rem"},
        }}
      >
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1 pt-2">
          {/* First Name & Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <TextField
              label="First Name"
              fullWidth
              value={form.firstName}
              onChange={(e) =>
                onFormChange({...form, firstName: e.target.value})
              }
              placeholder="e.g. Jane"
              required
            />
            <TextField
              label="Last Name"
              fullWidth
              value={form.lastName}
              onChange={(e) =>
                onFormChange({...form, lastName: e.target.value})
              }
              placeholder="e.g. Doe"
              required
            />
          </div>

          {/* Role & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                value={form.role}
                onChange={(e) =>
                  onFormChange({...form, role: e.target.value as StaffRole})
                }
              >
                <MenuItem value={StaffRole.DOCTOR}>Doctor</MenuItem>
                <MenuItem value={StaffRole.SECRETARY}>Secretary</MenuItem>
                <MenuItem value={StaffRole.DENTAL_ASSISTANT}>
                  Dental Assistant
                </MenuItem>
                <MenuItem value={StaffRole.ADMIN}>Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={form.status}
                onChange={(e) =>
                  onFormChange({...form, status: e.target.value as StaffStatus})
                }
              >
                <MenuItem value={StaffStatus.ACTIVE}>✅ Active</MenuItem>
                <MenuItem value={StaffStatus.ON_LEAVE}>🟡 On Leave</MenuItem>
                <MenuItem value={StaffStatus.INACTIVE}>⚫ Inactive</MenuItem>
              </Select>
            </FormControl>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={form.email}
              onChange={(e) => onFormChange({...form, email: e.target.value})}
              placeholder="e.g. jane@dentiflow.com"
              required
            />
            <TextField
              label="Phone"
              fullWidth
              value={form.phone}
              onChange={(e) => onFormChange({...form, phone: e.target.value})}
              placeholder="e.g. 555-0201"
            />
          </div>

          {/* Specialization & Join Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <TextField
              label="Specialization"
              fullWidth
              value={form.specialization}
              onChange={(e) =>
                onFormChange({...form, specialization: e.target.value})
              }
              placeholder="e.g. Orthodontics"
            />
            <TextField
              label="Join Date"
              type="date"
              fullWidth
              value={form.createdAt}
              onChange={(e) =>
                onFormChange({...form, createdAt: e.target.value})
              }
              slotProps={{inputLabel: {shrink: true}}}
            />
          </div>

          {/* Password */}
          <div
            className="border rounded-xl p-4 mt-1 mb-2 space-y-3"
            style={{borderColor: "var(--border-ui)"}}
          >
            <p className="text-xs font-semibold" style={{color: "var(--text-muted)"}}>
              {form.id
                ? "Change Password — leave blank to keep existing"
                : "Account Password"}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label={form.id ? "New Password" : "Password"}
                fullWidth
                required={!form.id}
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) =>
                  onFormChange({...form, password: e.target.value})
                }
                placeholder="Min. 8 characters"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword((v) => !v)}
                          edge="end"
                          sx={{color: "var(--text-muted)"}}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                label="Confirm Password"
                fullWidth
                required={!form.id || !!form.password}
                type={showConfirm ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) =>
                  onFormChange({...form, confirmPassword: e.target.value})
                }
                placeholder="Repeat password"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowConfirm((v) => !v)}
                          edge="end"
                          sx={{color: "var(--text-muted)"}}
                        >
                          {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </div>
          </div>
        </div>
      </DialogContent>

      <DialogActions
        sx={{
          p: "16px 24px",
          borderTop: "1px solid var(--border-ui)",
          justifyContent: "space-between",
        }}
      >
        <div>
          {form.id && (
            <Button
              color="error"
              variant="text"
              onClick={() => onDelete(form.id)}
              sx={{textTransform: "none", fontWeight: 600, borderRadius: "8px"}}
            >
              Delete
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              padding: "8px 16px",
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={onSave}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              padding: "8px 16px",
              boxShadow: "0 1px 3px rgba(30,86,208,0.3)",
              backgroundColor: "var(--brand-primary)",
              "&:hover": {
                backgroundColor: "var(--brand-primary-dark)",
                boxShadow: "0 2px 6px rgba(30,86,208,0.4)",
              },
            }}
          >
            {form.id ? "Save Changes" : "Add Member"}
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
}
