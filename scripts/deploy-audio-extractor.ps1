# Cloud Run deploy — studiai-audio-extractor (full pipeline)
#
# Fill in the placeholders below, then run:
#   pwsh ./scripts/deploy-audio-extractor.ps1
#
# AZURE_OPENAI_ENDPOINT must NOT have a trailing slash (e.g.
# https://my-resource.openai.azure.com).
# FIREBASE_PRIVATE_KEY: paste the value with literal `\n` for newlines (same
# format you have on Vercel / .env.local).

$ErrorActionPreference = 'Stop'

$PROJECT  = 'studiai-prod'
$REGION   = 'europe-west1'
$SERVICE  = 'studiai-audio-extractor'
$BUCKET   = 'studiai-prod.firebasestorage.app'

# ---- Secrets (fill these in) ------------------------------------------------
$AUDIO_EXTRACTOR_TOKEN  = '<paste token from .env.local>'
$FIREBASE_PROJECT_ID    = 'studiai-prod'
$FIREBASE_CLIENT_EMAIL  = '<paste from .env.local>'
$FIREBASE_PRIVATE_KEY   = '<paste from .env.local — keep \n escapes>'
$AZURE_SPEECH_KEY       = '<paste server-side Azure Speech key>'
$AZURE_SPEECH_REGION    = 'westeurope'
$AZURE_OPENAI_ENDPOINT  = '<https://your-resource.openai.azure.com>'
$AZURE_OPENAI_API_KEY   = '<paste Azure OpenAI key>'
$AZURE_OPENAI_DEPLOYMENT = 'gpt-4o-mini'
$AZURE_OPENAI_API_VERSION = '2024-10-21'

# ---- Build env vars file (handles multiline private key safely) -------------
# gcloud's --set-env-vars can't handle commas/newlines in values; use a YAML
# file instead.
$envFile = New-TemporaryFile
@"
AUDIO_EXTRACTOR_TOKEN: "$AUDIO_EXTRACTOR_TOKEN"
FIREBASE_PROJECT_ID: "$FIREBASE_PROJECT_ID"
FIREBASE_CLIENT_EMAIL: "$FIREBASE_CLIENT_EMAIL"
FIREBASE_PRIVATE_KEY: "$FIREBASE_PRIVATE_KEY"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "$BUCKET"
AZURE_SPEECH_KEY: "$AZURE_SPEECH_KEY"
AZURE_SPEECH_REGION: "$AZURE_SPEECH_REGION"
AZURE_OPENAI_ENDPOINT: "$AZURE_OPENAI_ENDPOINT"
AZURE_OPENAI_API_KEY: "$AZURE_OPENAI_API_KEY"
AZURE_OPENAI_DEPLOYMENT: "$AZURE_OPENAI_DEPLOYMENT"
AZURE_OPENAI_API_VERSION: "$AZURE_OPENAI_API_VERSION"
"@ | Set-Content -Path $envFile -Encoding utf8

try {
    Write-Host "Deploying $SERVICE to $REGION (project $PROJECT)..." -ForegroundColor Cyan
    gcloud run deploy $SERVICE `
        --source services/audio-extractor `
        --project $PROJECT `
        --region $REGION `
        --allow-unauthenticated `
        --memory 2Gi `
        --cpu 2 `
        --timeout 900 `
        --concurrency 1 `
        --max-instances 10 `
        --env-vars-file $envFile `
        --quiet
} finally {
    Remove-Item $envFile -ErrorAction SilentlyContinue
}

Write-Host "`nService URL:" -ForegroundColor Green
gcloud run services describe $SERVICE --project $PROJECT --region $REGION --format='value(status.url)'
