from __future__ import annotations
from contextvars import ContextVar

anthropic_key: ContextVar[str | None] = ContextVar("anthropic_key", default=None)
serp_key: ContextVar[str | None] = ContextVar("serp_key", default=None)
