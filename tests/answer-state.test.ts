import assert from "node:assert/strict";
import test from "node:test";
import { isCompleteAnswer, markAnswer, type Message } from "../lib/answer-state";

test("failed or canceled partial output never has completed-answer affordances", () => {
  const messages: Message[] = [
    { role: "assistant", text: "Earlier answer", index: 1, status: "complete" },
    { role: "user", text: "Question" },
    { role: "assistant", text: "Partial answer", index: 2, status: "streaming", sources: [] },
  ];
  const updated = markAnswer(messages, 2, "incomplete");
  assert.equal(updated[2].status, "incomplete");
  assert.equal(updated[2].text, "Partial answer");
  assert.equal(isCompleteAnswer(updated[2]), false);
  assert.equal(isCompleteAnswer(updated[0]), true);
  assert.equal(messages[2].status, "streaming");
});

test("only an explicit completion with text enables cited-answer controls", () => {
  const message: Message = { role: "assistant", text: "Answer", index: 1, status: "streaming" };
  assert.equal(isCompleteAnswer(message), false);
  assert.equal(isCompleteAnswer(markAnswer([message], 1, "complete")[0]), true);
  assert.equal(isCompleteAnswer({ ...message, text: "", status: "complete" }), false);
});
