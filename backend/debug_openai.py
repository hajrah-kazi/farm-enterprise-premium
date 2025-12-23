
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ.get('OPENAI_API_KEY')
print(f"Testing Key: {api_key[:10]}...")

client = OpenAI(api_key=api_key)

models_to_test = ["gpt-3.5-turbo", "gpt-4", "gpt-4o"]

for model in models_to_test:
    print(f"\n--- Testing Model: {model} ---")
    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "user", "content": "Test"}
            ]
        )
        print(f"SUCCESS! Response: {completion.choices[0].message.content}")
    except Exception as e:
        print(f"FAILED: {e}")
