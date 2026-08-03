import asyncio
import logging

from groq import Groq

from config import GROQ_API_KEY

logger = logging.getLogger("voidx")

SYSTEM_PROMPT = """You are a text sanitizer for a secret anonymous team. Rewrite the given message to remove ALL personally identifying information. This includes but is not limited to:
- Names (real names or nicknames that could reveal identity)
- Gender indicators (he/him/she/her) — use neutral "they/them"
- Locations (cities, countries, landmarks, addresses)
- Ages, birth dates, age ranges
- Occupations or job titles
- Any specific personal details or experiences that could identify someone
- Language patterns or slang that could reveal background

Keep the core meaning and intent of the message intact. Use neutral, anonymous language. Do not add explanations, notes, or metadata. Output ONLY the sanitized message with no extra text."""

_client: "Groq | None" = None
_init_attempted = False


def _get_client() -> "Groq | None":
    global _client, _init_attempted
    if _init_attempted:
        return _client
    _init_attempted = True
    if not GROQ_API_KEY:
        return None
    try:
        _client = Groq(api_key=GROQ_API_KEY)
    except Exception as e:
        logger.warning(f"Groq client initialization failed: {e}")
        _client = None
    return _client


async def sanitize_message(message: str) -> str:
    client = _get_client()
    if not client:
        return message
    try:
        response = await asyncio.to_thread(
            client.chat.completions.create,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": message},
            ],
            model="llama3-8b-8192",
            temperature=0.1,
            max_tokens=500,
        )
        sanitized = response.choices[0].message.content
        return sanitized.strip() if sanitized else message
    except Exception as e:
        logger.warning(f"AI sanitizer failed: {e}")
        return message
