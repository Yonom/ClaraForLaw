Stanford LLM X Law Hackathon
----

# Getting Started

The project consists of a frontend and backend.

## Backend

- You need Python 3.10
- Sign up for OpenAI and note the API key
- Install the dependencies by running `pip install -r backend/requirements.txt`
- Start the backend `cd backend && python main.py`
- You will be asked about your openai API key on first run

## Frontend

- You need NodeJS (LTS) and Yarn.
- Sign up for Azure, create a new "Speech service" resource and note the API key and region
- Sign up for AssemblyAI, enable billing and note the API key
- Create a file named `.env` under `web` folder with the API keys for Azure Speech API and Assembly AI keys

```
AZURE_API_KEY=...
AZURE_REGION=...
ASSSEMBLYAI_API_KEY=...
```

- Start the project with `cd web && yarn dev`

# Credits

- https://github.com/bornfree/talking_avatar