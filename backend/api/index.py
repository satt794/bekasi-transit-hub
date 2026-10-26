import sys
from pathlib import Path
from starlette.types import ASGIApp, Receive, Scope, Send

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app


class VercelPathMiddleware:
    """Middleware to restore original request path from Vercel rewrite headers."""

    def __init__(self, asgi_app: ASGIApp):
        self.asgi_app = asgi_app

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] == "http":
            headers = dict(scope.get("headers", []))
            # Vercel sends the original requested path in these headers
            matched_path = (
                headers.get(b"x-matched-path", b"").decode("utf-8")
                or headers.get(b"x-forwarded-uri", b"").decode("utf-8")
                or headers.get(b"x-invoke-path", b"").decode("utf-8")
            )
            if matched_path and not matched_path.startswith("/api/index"):
                # Strip query params if present in matched_path
                scope["path"] = matched_path.split("?")[0]

        await self.asgi_app(scope, receive, send)


app.add_middleware(VercelPathMiddleware)
