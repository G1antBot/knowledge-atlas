import { retrieveArchive } from "../lib/archive-retrieval";
import { askEvaluationCases } from "./ask-evaluation-cases";

const results = askEvaluationCases.map((item) => {
  const result = retrieveArchive(item.question, item.locale);
  const hrefs = result.sources.map((source) => source.href ?? "");
  const passed = item.targets.length === 0 ? hrefs.length === 0 : item.targets.every((target) => hrefs.some((href) => href.includes(target)));
  return { ...item, hrefs, passed };
});
console.log(JSON.stringify({ capturedAt: new Date().toISOString(), passed: results.filter((item) => item.passed).length, total: results.length, results }, null, 2));
