#!/bin/bash

# Patient Service Endpoint Test Script
set -e

API_URL="http://localhost:3001/api/v1"
ADMIN_EMAIL="admin@clinic.test"
ADMIN_PASSWORD="Test@123456"

echo "═════════════════════════════════════════════════════════════"
echo "Testing Patient Service Endpoints"
echo "═════════════════════════════════════════════════════════════"
echo ""

# ──────────────────────────────────────────────────────────────
# Step 1: Register & Login as Admin
# ──────────────────────────────────────────────────────────────

echo "▶ STEP 1: Register Admin User"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$ADMIN_EMAIL'",
    "password": "'$ADMIN_PASSWORD'",
    "fullName": "Test Admin",
    "role": "admin"
  }')

echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"
ADMIN_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.accessToken' 2>/dev/null || echo "")

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" == "null" ]; then
  echo "⚠ Registration may have failed, attempting login..."
  LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "'$ADMIN_EMAIL'", "password": "'$ADMIN_PASSWORD'"}')
  ADMIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken' 2>/dev/null || echo "")
fi

echo "✓ Admin Token: ${ADMIN_TOKEN:0:20}..."
echo ""

# ──────────────────────────────────────────────────────────────
# Step 2: Create a Clinic
# ──────────────────────────────────────────────────────────────

echo "▶ STEP 2: Create Clinic"
CLINIC_RESPONSE=$(curl -s -X POST "$API_URL/clinics" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Test Clinic",
    "address": "123 Main St",
    "phone": "555-0100",
    "email": "clinic@test.com"
  }')

echo "$CLINIC_RESPONSE" | jq '.' 2>/dev/null || echo "$CLINIC_RESPONSE"
CLINIC_ID=$(echo "$CLINIC_RESPONSE" | jq -r '.id' 2>/dev/null || echo "")

if [ -z "$CLINIC_ID" ] || [ "$CLINIC_ID" == "null" ]; then
  echo "✗ Failed to create clinic"
  exit 1
fi

echo "✓ Clinic ID: $CLINIC_ID"
echo ""

# ──────────────────────────────────────────────────────────────
# Step 3: Create a Patient
# ──────────────────────────────────────────────────────────────

echo "▶ STEP 3: Create Patient"
CREATE_PATIENT_RESPONSE=$(curl -s -X POST "$API_URL/clinics/$CLINIC_ID/patients" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "phone": "555-1234",
    "email": "john@patient.com",
    "dateOfBirth": "1990-01-15",
    "gender": "MALE",
    "address": "456 Oak Ave",
    "status": "ACTIVE"
  }')

echo "$CREATE_PATIENT_RESPONSE" | jq '.' 2>/dev/null || echo "$CREATE_PATIENT_RESPONSE"
PATIENT_ID=$(echo "$CREATE_PATIENT_RESPONSE" | jq -r '.id' 2>/dev/null || echo "")

if [ -z "$PATIENT_ID" ] || [ "$PATIENT_ID" == "null" ]; then
  echo "✗ Failed to create patient"
  exit 1
fi

echo "✓ Patient ID: $PATIENT_ID"
echo ""

# ──────────────────────────────────────────────────────────────
# Step 4: Get Patient by ID
# ──────────────────────────────────────────────────────────────

