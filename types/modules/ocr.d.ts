// https://github.com/kkevsekk1/AutoX/blob/70b79b37b6bf2476d20d0d906a16c59fa08a9212/app/src/main/assets/sample/GoogleMLKit/API.md
declare interface OcrResult {
  level: number;
  confidence: number;
  text: string;
  language?: string;
  bounds?: Rect;
  children?: OcrResult[];
  find(predicate: (obj: OcrResult) => boolean): OcrResult?;
  find(level: number, predicate: (obj: OcrResult) => boolean): OcrResult?;
  filter(predicate: (obj: OcrResult) => boolean): OcrResult[];
  toArray(level: number): OcrResult[];
  toArray(): OcrResult[];
  sort(): void;
  sorted(): OcrResult;
}