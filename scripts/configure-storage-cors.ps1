# Firebase Storage CORS Configuration Script
# This script configures CORS for Firebase Storage bucket

Write-Host "Firebase Storage CORS Configuration" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Check if gsutil is installed
$gsutilCheck = Get-Command gsutil -ErrorAction SilentlyContinue
if (-not $gsutilCheck) {
    Write-Host "ERROR: gsutil is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "To install gsutil:" -ForegroundColor Yellow
    Write-Host "1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    Write-Host "2. Run: gcloud init" -ForegroundColor Yellow
    Write-Host "3. Authenticate: gcloud auth login" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Production bucket
$prodBucket = "studiai-prod.firebasestorage.app"

Write-Host "Configuring CORS for production bucket: $prodBucket" -ForegroundColor Cyan
Write-Host ""

# Apply CORS configuration
Write-Host "Applying CORS configuration from cors.json..." -ForegroundColor Yellow
gsutil cors set cors.json gs://$prodBucket

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ CORS configuration applied successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Verify CORS configuration
    Write-Host "Current CORS configuration:" -ForegroundColor Cyan
    gsutil cors get gs://$prodBucket
} else {
    Write-Host "✗ Failed to apply CORS configuration" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure you're authenticated:" -ForegroundColor Yellow
    Write-Host "  gcloud auth login" -ForegroundColor Yellow
    Write-Host "  gcloud config set project studiai-prod" -ForegroundColor Yellow
}
