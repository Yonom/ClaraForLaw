from ChatIO import ChatIO
import re
from fvalues import F
from ice.recipe import recipe
from asyncio import sleep

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
        await self.io.ai_reply("Hi, I am your AI legal navigator, how can I help you?")

        # classify user case
        user_next_action = await self.io.user_input()
        result = await self.classify_problem_space_loop(
            ["Eviction", "Divorce", "Debt"], user_next_action
        )
        if result != "Eviction":
            await  self.io.ai_reply(
                "Sorry, I can currently only help you with eviction cases. Please talk to a lawyer.",
            )
            return

        # get image of the letter received
        await  self.io.ai_reply(
            "Sorry to hear that! Can you show me the letter?",
            takePhoto=True,
        )
        user_next_action = await self.io.user_input()
        await classify_document(user_next_action)
        
        # provide user with instructions
        await  self.io.ai_reply(
            "You must act quickly. You have 5 days to file an answer form. Do you want to do it yourself or get legal help?",
        )
        user_next_action = await self.io.user_input()
        choice = classify_next_steps(user_next_action)
        if choice == "to do it themselves":
            self.io.ai_reply("I have filled out some fields for you, please complete this form and follow the instructions on the California Courts Self Help Guide.", showDIY=True, isEnd=True)
        elif choice == "get legal help":
            self.io.ai_reply("I recommend you visit evictiondefence.org to get legal assistance.", showLegalHelp=True, isEnd=True)
        else:
            self.io.ai_reply("Have a good day!", isEnd=True)


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


    
async def ocr_file(file):
    # dummy function for now
    await sleep(6)
    return """UD-100
ATTORNEY OR PARTY WITHOUT ATTORNEY STATE HAR NUMBER: FOR COURT USE ONLY
NAME: Landy
FIRM NAME Jon
STREET ACCESS: 123 home
CITY Palo Alo STATE.CA 2P CODE: B4920
TELEPHONE NO: FAX NO:
EMAIL ADDRESS:
(ATTORNEY FOR Iraneti
SUPERIOR COURT OF CALIFORNIA, COUNTY OF SI Om
STREET ADORESS 270 Grant Avenue
MALING ADORESS 270 Grant Avenue, Palo Alto, CA. 94306
CITY AND ZIP CODE Palo Alo, 94306
BRANCH NANE Palo Alto courthouse"""
    

async def classify_document(file_contents):
    result = await llm(F(f"""Extract the form type starting with UD- from the file contents

``` 
{file_contents}
````

Answer: "The form type is UD-""").strip())
    # return "UD-" + result[0:3]
    return "UD-100"
    

async def classify_next_steps(user_next_action):
    options = ["to do it themselves", "get legal help", "unknown"]
    options_str = F("\n").join(
        [F(f"{i+1}. {option}") for i, option in enumerate(options)]
    )
    result = await llm(F(f"""
What does the user wish to do?

Options:
{options_str}

User statement: "{user_next_action}"

Answer: "The user wants to take option #""").strip())
    
    match = re.search("[0-9]", result)
    if match is not None:
        option = match.group()
    return options[int(option) - 1]


async def dummy():
    pass

recipe.main(dummy)
