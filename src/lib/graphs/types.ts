export type ChartType =
  | "bar"
  | "stacked_bar"
  | "horizontal_bar"
  | "line"
  | "area"
  | "scatter"
  | "pie"
  | "donut"
  | "histogram"
  | "box"
  | "error_bar"
  | "kaplan_meier"
  | "forest"
  | "roc";

export type PaletteName =
  | "nejm"
  | "nature"
  | "colorblind"
  | "monochrome"
  | "cool"
  | "warm";

export interface TableData {
  headers: string[]; // headers[0] = row label column, headers[1..n] = series names
  rows: TableRow[];
}

export interface TableRow {
  label: string;
  values: (number | null)[];
}

export interface ChartConfig {
  // Appearance
  palette: PaletteName;
  customColors: string[];
  // Text
  title: string;
  subtitle: string;
  xLabel: string;
  yLabel: string;
  fontSize: number;
  // Grid + legend
  showGrid: boolean;
  showLegend: boolean;
  legendPosition: "top" | "bottom" | "left" | "right";
  showDataLabels: boolean;
  // Chart-specific
  barOrientation: "vertical" | "horizontal";
  barGrouped: boolean; // false = stacked
  smooth: boolean; // line chart
  showDots: boolean; // line chart
  innerRadius: number; // pie: 0=pie, >0=donut
  yMin: string;
  yMax: string;
  // Series visibility
  hiddenSeries: string[]; // series names that are hidden
  // Histogram
  showDensityCurve: boolean; // overlay Gaussian-smoothed density curve
  // Forest plot
  barSize: number; // bar width in px (0 = auto)
  forestEffectLabel: string; // 'OR' | 'RR' | 'MD' | 'HR'
  forestNull: number; // null hypothesis line: 0 for MD, 1 for OR/RR/HR
}

// Multi-chart session (lives here to avoid circular imports)
export interface ChartSession {
  id: string;
  chartType: ChartType;
  data: TableData;
  config: ChartConfig;
  hasUserData: boolean;
}

export const DEFAULT_CONFIG: ChartConfig = {
  palette: "nejm",
  customColors: [],
  title: "",
  subtitle: "",
  xLabel: "",
  yLabel: "",
  fontSize: 13,
  showGrid: true,
  showLegend: true,
  legendPosition: "bottom",
  showDataLabels: false,
  barOrientation: "vertical",
  barGrouped: true,
  smooth: false,
  showDots: true,
  innerRadius: 0,
  yMin: "",
  yMax: "",
  hiddenSeries: [],
  showDensityCurve: false,
  barSize: 0,
  forestEffectLabel: "OR",
  forestNull: 1,
};

export const CHART_META: Record<
  ChartType,
  { label: string; icon: string; desc: string }
> = {
  bar: { label: "Bar", icon: "📊", desc: "Group comparison" },
  stacked_bar: { label: "Stacked Bar", icon: "📊", desc: "Composition" },
  horizontal_bar: {
    label: "Horiz. Bar",
    icon: "📊",
    desc: "Ranked comparison",
  },
  line: { label: "Line", icon: "📈", desc: "Trends over time" },
  area: { label: "Area", icon: "📈", desc: "Volume over time" },
  scatter: { label: "Scatter", icon: "🔵", desc: "Correlation" },
  pie: { label: "Pie", icon: "⭕", desc: "Proportions" },
  donut: { label: "Donut", icon: "⭕", desc: "Proportions" },
  histogram: { label: "Histogram", icon: "📊", desc: "Distribution" },
  box: { label: "Box Plot", icon: "📦", desc: "Distribution comparison" },
  error_bar: { label: "Error Bar", icon: "📊", desc: "Mean ± SD / SE" },
  kaplan_meier: {
    label: "Kaplan-Meier",
    icon: "📉",
    desc: "Survival analysis",
  },
  forest: { label: "Forest Plot", icon: "🌲", desc: "Meta-analysis" },
  roc: { label: "ROC Curve", icon: "📉", desc: "Diagnostic accuracy" },
};

// Expected column format hint for charts that need specific layouts
export const CHART_FORMAT_HINT: Partial<Record<ChartType, string>> = {
  box: "Label | Min | Q1 | Median | Q3 | Max",
  error_bar: "Label | Mean | SD",
  scatter: "Label | X value | Y value",
  forest: "Study | Effect | CI Lower | CI Upper | Weight",
  kaplan_meier: "Time | Group 1 survival | Group 2 survival",
  roc: "Point | 1-Specificity | Sensitivity",
};

