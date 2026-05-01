import type { PaletteName } from "./types";

export const PALETTES: Record<PaletteName, { name: string; colors: string[] }> =
  {
    nejm: {
      name: "NEJM",
      colors: [
        "#BC3C29",
        "#0072B5",
        "#E18727",
        "#20854E",
        "#7876B1",
        "#6F99AD",
        "#EE4C97",
        "#3C3C3C",
      ],
    },
    nature: {
      name: "Nature",
      colors: [
        "#E64B35",
        "#4DBBD5",
        "#00A087",
        "#3C5488",
        "#F39B7F",
        "#8491B4",
        "#91D1C2",
        "#DC0000",
      ],
    },
    colorblind: {
      name: "Colorblind-safe",
      colors: [
        "#E69F00",
        "#56B4E9",
        "#009E73",
        "#F0E442",
        "#0072B2",
        "#D55E00",
        "#CC79A7",
        "#000000",
      ],
    },
    monochrome: {
      name: "Monochrome",
      colors: [
        "#1A1A1A",
        "#404040",
        "#666666",
        "#888888",
        "#AAAAAA",
        "#C8C8C8",
        "#E0E0E0",
        "#F5F5F5",
      ],
    },
    cool: {
      name: "Cool Blue",
      colors: [
        "#08306B",
        "#2171B5",
        "#4292C6",
        "#6BAED6",
        "#9ECAE1",
        "#C6DBEF",
        "#084594",
        "#2171B5",
      ],
    },
    warm: {
      name: "Warm",
      colors: [
        "#7F2704",
        "#A63603",
        "#D94801",
        "#F16913",
        "#FD8D3C",
        "#FDAE6B",
        "#FDD0A2",
        "#FEE6CE",
      ],
    },
  };

export function getPaletteColors(
  palette: PaletteName,
  customColors: string[],
  count: number,
): string[] {
  const base =
    customColors.length >= count
      ? customColors
      : [...customColors, ...PALETTES[palette].colors].slice(
          0,
          Math.max(count, 1),
        );
  // Cycle if not enough
  const result: string[] = [];
  for (let i = 0; i < count; i++) result.push(base[i % base.length]);
  return result;
}
