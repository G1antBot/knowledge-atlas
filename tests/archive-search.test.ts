import assert from "node:assert/strict";
import test from "node:test";

import { archiveProjects, type ArchiveSection } from "@/data/content";
import { createArchiveSearchIndex, searchArchive } from "@/lib/archive-search";

function withOverview() {
  const overview: ArchiveSection = {
    id: "overview",
    title: { zh: "專案概覽", en: "Project overview" },
    body: {
      zh: "個人分工：在模擬環境完成後端整合與證據整理。",
      en: "Personal contribution: backend integration and evidence curation completed in a simulation environment.",
    },
    sources: [],
  };
  return [{ ...archiveProjects[0], overview }];
}

test("overview is indexed as its own project anchor without changing chapter count", () => {
  const project = archiveProjects[0];
  const index = createArchiveSearchIndex(withOverview());
  const overviewDocument = index.documents.find((document) => document.id === `overview:${project.slug}`);

  assert.ok(overviewDocument);
  assert.equal(overviewDocument.sectionId, "overview");
  assert.equal(overviewDocument.targetId, "overview");
  assert.equal(overviewDocument.nodeType, "section");
  assert.equal(project.sections.length, 11);
});

test("archive browser search matches simplified and traditional overview text", () => {
  const index = createArchiveSearchIndex(withOverview());
  const simplified = searchArchive(index, "个人分工");
  const traditional = searchArchive(index, "個人分工");

  assert.ok(simplified.some((hit) => hit.href === "/projects/uav-recognition-strike-control#overview"));
  assert.ok(traditional.some((hit) => hit.href === "/projects/uav-recognition-strike-control#overview"));
});
