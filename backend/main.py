from ice.recipe import recipe
from asyncio import get_running_loop
from fvalues import F
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI()

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


user_input_waiter = None
ai_input_waiter = None


class ChatParams(BaseModel):
    text: str


initialSpeech = ""


@app.get("/initialPrompt")
async def initial_prompt():
    global initialSpeech

    return {"text": initialSpeech}


@app.post("/chat")
async def read_root(input: ChatParams):
    global user_input_waiter
    global ai_input_waiter

    user_input_waiter.set_result(input.text)
    ai_input_waiter = get_running_loop().create_future()
    return {"text": await ai_input_waiter}


async def user_input():
    global user_input_waiter

    user_input_waiter = get_running_loop().create_future()
    return await user_input_waiter


async def llm(prompt):
    return await recipe.agent().complete(prompt=prompt)


async def initial_speech(text):
    global initialSpeech

    initialSpeech = text


async def reply(text):
    global ai_input_waiter

    ai_input_waiter.set_result(text)


def create_server():
    return uvicorn.Server(config=uvicorn.Config(app)).serve()


async def run_agent():
    server_task = get_running_loop().create_task(create_server())

    try:
        await initial_speech("Hi")
        while True:
            input = await user_input()
            result = await llm(prompt=input)
            await reply(result)

    finally:
        server_task.cancel()


recipe.main(run_agent)
