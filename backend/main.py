from ice.recipe import recipe
from asyncio import get_running_loop
from fvalues import F
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import re

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


@app.get("/start_session")
async def start_session():
    global initialSpeech

    return {"text": initialSpeech}


@app.post("/chat")
async def read_root(input: ChatParams):
    global user_input_waiter
    global ai_input_waiter

    user_input_waiter.set_result(input.text)
    ai_input_waiter = get_running_loop().create_future()
    return await ai_input_waiter


async def user_input():
    global user_input_waiter

    user_input_waiter = get_running_loop().create_future()
    return await user_input_waiter


def llm(prompt, stop=None):
    return recipe.agent().complete(prompt=prompt, stop=stop)


def classify_problem_space_prompt(options, chat):
    options_str = F("\n").join(
        [F(f"{i+1}. {option}") for i, option in enumerate(options)]
    )
    prompt = F(
        f"""Classify the user problem. 
        
Possible classifications:

{options_str}

Problem: "{chat}"
Answer: "The user problem is #"""
    ).strip()
    return prompt


async def classify_problem_space(options, chat):
    prompt = classify_problem_space_prompt(options, chat)
    result = await llm(prompt)
    match = re.search("[0-9]", result)
    if match is not None:
        option = match.group()
    return options[int(option) - 1]


def ask_follow_up_for_classification_prompt(options, chat):
    options_str = F("\n").join(
        [F(f"{i+1}. {option}") for i, option in enumerate(options)]
    )
    prompt = F(
        f"""Generate a follow up question to be able to classify the user problem.
        
Possible classifications:

{options_str}

Problem: "{chat}"
Follow up question: \""""
    ).strip()
    return prompt


async def ask_follow_up_for_classification(options, chat):
    prompt = ask_follow_up_for_classification_prompt(options, chat)
    result = await llm(prompt)
    return result[:-1]


async def classify_problem_space_loop(options, chat):
    extended_options = options + ["Needs more info", "Other"]
    classification = None
    while classification is None or classification == "Needs more info":
        classification = await classify_problem_space(extended_options, chat)

        if classification is None or classification == "Needs more info":
            follow_up_question = await ask_follow_up_for_classification(
                extended_options, chat
            )
            await reply(follow_up_question)
            follow_up_reply = await user_input()
            chat += F(
                f"""Follow up question: "{follow_up_question}" Follow up reply: "{follow_up_reply}\""""
            ).strip()

    return classification


async def initial_speech(text):
    global initialSpeech

    initialSpeech = text


async def reply(text, takePhoto=False):
    global ai_input_waiter

    ai_input_waiter.set_result({"text": text, "takePhoto": takePhoto})


def create_server():
    return uvicorn.Server(config=uvicorn.Config(app)).serve()


async def run_agent():
    server_task = get_running_loop().create_task(create_server())

    try:
        await initial_speech("Hi, I am your AI lawyer, how can I help you?")
        while True:
            # classify user case
            input = await user_input()

            result = await classify_problem_space_loop(
                ["Eviction", "Divorce", "Debt"], input
            )
            if result != "Eviction":
                await reply(
                    "Sorry, I can currently only help you with eviction cases. Please talk to a lawyer."
                )
            else:
                await reply(
                    "Sorry to hear that! Can you show me the letter?", takePhoto=True
                )

    finally:
        server_task.cancel()


recipe.main(run_agent)
