from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from seo_agent import db
from seo_agent.context import anthropic_key as _ctx_anthropic_key, serp_key as _ctx_serp_key
from seo_agent.orchestrator import run_job
from seo_agent.exceptions import SEOGenerationError, SEOValidationError, SEOSERPError

app = FastAPI(title="SEO AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class JobRequest(BaseModel):
    keyword: str
    word_count: int = 1500
    language: str = "en"


@app.on_event("startup")
def startup():
    db.init_db()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/jobs")
def create_job(
    req: JobRequest,
    x_anthropic_key: str | None = Header(default=None),
    x_serp_key: str | None = Header(default=None),
):
    tok_a = _ctx_anthropic_key.set(x_anthropic_key) if x_anthropic_key else None
    tok_s = _ctx_serp_key.set(x_serp_key) if x_serp_key else None
    try:
        job = db.create_job(req.keyword, req.word_count, req.language)
        output = run_job(str(job.id))
        return output
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        if tok_a:
            _ctx_anthropic_key.reset(tok_a)
        if tok_s:
            _ctx_serp_key.reset(tok_s)


@app.get("/jobs")
def list_jobs():
    return db.list_jobs()


@app.get("/jobs/{job_id}")
def get_job(job_id: str):
    job = db.get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status == "completed":
        return db.get_output(job_id)
    if job.status == "failed":
        raise HTTPException(status_code=500, detail=job.error_message)
    return {"job_id": job_id, "status": job.status}
