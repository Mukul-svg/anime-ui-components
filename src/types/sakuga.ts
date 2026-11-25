export type SakugaSfxWord = 'don' | 'gogo' | 'kachi' | 'pon' | 'shu' | 'zuza';

export type SakugaSfxStyle = 'solid' | 'hollow' | 'dotted';

export type ControlCategory = 'all' | 'actions' | 'selection' | 'inputs' | 'feedback';

export interface SakugaCanvasPalette {
  fill: string;
  shade: string;
  line: string;
  accent: string;
  ink: string;
  sfx: [string, string];
}

export interface SakugaThemePreset {
  id: string;
  name: string;
  subtitle: string;
  card: string;
  ink: string;
  dim: string;
  soft: string;
  pri: string;
  priInk: string;
  acc: string;
  track: string;
  line: string;
  onPri: string;
}

export interface SakugaControlSpec {
  key: string;
  id: string;
  name: string;
  tag: string;
  source: 'upstream' | 'studio';
  category: Exclude<ControlCategory, 'all'>;
  sfxLabel: string;
  effectSummary: string;
  how: string;
  html: string;
  usageSnippet: string;
  attributes: Array<{ name: string; description: string }>;
  events: Array<{ name: string; description: string }>;
  wireNotes: string[];
  wide?: boolean;
}

export interface PlaybackModeOption {
  id: string;
  label: string;
  speed: number;
}

export interface RenderJobInput {
  title: string;
  preset: string;
  smearIntensity: number;
  includeSfx: boolean;
  transparentCanvas: boolean;
  priority: number;
  outputTarget: string;
}

export interface RenderJobRecord extends RenderJobInput {
  id: string;
  completedAt: string;
}

export interface FormValidationResult {
  valid: boolean;
  errors: {
    title?: string;
  };
}

export interface SakugaFXApi {
  version: number;
  paused: boolean;
  P: SakugaCanvasPalette;
  calm: boolean;
  now: number;
  advance: (dt: number) => void;
  later: (ms: number, fn: () => void) => void;
  puff: (
    x: number,
    y: number,
    opts?: { n?: number; size?: number; vx?: number; vy?: number; life?: number; spread?: number }
  ) => void;
  burst: (
    x: number,
    y: number,
    opts?: { r?: number; spikes?: number; life?: number }
  ) => void;
  shards: (
    x: number,
    y: number,
    opts?: { n?: number; speed?: number; size?: number; life?: number; dir?: number; arc?: number; grav?: number }
  ) => void;
  ring: (
    x: number,
    y: number,
    opts?: { rx?: number; ry?: number; life?: number; w?: number }
  ) => void;
  splash: (
    x: number,
    y: number,
    opts?: { w?: number; h?: number; life?: number }
  ) => void;
  slash: (
    x: number,
    y: number,
    opts?: { len?: number; ang?: number; life?: number; thick?: number; col?: string }
  ) => void;
  lines: (
    x: number,
    y: number,
    opts?: { n?: number; dir?: number; len?: number; spread?: number; life?: number }
  ) => void;
  ticks: (
    x: number,
    y: number,
    opts?: { n?: number; r?: number; len?: number; dir?: number; life?: number; fan?: number }
  ) => void;
  donut: (
    x: number,
    y: number,
    opts?: { r?: number; vx?: number; vy?: number; life?: number; tilt?: number }
  ) => void;
  wob: (
    x: number,
    y: number,
    opts?: { dir?: number; r?: number; life?: number }
  ) => void;
  kira: (
    x: number,
    y: number,
    opts?: { r?: number; life?: number; col?: string }
  ) => void;
  sfx: (
    name: SakugaSfxWord,
    x: number,
    y: number,
    opts?: { size?: number; rot?: number; life?: number; col?: string; edge?: string; dots?: boolean }
  ) => void;
  hollow: () => { col: string; edge: string };
  dotted: () => { dots: boolean; edge: string };
}

export interface SakugaButtonElement extends HTMLElement {
  done: () => void;
  disabled: boolean;
}

export interface SakugaToggleElement extends HTMLElement {
  checked: boolean;
}

export interface SakugaSliderElement extends HTMLElement {
  value: number;
}

export interface SakugaCheckboxElement extends HTMLElement {
  checked: boolean;
}

export interface SakugaRadioElement extends HTMLElement {
  value: string;
}

export interface SakugaInputElement extends HTMLElement {
  value: string;
}

export interface SakugaTabsElement extends HTMLElement {
  selected: number;
}

export interface SakugaProgressElement extends HTMLElement {
  set: (value: number, instant?: boolean) => void;
  reset: () => void;
}

export interface SakugaRatingElement extends HTMLElement {
  value: number;
}

export interface SakugaToastElement extends HTMLElement {
  show: (message: string) => void;
  hide: () => void;
}

declare global {
  interface Window {
    SakugaFX?: SakugaFXApi;
  }
}
