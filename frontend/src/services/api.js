// -----------------------------------------------------------------------
// LegalLens API service layer
// -----------------------------------------------------------------------
// Step 1: every function below resolves demo/sample data with a small
// artificial delay, so components can already call an async, network-
// shaped API.
//
// Step 2+: replace each function body with a real fetch()/axios call
// to the backend. Because components only ever import from this file
// (never a raw URL), no component or page will need to change —
// only this file does.
//
// Do NOT hardcode a backend base URL anywhere else in the app.
// -----------------------------------------------------------------------

import { sampleCases, caseRelationships, getCaseById } from "../data/sampleCases";
import { sampleDocuments, sampleDocumentBody } from "../data/sampleDocuments";
import {
  sampleAiResponse,
  argumentAnalysis,
  conflictData,
  caseTimeline,
  relatedTimeline,
  sampleCitations,
  dashboardStats,
  recentQueries,
} from "../data/sampleResearchData";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // wired up in Step 2

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchDashboardStats() {
  await delay();
  return dashboardStats;
}

export async function fetchRecentDocuments() {
  await delay();
  return sampleDocuments;
}

export async function fetchRecentQueries() {
  await delay();
  return recentQueries;
}

export async function fetchDefaultDocument() {
  await delay();
  return sampleDocumentBody;
}

// Simulates sending a locally-uploaded file for processing. Step 2
// posts the file to the backend and returns a real document id.
export async function uploadDocument(file) {
  await delay(500);
  return {
    id: `local-${Date.now()}`,
    name: file.name,
    size: file.size,
    type: file.type,
    status: "Processed",
  };
}

// Simulates the RAG question-answering endpoint. Step 3 wires this
// to the real retrieval + LLM pipeline; the response shape (answer /
// evidence / interpretation / citation / verification) stays fixed.
export async function askQuestion(_question) {
  await delay(700);
  return sampleAiResponse;
}

export async function fetchCases() {
  await delay();
  return sampleCases;
}

export async function fetchCaseById(caseId) {
  await delay();
  return getCaseById(caseId);
}

export async function fetchCaseRelationships() {
  await delay();
  return caseRelationships;
}

export async function fetchArgumentAnalysis(_caseId) {
  await delay();
  return argumentAnalysis;
}

export async function fetchConflictData(_issueId) {
  await delay();
  return conflictData;
}

export async function fetchCaseTimeline(_caseId) {
  await delay();
  return { primary: caseTimeline, related: relatedTimeline };
}

export async function fetchCitations() {
  await delay();
  return sampleCitations;
}

// Simulates saving a research brief. Step 2 persists this to the
// database and returns a stored brief id.
export async function saveResearchBrief(brief) {
  await delay(400);
  return { ...brief, id: `brief-${Date.now()}`, savedAt: new Date().toISOString() };
}
