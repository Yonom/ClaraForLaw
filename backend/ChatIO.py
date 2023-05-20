from asyncio import get_running_loop
from ice.recipe import recipe


class ChatIO:
    user_input_waiter = None
    ai_input_waiter = None

    def on_user_input_and_return_reply(self, input):
        if input is not None:
            self.user_input_waiter.set_result(input)

        if self.ai_input_waiter is None or self.ai_input_waiter.done():
            self.ai_input_waiter = get_running_loop().create_future()
        return self.ai_input_waiter

    async def user_input(self):
        if self.user_input_waiter is None or self.user_input_waiter.done():
            self.user_input_waiter = get_running_loop().create_future()
        return await self.user_input_waiter

    async def ai_reply(self, text, takePhoto=False, showDIY=False, showLegalHelp=False, isEnd=False):
        self.ai_input_waiter.set_result(
            {
                "text": text,
                "takePhoto": takePhoto,
                "showDIY": showDIY,
                "showLegalHelp": showLegalHelp,
            }
        )


async def dummy():
    pass


recipe.main(dummy)
