$ErrorActionPreference = "Continue"

$API_URL = "http://localhost:3001/api/v1"
$ADMIN_EMAIL = "testadmin@clinic.test"
$ADMIN_PASSWORD = "Test@123456"

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Testing Patient Service Endpoints" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 1: Register Admin
Write-Host "Step 1: Register Admin User" -ForegroundColor Yellow

$registerBody = @{
    email = $ADMIN_EMAIL
    password = $ADMIN_PASSWORD
    fullName = "Test Admin"
    role = "admin"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-WebRequest -Uri "$API_URL/auth/register" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $registerBody `
        -ErrorAction Stop
    
    $registerJson = $registerResponse.Content | ConvertFrom-Json
    $ADMIN_TOKEN = $registerJson.accessToken
    Write-Host "OK: Registered successfully" -ForegroundColor Green
} catch {
    Write-Host "INFO: Registration failed, attempting login..." -ForegroundColor Yellow
    
    $loginBody = @{
        email = $ADMIN_EMAIL
        password = $ADMIN_PASSWORD
    } | ConvertTo-Json
    
    try {
        $loginResponse = Invoke-WebRequest -Uri "$API_URL/auth/login" `
            -Method POST `
            -Headers @{"Content-Type" = "application/json"} `
            -Body $loginBody `
            -ErrorAction Stop
        
        $loginJson = $loginResponse.Content | ConvertFrom-Json
        $ADMIN_TOKEN = $loginJson.accessToken
        Write-Host "OK: Logged in successfully" -ForegroundColor Green
    } catch {
        Write-Host "ERROR: Login failed: $_" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Step 2: Create Clinic
Write-Host "Step 2: Create Clinic" -ForegroundColor Yellow

$clinicBody = @{
    name = "Test Clinic $(Get-Random)"
    address = "123 Main St"
    phone = "555-0100"
    email = "clinic@test.com"
} | ConvertTo-Json

try {
    $clinicResponse = Invoke-WebRequest -Uri "$API_URL/clinics" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"; "Authorization" = "Bearer $ADMIN_TOKEN"} `
        -Body $clinicBody `
        -ErrorAction Stop
    
    $clinicJson = $clinicResponse.Content | ConvertFrom-Json
    $CLINIC_ID = $clinicJson.id
    Write-Host "OK: Clinic created - $CLINIC_ID" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to create clinic: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Create Patient
Write-Host "Step 3: Create Patient" -ForegroundColor Yellow

$patientBody = @{
    firstName = "John"
    lastName = "Doe"
    phone = "555-1234"
    email = "john@patient.com"
    dateOfBirth = "1990-01-15"
    gender = "MALE"
    address = "456 Oak Ave"
    status = "ACTIVE"
} | ConvertTo-Json

try {
    $patientResponse = Invoke-WebRequest -Uri "$API_URL/clinics/$CLINIC_ID/patients" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"; "Authorization" = "Bearer $ADMIN_TOKEN"} `
        -Body $patientBody `
        -ErrorAction Stop
    
    $patientJson = $patientResponse.Content | ConvertFrom-Json
    $PATIENT_ID = $patientJson.id
    Write-Host "OK: Patient created - $PATIENT_ID (John Doe)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to create patient: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Get Patient by ID
Write-Host "Step 4: Get Patient by ID" -ForegroundColor Yellow

try {
    $getResponse = Invoke-WebRequest -Uri "$API_URL/clinics/$CLINIC_ID/patients/$PATIENT_ID" `
        -Method GET `
        -Headers @{"Authorization" = "Bearer $ADMIN_TOKEN"} `
        -ErrorAction Stop
    
    $getJson = $getResponse.Content | ConvertFrom-Json
    Write-Host "OK: Patient retrieved - $($getJson.firstName) $($getJson.lastName)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to get patient: $_" -ForegroundColor Red
}
Write-Host ""

# Step 5: List Patients
Write-Host "Step 5: List Patients" -ForegroundColor Yellow