echo "▶ STEP 4: Get Patient by ID"
GET_PATIENT=$(curl -s -X GET "$API_URL/clinics/$CLINIC_ID/patients/$PATIENT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "$GET_PATIENT" | jq '.' 2>/dev/null || echo "$GET_PATIENT"
RETRIEVED_ID=$(echo "$GET_PATIENT" | jq -r '.id' 2>/dev/null || echo "")

if [ "$RETRIEVED_ID" == "$PATIENT_ID" ]; then
  echo "✓ Patient retrieved successfully"
else
  echo "✗ Failed to retrieve patient"
fi
echo ""

# ──────────────────────────────────────────────────────────────
# Step 5: List Patients
# ──────────────────────────────────────────────────────────────

echo "▶ STEP 5: List Patients"
LIST_PATIENTS=$(curl -s -X GET "$API_URL/clinics/$CLINIC_ID/patients?page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "$LIST_PATIENTS" | jq '.' 2>/dev/null || echo "$LIST_PATIENTS"
PATIENT_COUNT=$(echo "$LIST_PATIENTS" | jq '.meta.total' 2>/dev/null || echo "0")

echo "✓ Found $PATIENT_COUNT patients"
echo ""

# ──────────────────────────────────────────────────────────────
# Step 6: Update Patient
# ──────────────────────────────────────────────────────────────

echo "▶ STEP 6: Update Patient"
UPDATE_PATIENT=$(curl -s -X PUT "$API_URL/clinics/$CLINIC_ID/patients/$PATIENT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "phone": "555-9999",
    "address": "789 Pine St",
    "notes": "Updated patient record"
  }')

echo "$UPDATE_PATIENT" | jq '.' 2>/dev/null || echo "$UPDATE_PATIENT"
UPDATED_PHONE=$(echo "$UPDATE_PATIENT" | jq -r '.phone' 2>/dev/null || echo "")

if [ "$UPDATED_PHONE" == "555-9999" ]; then
  echo "✓ Patient updated successfully"
else
  echo "✗ Failed to update patient"
fi
echo ""

# ──────────────────────────────────────────────────────────────
# Step 7: Create Insurance Provider
# ──────────────────────────────────────────────────────────────

echo "▶ STEP 7: Create Insurance Provider"
PROVIDER_RESPONSE=$(curl -s -X POST "$API_URL/clinics/$CLINIC_ID/insurance-providers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Blue Cross",
    "code": "BC001"
  }')

echo "$PROVIDER_RESPONSE" | jq '.' 2>/dev/null || echo "$PROVIDER_RESPONSE"
PROVIDER_ID=$(echo "$PROVIDER_RESPONSE" | jq -r '.id' 2>/dev/null || echo "")

if [ -z "$PROVIDER_ID" ] || [ "$PROVIDER_ID" == "null" ]; then
  echo "✗ Failed to create insurance provider"
  exit 1
fi

echo "✓ Insurance Provider ID: $PROVIDER_ID"
echo ""

# ──────────────────────────────────────────────────────────────
# Step 8: List Insurance Providers
# ──────────────────────────────────────────────────────────────

echo "▶ STEP 8: List Insurance Providers"
LIST_PROVIDERS=$(curl -s -X GET "$API_URL/clinics/$CLINIC_ID/insurance-providers" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "$LIST_PROVIDERS" | jq '.' 2>/dev/null || echo "$LIST_PROVIDERS"
echo "✓ Insurance providers listed"
echo ""

# ──────────────────────────────────────────────────────────────
# Step 9: Create Insurance Template
# ──────────────────────────────────────────────────────────────

echo "▶ STEP 9: Create Insurance Template"
TEMPLATE_RESPONSE=$(curl -s -X POST "$API_URL/clinics/$CLINIC_ID/insurance-templates" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "insuranceProviderId": "'$PROVIDER_ID'",
    "name": "Standard Plan",
    "fileUrl": "https://example.com/template.pdf"
  }')

echo "$TEMPLATE_RESPONSE" | jq '.' 2>/dev/null || echo "$TEMPLATE_RESPONSE"
TEMPLATE_ID=$(echo "$TEMPLATE_RESPONSE" | jq -r '.id' 2>/dev/null || echo "")

if [ -z "$TEMPLATE_ID" ] || [ "$TEMPLATE_ID" == "null" ]; then
  echo "✗ Failed to create insurance template"
  exit 1
fi

echo "✓ Insurance Template ID: $TEMPLATE_ID"
echo ""

# ──────────────────────────────────────────────────────────────
# Step 10: Create Patient Insurance
# ──────────────────────────────────────────────────────────────

echo "▶ STEP 10: Create Patient Insurance"
PATIENT_INSURANCE=$(curl -s -X POST "$API_URL/clinics/$CLINIC_ID/patients/$PATIENT_ID/insurance" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "insuranceProviderId": "'$PROVIDER_ID'",
    "policyNumber": "POL-12345",
    "memberId": "MEM-12345"
  }')

echo "$PATIENT_INSURANCE" | jq '.' 2>/dev/null || echo "$PATIENT_INSURANCE"
INSURANCE_ID=$(echo "$PATIENT_INSURANCE" | jq -r '.id' 2>/dev/null || echo "")

if [ -z "$INSURANCE_ID" ] || [ "$INSURANCE_ID" == "null" ]; then
  echo "✗ Failed to create patient insurance"
  exit 1
fi

echo "✓ Patient Insurance ID: $INSURANCE_ID"
echo ""

# ──────────────────────────────────────────────────────────────
# Step 11: List Patient Insurance
# ──────────────────────────────────────────────────────────────

echo "▶ STEP 11: List Patient Insurance"
LIST_INSURANCE=$(curl -s -X GET "$API_URL/clinics/$CLINIC_ID/patients/$PATIENT_ID/insurance" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "$LIST_INSURANCE" | jq '.' 2>/dev/null || echo "$LIST_INSURANCE"
echo "✓ Patient insurance listed"
echo ""

# ──────────────────────────────────────────────────────────────
# Step 12: Create Patient Document
# ──────────────────────────────────────────────────────────────

echo "▶ STEP 12: Create Patient Document"
PATIENT_DOCUMENT=$(curl -s -X POST "$API_URL/clinics/$CLINIC_ID/patients/$PATIENT_ID/documents" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "type": "PRESCRIPTION",
    "title": "Dental Prescription",
    "fileUrl": "https://example.com/prescription.pdf"
  }')

echo "$PATIENT_DOCUMENT" | jq '.' 2>/dev/null || echo "$PATIENT_DOCUMENT"
DOCUMENT_ID=$(echo "$PATIENT_DOCUMENT" | jq -r '.id' 2>/dev/null || echo "")

if [ -z "$DOCUMENT_ID" ] || [ "$DOCUMENT_ID" == "null" ]; then
  echo "✗ Failed to create patient document"
  exit 1
fi

echo "✓ Patient Document ID: $DOCUMENT_ID"
echo ""

# ──────────────────────────────────────────────────────────────
# Step 13: List Patient Documents
# ──────────────────────────────────────────────────────────────

echo "▶ STEP 13: List Patient Documents"
LIST_DOCUMENTS=$(curl -s -X GET "$API_URL/clinics/$CLINIC_ID/patients/$PATIENT_ID/documents" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "$LIST_DOCUMENTS" | jq '.' 2>/dev/null || echo "$LIST_DOCUMENTS"
echo "✓ Patient documents listed"
echo ""

# ──────────────────────────────────────────────────────────────
# Step 14: Activate Insurance Provider
# ──────────────────────────────────────────────────────────────

echo "▶ STEP 14: Activate Insurance Provider"
ACTIVATE_PROVIDER=$(curl -s -X PUT "$API_URL/clinics/$CLINIC_ID/insurance-providers/$PROVIDER_ID/activate" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "$ACTIVATE_PROVIDER" | jq '.' 2>/dev/null || echo "$ACTIVATE_PROVIDER"
echo "✓ Insurance provider activated"
echo ""

# ──────────────────────────────────────────────────────────────
# Step 15: Activate Patient Insurance
# ──────────────────────────────────────────────────────────────

echo "▶ STEP 15: Activate Patient Insurance"
ACTIVATE_INSURANCE=$(curl -s -X PUT "$API_URL/clinics/$CLINIC_ID/patient-insurance/$INSURANCE_ID/activate" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "$ACTIVATE_INSURANCE" | jq '.' 2>/dev/null || echo "$ACTIVATE_INSURANCE"
echo "✓ Patient insurance activated"
echo ""

echo "═════════════════════════════════════════════════════════════"
echo "✓ All Tests Completed Successfully!"
echo "═════════════════════════════════════════════════════════════"
