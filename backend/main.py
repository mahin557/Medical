from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import DiagnosisRequest
from diagnosis_engine import generate_diagnosis, OLLAMA_URL, OLLAMA_MODEL
import httpx

app = FastAPI(title="MedDx Clinical Decision Support API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{OLLAMA_URL}/api/tags")
            models = [m["name"] for m in r.json().get("models", [])]
            model_ready = any(OLLAMA_MODEL.split(":")[0] in m for m in models)
        return {
            "status": "ok",
            "ollama": "connected",
            "model": OLLAMA_MODEL,
            "model_downloaded": model_ready,
            "available_models": models,
        }
    except Exception:
        return {
            "status": "degraded",
            "ollama": "not running",
            "fix": f"Install Ollama from https://ollama.com then run: ollama pull {OLLAMA_MODEL}",
        }


@app.post("/diagnose")
async def diagnose(request: DiagnosisRequest):
    try:
        result = await generate_diagnosis(request.patient)
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