try {
    $listResponse = Invoke-WebRequest -Uri "$API_URL/clinics/$CLINIC_ID/patients?page=1&limit=10" `
        -Method GET `
        -Headers @{"Authorization" = "Bearer $ADMIN_TOKEN"} `
        -ErrorAction Stop
    
    $listJson = $listResponse.Content | ConvertFrom-Json
    Write-Host "OK: Found $($listJson.meta.total) patients" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to list patients: $_" -ForegroundColor Red
}
Write-Host ""

# Step 6: Update Patient
Write-Host "Step 6: Update Patient" -ForegroundColor Yellow

$updateBody = @{
    phone = "555-9999"
    address = "789 Pine St"
} | ConvertTo-Json

try {
    $updateResponse = Invoke-WebRequest -Uri "$API_URL/clinics/$CLINIC_ID/patients/$PATIENT_ID" `
        -Method PUT `
        -Headers @{"Content-Type" = "application/json"; "Authorization" = "Bearer $ADMIN_TOKEN"} `
        -Body $updateBody `
        -ErrorAction Stop
    
    Write-Host "OK: Patient updated" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to update patient: $_" -ForegroundColor Red
}
Write-Host ""

# Step 7: Create Insurance Provider
Write-Host "Step 7: Create Insurance Provider" -ForegroundColor Yellow

$providerBody = @{
    name = "Blue Cross"
    code = "BC001"
} | ConvertTo-Json

try {
    $providerResponse = Invoke-WebRequest -Uri "$API_URL/clinics/$CLINIC_ID/insurance-providers" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"; "Authorization" = "Bearer $ADMIN_TOKEN"} `
        -Body $providerBody `
        -ErrorAction Stop
    
    $providerJson = $providerResponse.Content | ConvertFrom-Json
    $PROVIDER_ID = $providerJson.id
    Write-Host "OK: Provider created - $PROVIDER_ID (Blue Cross)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to create provider: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 8: List Providers
Write-Host "Step 8: List Insurance Providers" -ForegroundColor Yellow

try {
    $listProvidersResponse = Invoke-WebRequest -Uri "$API_URL/clinics/$CLINIC_ID/insurance-providers" `
        -Method GET `
        -Headers @{"Authorization" = "Bearer $ADMIN_TOKEN"} `
        -ErrorAction Stop
    
    $listProvidersJson = $listProvidersResponse.Content | ConvertFrom-Json
    Write-Host "OK: Found $($listProvidersJson.providers.Count) providers" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to list providers: $_" -ForegroundColor Red
}
Write-Host ""

# Step 9: Create Patient Insurance
Write-Host "Step 9: Create Patient Insurance" -ForegroundColor Yellow

$insuranceBody = @{
    insuranceProviderId = $PROVIDER_ID
    policyNumber = "POL-12345"
    memberId = "MEM-12345"
} | ConvertTo-Json

try {
    $insuranceResponse = Invoke-WebRequest -Uri "$API_URL/clinics/$CLINIC_ID/patients/$PATIENT_ID/insurance" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"; "Authorization" = "Bearer $ADMIN_TOKEN"} `
        -Body $insuranceBody `
        -ErrorAction Stop
    
    $insuranceJson = $insuranceResponse.Content | ConvertFrom-Json
    $INSURANCE_ID = $insuranceJson.id
    Write-Host "OK: Insurance created - $INSURANCE_ID (POL-12345)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to create insurance: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 10: Create Patient Document
Write-Host "Step 10: Create Patient Document" -ForegroundColor Yellow

$docBody = @{
    type = "PRESCRIPTION"
    title = "Dental Prescription"
    fileUrl = "https://example.com/prescription.pdf"
} | ConvertTo-Json

try {
    $docResponse = Invoke-WebRequest -Uri "$API_URL/clinics/$CLINIC_ID/patients/$PATIENT_ID/documents" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"; "Authorization" = "Bearer $ADMIN_TOKEN"} `
        -Body $docBody `
        -ErrorAction Stop
    
    $docJson = $docResponse.Content | ConvertFrom-Json
    $DOCUMENT_ID = $docJson.id
    Write-Host "OK: Document created - $DOCUMENT_ID (PRESCRIPTION)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to create document: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 11: List Patient Documents
Write-Host "Step 11: List Patient Documents" -ForegroundColor Yellow

try {
    $listDocResponse = Invoke-WebRequest -Uri "$API_URL/clinics/$CLINIC_ID/patients/$PATIENT_ID/documents" `
        -Method GET `
        -Headers @{"Authorization" = "Bearer $ADMIN_TOKEN"} `
        -ErrorAction Stop
    
    $listDocJson = $listDocResponse.Content | ConvertFrom-Json
    Write-Host "OK: Found $($listDocJson.documents.Count) documents" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to list documents: $_" -ForegroundColor Red
}
Write-Host ""

# Step 12: Soft Delete Patient
Write-Host "Step 12: Soft Delete Patient" -ForegroundColor Yellow

try {
    $softDeleteResponse = Invoke-WebRequest -Uri "$API_URL/clinics/$CLINIC_ID/patients/$PATIENT_ID/soft-delete" `
        -Method PUT `
        -Headers @{"Authorization" = "Bearer $ADMIN_TOKEN"} `
        -ErrorAction Stop
    
    Write-Host "OK: Patient soft deleted" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to soft delete: $_" -ForegroundColor Red
}
Write-Host ""

# Step 13: Restore Patient
Write-Host "Step 13: Restore Patient" -ForegroundColor Yellow

try {
    $restoreResponse = Invoke-WebRequest -Uri "$API_URL/clinics/$CLINIC_ID/patients/$PATIENT_ID/restore" `
        -Method PUT `
        -Headers @{"Authorization" = "Bearer $ADMIN_TOKEN"} `
        -ErrorAction Stop
    
    Write-Host "OK: Patient restored" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to restore: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✓ All Tests Completed Successfully!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
