import type { Metadata } from "next";
import { GraphGeneratorClient } from "./GraphGeneratorClient";

export const metadata: Metadata = {
  title: "Graph Generator — auto-detect every chart from one table",
  description:
    "Upload or paste a single data table and instantly get every applicable graph — bar, error-bar, box, pie, line, scatter, regression and ROC — in one click.",
};

export default function Page() {
  return <GraphGeneratorClient />;
}
