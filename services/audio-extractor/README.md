# studiai-audio-extractor

Tiny Cloud Run service that downloads a video URL, extracts mono 96 kbps MP3
with ffmpeg, and **streams the MP3 back to the caller**. Used by the Next.js
admin AI pipeline (`utils/ai/jobQueue.ts`) so we don't run ffmpeg on Vercel
serverless (small `/tmp`, ENOSPC failures).

## API

`POST /extract`
- Headers: `Authorization: Bearer <AUDIO_EXTRACTOR_TOKEN>`
- Body: `{ "videoUrl": "https://...", "jobId": "optional-id" }`
- Response: `audio/mpeg` (chunked)

`GET /healthz` → `200 ok`

## Local dev

```pwsh
# Requires ffmpeg on PATH (or set FFMPEG_BIN)
$env:AUDIO_EXTRACTOR_TOKEN = "dev-secret"
$env:PORT = "8080"
node server.js
```

Test:

```pwsh
curl -X POST http://localhost:8080/extract `
  -H "Authorization: Bearer dev-secret" `
  -H "Content-Type: application/json" `
  -d '{"videoUrl":"https://example.com/video.mp4"}' `
  -o out.mp3
```

## Deploy to Google Cloud Run

Pre-requisites: `gcloud` CLI authenticated, project selected, billing enabled,
Artifact Registry & Cloud Run APIs enabled.

```pwsh
# from repo root
$PROJECT = (gcloud config get-value project)
$REGION  = "europe-west1"          # match your Firestore region
$SERVICE = "studiai-audio-extractor"
$TOKEN   = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes((New-Guid)))

gcloud run deploy $SERVICE `
  --source services/audio-extractor `
  --region $REGION `
  --allow-unauthenticated `
  --memory 2Gi `
  --cpu 2 `
  --timeout 900 `
  --concurrency 1 `
  --max-instances 10 `
  --set-env-vars "AUDIO_EXTRACTOR_TOKEN=$TOKEN"

# print the URL
gcloud run services describe $SERVICE --region $REGION --format "value(status.url)"
```

Then add to `.env.local` and the Vercel project:

```
AUDIO_EXTRACTOR_URL=https://studiai-audio-extractor-XXXX-ew.a.run.app
AUDIO_EXTRACTOR_TOKEN=<the same token you generated above>
```

> `--allow-unauthenticated` is fine here because the service is bearer-token
> gated. If you'd rather use IAM, drop `--allow-unauthenticated`, grant the
> Vercel service account `roles/run.invoker`, and switch the Next.js client to
> sign requests with `google-auth-library` ID tokens instead of the static
> bearer.

## Sizing notes

- `concurrency 1` because ffmpeg saturates the CPU; let Cloud Run autoscale
  horizontally instead of stacking jobs on one instance.
- `cpu 2 / memory 2Gi` handles 1080p H.264 sources comfortably.
- `timeout 900` (15 min) covers very long lectures; bump to 3600 (60 min) if
  you process raw multi-hour recordings.
- Ephemeral disk is 8 GB by default on Cloud Run gen2 — plenty for the source
  video, which is deleted in `finally`.