export const SAMPLE_DATA: Record<ChartType, TableData> = {
  bar: {
    headers: ["Group", "Drug A", "Drug B", "Placebo"],
    rows: [
      { label: "Week 2", values: [45, 38, 22] },
      { label: "Week 4", values: [62, 55, 28] },
      { label: "Week 8", values: [78, 71, 35] },
      { label: "Week 12", values: [85, 76, 40] },
    ],
  },
  stacked_bar: {
    headers: ["Category", "Mild", "Moderate", "Severe"],
    rows: [
      { label: "Control", values: [40, 35, 25] },
      { label: "Intervention", values: [55, 30, 15] },
    ],
  },
  horizontal_bar: {
    headers: ["Symptom", "Frequency (%)"],
    rows: [
      { label: "Fever", values: [92] },
      { label: "Cough", values: [84] },
      { label: "Fatigue", values: [76] },
      { label: "Dyspnoea", values: [62] },
      { label: "Headache", values: [54] },
    ],
  },
  line: {
    headers: ["Time (weeks)", "Drug A", "Drug B"],
    rows: [
      { label: "0", values: [6.8, 6.9] },
      { label: "4", values: [6.2, 6.5] },
      { label: "8", values: [5.8, 6.1] },
      { label: "12", values: [5.4, 5.8] },
      { label: "16", values: [5.2, 5.6] },
    ],
  },
  area: {
    headers: ["Month", "Cases"],
    rows: [
      { label: "Jan", values: [45] },
      { label: "Feb", values: [52] },
      { label: "Mar", values: [78] },
      { label: "Apr", values: [65] },
      { label: "May", values: [90] },
    ],
  },
  scatter: {
    headers: ["X", "Y"],
    rows: [
      { label: "P1", values: [22, 4.2] },
      { label: "P2", values: [28, 5.1] },
      { label: "P3", values: [34, 5.8] },
      { label: "P4", values: [38, 6.3] },
      { label: "P5", values: [42, 6.9] },
      { label: "P6", values: [48, 7.4] },
    ],
  },
  pie: {
    headers: ["Category", "Count"],
    rows: [
      { label: "Grade I", values: [35] },
      { label: "Grade II", values: [28] },
      { label: "Grade III", values: [22] },
      { label: "Grade IV", values: [15] },
    ],
  },
  donut: {
    headers: ["Category", "Count"],
    rows: [
      { label: "Improved", values: [58] },
      { label: "Stable", values: [28] },
      { label: "Worsened", values: [14] },
    ],
  },
  histogram: {
    headers: ["Age Group", "Frequency"],
    rows: [
      { label: "20-30", values: [12] },
      { label: "30-40", values: [28] },
      { label: "40-50", values: [35] },
      { label: "50-60", values: [22] },
      { label: "60-70", values: [14] },
      { label: "70-80", values: [6] },
    ],
  },
  box: {
    headers: ["Group", "Min", "Q1", "Median", "Q3", "Max"],
    rows: [
      { label: "Control", values: [42, 55, 68, 78, 95] },
      { label: "Drug A", values: [35, 46, 58, 70, 88] },
      { label: "Drug B", values: [30, 42, 52, 65, 82] },
    ],
  },
  error_bar: {
    headers: ["Group", "Mean", "SD"],
    rows: [
      { label: "Control", values: [68.5, 12.3] },
      { label: "Drug A", values: [54.2, 9.8] },
      { label: "Drug B", values: [48.7, 8.5] },
    ],
  },
  kaplan_meier: {
    headers: ["Time (months)", "Treatment", "Control"],
    rows: [
      { label: "0", values: [1.0, 1.0] },
      { label: "3", values: [0.92, 0.88] },
      { label: "6", values: [0.85, 0.78] },
      { label: "9", values: [0.76, 0.68] },
      { label: "12", values: [0.68, 0.58] },
      { label: "18", values: [0.58, 0.45] },
      { label: "24", values: [0.48, 0.35] },
    ],
  },
  forest: {
    headers: ["Study", "N", "Effect", "CI_Lower", "CI_Upper", "Weight"],
    rows: [
      { label: "Smith 2018", values: [120, 0.72, 0.54, 0.96, 18] },
      { label: "Jones 2019", values: [85, 0.68, 0.48, 0.95, 14] },
      { label: "Kumar 2020", values: [200, 0.81, 0.65, 1.01, 28] },
      { label: "Lee 2021", values: [150, 0.75, 0.58, 0.97, 22] },
      { label: "Sharma 2022", values: [95, 0.7, 0.52, 0.94, 18] },
    ],
  },
  roc: {
    headers: ["1-Specificity", "Sensitivity"],
    rows: [
      { label: "P1", values: [0.0, 0.0] },
      { label: "P2", values: [0.05, 0.45] },
      { label: "P3", values: [0.1, 0.68] },
      { label: "P4", values: [0.2, 0.82] },
      { label: "P5", values: [0.35, 0.9] },
      { label: "P6", values: [0.5, 0.94] },
      { label: "P7", values: [1.0, 1.0] },
    ],
  },
};
