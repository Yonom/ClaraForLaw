from ChatIO import ChatIO
import re
from fvalues import F
from ice.recipe import recipe

class ChatSession:
    def __init__(self, io: ChatIO):
        self.io = io


    async def classify_problem_space_loop(self, options, chat):
        extended_options = options + ["Needs more info", "Other"]
        classification = None
        while classification is None or classification == "Needs more info":
            classification = await classify_problem_space(extended_options, chat)

            if classification is None or classification == "Needs more info":
                follow_up_question = await ask_follow_up_for_classification(
                    extended_options, chat
                )
                await self.io.ai_reply(follow_up_question)
                follow_up_reply = await self.io.user_input()
                chat += F(
                    f"""\nFollow up question: "{follow_up_question}"\nFollow up reply: "{follow_up_reply}\""""
                ).strip()

        return classification

    async def run_session(self):
        await self.io.ai_reply("Hi, I am your AI lawyer, how can I help you?")
        while True:
            # classify user case
            input = await self.io.user_input()

            result = await self.classify_problem_space_loop(
                ["Eviction", "Divorce", "Debt"], input
            )
            if result != "Eviction":
                await  self.io.ai_reply(
                    "Sorry, I can currently only help you with eviction cases. Please talk to a lawyer.",
                )
            else:
                await  self.io.ai_reply(
                    "Sorry to hear that! Can you show me the letter?",
                    takePhoto=True,
                )



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


async def dummy():
    pass

recipe.main(dummy)
