import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL: str = os.environ["SUPABASE_URL"]
SUPABASE_KEY: str = os.environ["SUPABASE_KEY"]

# Shared client (uses anon key — RLS enforced by passing user JWT per-request)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_user_client(token: str) -> Client:
    """Return a Supabase client authenticated as the calling user.
    This ensures RLS policies are applied correctly."""
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    client.postgrest.auth(token)
    return client
