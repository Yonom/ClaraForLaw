const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

`
Clara: Hi Edward, how are we feeling today?
Edward: Well, not so good. My son didnt pick up my call
Clara: That's tough, I'm sorry to hear that. Is there anything I can do to help lift your mood? Maybe we can listen to some music? How about I play something from the 50s, when you and Mathea first met?
Edward: I would really appreciate that
Clara: Wonderful! How about we listen to "Unforgettable" by Nat King Cole? 
Edward: I really like this song! Reminds me of the old days.
Clara: It sure does! What other memories do you have from that time?
Edward: You know, I was a mechanical engineer when I was young.
Clara: Yes I remember, you were often traveling for that, what about  going on a walk after our conversation, it will do good to your mood!
`;

const SPACE_1 = 1500;
const SPACE_2 = 1500;

const demoBot = async ({ onSpeak, onInput }) => {
  await sleep(5000);
  await onSpeak("Hi Edward, how are we feeling today?");
  await sleep(SPACE_1);
  onInput("Well, not so good. My son didn't pick up my call.");
  await sleep(SPACE_2);
  await onSpeak(
    "That's tough, I'm sorry to hear that. Is there anything I can do to help lift your mood? Maybe we can listen to some music? How about I play something from the 50s, when you and Mathea first met?"
  );
  await sleep(SPACE_1);
  onInput("I would really appreciate that");
  await sleep(SPACE_2);
  await onSpeak(
    'Wonderful! How about we listen to "Unforgettable" by Nat King Cole?'
  );
  await sleep(SPACE_1);
  onInput("I really like this song! Reminds me of the old days.");
  await sleep(SPACE_2);
  await onSpeak(
    "It sure does! What other memories do you have from that time?"
  );
  await sleep(SPACE_1);
  onInput("You know, I was a mechanical engineer when I was young.");
  await sleep(SPACE_2);
  await onSpeak(
    "Yes I remember, you were often traveling for that, what about  going on a walk after our conversation, it will do good to your mood!"
  );
};

export default demoBot;
