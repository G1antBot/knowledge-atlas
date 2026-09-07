import assert from "node:assert/strict";
import test from "node:test";

import { curriculumGroups, publicContact, publicProfile } from "@/data/content";
import { retrieveArchive } from "@/lib/archive-retrieval";

const contactValues = [publicContact.phone.value, publicContact.email.value];

function sourceHrefs(question: string): string[] {
  return retrieveArchive(question, "zh").sources.map((source) => source.href ?? "");
}

test("simplified and traditional project queries resolve to the same sections", () => {
  const simplified = sourceHrefs("混合路由如何决定走规则或模型？");
  const traditional = sourceHrefs("混合路由如何決定走規則或模型？");

  assert.deepEqual(simplified, traditional);
  assert.ok(traditional.some((href) => href.includes("#hybrid-routing")));
});

test("profile introduction intents resolve to the reviewed public profile", () => {
  const questions = [
    "簡單介紹一下你自己",
    "简单介绍一下你自己",
    "你是谁",
    "你的背景",
    "about you",
    "introduce yourself",
  ];

  for (const question of questions) {
    const result = retrieveArchive(question, question.includes("about") || question.includes("introduce") ? "en" : "zh");
    assert.equal(result.sources[0]?.href, "/about#profile", question);
  }
});

test("profile retrieval indexes the bilingual name and curriculum courses", () => {
  const nameResult = retrieveArchive(publicProfile.name.zh, "zh");
  const courseQueries = [
    { question: "移動應用開發", locale: "zh" as const },
    { question: "Mobile application development", locale: "en" as const },
  ];
  const course = curriculumGroups[0].courses.find((item) => item.en === "Mobile application development");

  assert.ok(course, "the profile curriculum fixture should include the mobile application course");
  assert.equal(nameResult.sources[0]?.href, "/about#profile");
  assert.equal(nameResult.prompt.includes(publicProfile.name.zh), true);

  for (const { question, locale } of courseQueries) {
    const result = retrieveArchive(question, locale);
    const serialized = JSON.stringify(result);

    assert.equal(result.sources[0]?.href, "/about#curriculum", question);
    assert.equal(result.prompt.includes(course[locale]), true, question);
    assert.equal(result.fallbackText?.[locale].includes(course[locale]), true, question);
    for (const value of contactValues) assert.equal(serialized.includes(value), false, question);
  }
});

test("profile material asks for objective narration without model identity", () => {
  const result = retrieveArchive("about you", "en");

  assert.equal(result.sources[0]?.href, "/about#profile");
  assert.match(result.prompt, /客观叙述/);
  assert.doesNotMatch(result.prompt, /网站主人第一人称/);
  assert.match(result.prompt, /模型自身/);
});

test("generic profile retrieval never includes contact details", () => {
  const result = retrieveArchive("請介紹你的教育背景與公開經歷", "zh");
  const serialized = JSON.stringify(result);

  assert.equal(result.sources[0]?.href, "/about#profile");
  for (const value of contactValues) assert.equal(serialized.includes(value), false);
});

test("contact details are retrieved only for explicit contact intent", () => {
  const result = retrieveArchive("請問你的聯絡方式與 email", "zh");

  assert.equal(result.sources[0]?.href, "/about#contact");
  for (const value of contactValues) assert.equal(result.prompt.includes(value), true);
});

test("technical phone, email, and contact wording never releases contact details", () => {
  const questions = [
    "手機端架構是什麼？",
    "這個專案如何處理 email 驗證？",
    "How does email verification work?",
    "Explain contact handling in this project.",
    "What is the contact sensor behavior?",
  ];

  for (const question of questions) {
    const result = retrieveArchive(question, question.match(/[a-z]/i) ? "en" : "zh");
    const serialized = JSON.stringify(result);
    assert.equal(result.sources.some((source) => source.href === "/about#contact"), false, question);
    for (const value of contactValues) assert.equal(serialized.includes(value), false, question);
  }
});

test("mixed profile and contact intent can cite both isolated sources", () => {
  const hrefs = sourceHrefs("請介紹你的背景，並告訴我如何聯絡你");

  assert.ok(hrefs.includes("/about#profile"));
  assert.ok(hrefs.includes("/about#contact"));
  assert.ok(hrefs.length <= 2);
});

test("unrelated questions remain unmatched", () => {
  const result = retrieveArchive("今天天氣適合去哪裡散步？", "zh");

  assert.deepEqual(result.sources, []);
  assert.equal(result.fallbackText, undefined);
});
