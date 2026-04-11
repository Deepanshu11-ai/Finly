from app.core.supabase_client import supabase

async def upload_file(file):
    file_bytes = await file.read()

    supabase.storage.from_("documents").upload(
        file.filename,
        file_bytes
    )

    public_url = supabase.storage.from_("documents").get_public_url(file.filename)

    return public_url