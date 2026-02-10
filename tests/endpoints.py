import httpx
import pytest

@pytest.mark.asyncio
async def test_stream():
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        async with client.stream("GET", "/nodes/123/stream") as response:
            print(f"Status: {response.status_code}")

            async for chunk in response.aiter_text():
                print(f"Received chunk: {chunk}")