import assert from "node:assert/strict";
import test from "node:test";
import { retrieveArchive } from "../lib/archive-retrieval";
import { askEvaluationCases } from "./ask-evaluation-cases";

for (const item of askEvaluationCases) {
  test(`archive evaluation: ${item.id}`, () => {
    const result = retrieveArchive(item.question, item.locale);
    const hrefs = result.sources.map((source) => source.href ?? "");
    if (item.targets.length === 0) assert.equal(hrefs.length, 0);
    for (const target of item.targets) assert.ok(hrefs.some((href) => href.includes(target)), `${item.id}: missing ${target}; got ${hrefs.join(", ")}`);
    assert.ok(hrefs.length <= 4);
    assert.equal(new Set(hrefs).size, hrefs.length);
  });
}
