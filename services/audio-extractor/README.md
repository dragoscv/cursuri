# studiai-audio-extractor

Cloud Run worker that runs the **entire** lesson AI pipeline:

1. download the lesson video from Firebase Storage (in-region, fast)
2. extract MP3 audio with `ffmpeg`
3. transcribe with Azure AI Speech Fast Transcription
4. summarize the transcript with Azure OpenAI
5. upload `audio.mp3` + `captions.<lang>.vtt` to Firebase Storage
6. write the result onto the lesson + `aiJobs/{jobId}` Firestore docs

Vercel only handles auth + enqueue + the admin UI. The pipeline never runs on
serverless any more, so the previous `ENOSPC` and `ENOENT` (cross-instance
`/tmp`) failures are gone.

## API

`POST /jobs/run`
- Headers: `Authorization: Bearer <AUDIO_EXTRACTOR_TOKEN>`
- Body: `{ "jobId": "<aiJobs/{jobId} document id>" }`
- Returns `202 { ok: true, jobId }` immediately; the pipeline runs in the
  background and reports progress on `aiJobs/{jobId}`.

`GET /healthz` → `200 { ok: true, inflight: <number> }`

Cancellation: write `cancelRequested: true` to `aiJobs/{jobId}` (the existing
Vercel `/api/admin/lessons/ai-process/cancel` endpoint already does this).
The worker polls every second and SIGKILLs ffmpeg + aborts in-flight HTTP at
the next checkpoint.

## Required environment variables

| Name | Purpose |
|---|---|
| `AUDIO_EXTRACTOR_TOKEN` | shared bearer token (must match the Vercel side) |
| `FIREBASE_PROJECT_ID` | Firebase Admin credentials |
| `FIREBASE_CLIENT_EMAIL` | service account email |
| `FIREBASE_PRIVATE_KEY` | service account key (with `\n` escapes) |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | e.g. `studiai-prod.firebasestorage.app` |
| `AZURE_SPEECH_KEY` | Azure AI Speech key |
| `AZURE_SPEECH_REGION` | e.g. `westeurope` |
| `AZURE_OPENAI_ENDPOINT` | e.g. `https://my-resource.openai.azure.com` |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI key |
| `AZURE_OPENAI_DEPLOYMENT` | e.g. `gpt-4o-mini` |
| `AZURE_OPENAI_API_VERSION` | optional, defaults to `2024-10-21` |

## Local dev

```pwsh
cd services/audio-extractor
npm install
$env:AUDIO_EXTRACTOR_TOKEN = "dev-secret"
# …set the other env vars from .env.local…
node server.js
```

## Deploy to Google Cloud Run

```pwsh
# from repo root
$PROJECT = "studiai-prod"
$REGION  = "europe-west1"
$SERVICE = "studiai-audio-extractor"

# Re-use the env vars you have on Vercel; service-account JSON values must
# have their newlines re-escaped (\n) to survive the gcloud flag.
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
  --set-env-vars "AUDIO_EXTRACTOR_TOKEN=...,FIREBASE_PROJECT_ID=...,FIREBASE_CLIENT_EMAIL=...,FIREBASE_PRIVATE_KEY=...,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studiai-prod.firebasestorage.app,AZURE_SPEECH_KEY=...,AZURE_SPEECH_REGION=westeurope,AZURE_OPENAI_ENDPOINT=https://...,AZURE_OPENAI_API_KEY=...,AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini,AZURE_OPENAI_API_VERSION=2024-10-21"
```

> Use `--set-secrets` instead of `--set-env-vars` if you want to read them
> from Google Secret Manager. The current setup reads them straight from the
> revision env for simplicity.

## Sizing notes

- `concurrency 1` because ffmpeg + a 2-CPU instance is already saturated by a
  single transcription. Cloud Run autoscales horizontally up to
  `--max-instances`.
- `cpu 2 / memory 2Gi` handles 1080p H.264 lessons comfortably.
- `timeout 900` (15 min) covers very long lectures; bump to 3600 (60 min) if
  you process raw multi-hour recordings.
- Ephemeral disk is 8 GB by default — plenty for source video + MP3, both of
  which are deleted as soon as they are no longer needed.
