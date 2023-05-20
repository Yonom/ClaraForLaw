from ice.recipe import recipe
from asyncio import create_task
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from ChatIO import ChatIO
from ChatSession import ChatSession

app = FastAPI()

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


chat_ios: dict[int, ChatSession] = {}


class ChatParams(BaseModel):
    sessionId: int
    text: str


next_session_id = 1


@app.post("/startSession")
async def start_session():
    global next_session_id
    session_id = next_session_id
    next_session_id += 1

    io = ChatIO()
    chat_ios[session_id] = io

    reply_task = io.on_user_input_and_return_reply(None)
    create_task(ChatSession(io).run_session())

    return (await reply_task) | {"sessionId": session_id}


@app.post("/chat")
async def read_root(input: ChatParams):
    io = chat_ios[input.sessionId]
    return await io.on_user_input_and_return_reply(input.text)


async def run_agent():
    # create a server
    await uvicorn.Server(config=uvicorn.Config(app)).serve()


recipe.main(run_agent)
