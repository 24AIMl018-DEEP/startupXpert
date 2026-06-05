from supabase import create_client, Client
from shared.core.config import Config

_client: Client | None = None


def get_supabase() -> Client:
    global _client
    if _client is None:
        url = Config.SUPABASE_URL
        key = Config.SUPABASE_SERVICE_ROLE_KEY
        if not url or not key:
            raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
        _client = create_client(url, key)
    return _client
