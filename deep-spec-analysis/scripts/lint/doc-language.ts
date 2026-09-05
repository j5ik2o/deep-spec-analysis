// Markdown の言語規律。1 つのファイルの散文は 1 つの言語で書く。
//
// 規則:
//   - `*.ja.md` 以外の Markdown は日本語の散文を含まない。
//   - `*.ja.md` は日本語の散文を含む（英語のまま置かれた未翻訳の器を検出する）。
//
// 「散文」はフェンス付きコードブロックとインラインコードを除いた本文を指す。
// このリポジトリのソースコメントは日本語なので、英語の文書がそれを逐語で
// 引用することは正当であり、コードとして囲まれている限り違反にしない。
//
// 判定は仮名（ひらがな・カタカナ）の有無で行う。漢字だけの語（「設計規則」など）
// は中国語との区別がつかず、英語の文書に技術用語として現れうるため見ない。
// 日本語の散文は実際には必ず仮名を伴うので、ファイル単位ではこれで足りる。

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

/** 走査から外すディレクトリ。生成物と依存は対象にしない。 */
const SKIPPED_DIRECTORIES: ReadonlySet<string> = new Set(["node_modules", ".git", "tools", "dist"]);

/**
 * 言語規律の対象外にするパスの接頭辞（パッケージルートからの相対、`/` 区切り）。
 * 免除は表にする——暗黙の除外や名前の部分一致による例外を作らない。
 *
 * `tests/fixtures/` はテストの入力データであって文書ではない。要件文書の
 * サンプルとして日本語の本文を持つことが仕様そのものなので、言語規律を課さない。
 */
const EXEMPT_PREFIXES: readonly string[] = ["tests/fixtures/"];

const JAPANESE_KANA = /[぀-ゟ゠-ヿ]/u;

export type DocLanguageRule = "japanese-in-english-doc" | "no-japanese-in-ja-doc";

export interface DocLanguageDiagnostic {
  readonly rule: DocLanguageRule;
  /** パッケージルートからの相対パス（`/` 区切り）。 */
  readonly path: string;
  /** 違反を示す最初の行（1 始まり）。`no-japanese-in-ja-doc` では 0。 */
  readonly line: number;
  /** その行の抜粋（最大 120 文字）。行を持たない違反では空文字。 */
  readonly excerpt: string;
}

export interface DocLanguageReport {
  readonly checkedFiles: number;
  readonly diagnostics: readonly DocLanguageDiagnostic[];
}

/**
 * フェンス付きコードブロックとインラインコードを空白へ置き換える。行数と行の
 * 対応は保つので、返り値の行番号はそのまま元ファイルの行番号になる。
 */
export function stripCode(markdown: string): string {
  const lines = markdown.split("\n");
  const out: string[] = [];
  let fence: string | null = null;
  for (const line of lines) {
    const opening = /^\s*(`{3,}|~{3,})/.exec(line);
    if (fence === null && opening !== null) {
      fence = opening[1]?.[0] === "~" ? "~" : "`";
      out.push("");
      continue;
    }
    if (fence !== null) {
      const closing = /^\s*(`{3,}|~{3,})\s*$/.exec(line);
      if (closing !== null && (closing[1]?.[0] === "~" ? "~" : "`") === fence) fence = null;
      out.push("");
      continue;
    }
    out.push(line.replace(/`[^`]*`/g, ""));
  }
  return out.join("\n");
}

function isExempt(relativePath: string): boolean {
  return EXEMPT_PREFIXES.some((prefix) => relativePath.startsWith(prefix));
}

function markdownFilesUnder(root: string): string[] {
  const found: string[] = [];
  const walk = (directory: string): void => {
    for (const entry of readdirSync(directory).sort()) {
      if (SKIPPED_DIRECTORIES.has(entry)) continue;
      const absolute = join(directory, entry);
      if (statSync(absolute).isDirectory()) walk(absolute);
      else if (entry.endsWith(".md")) found.push(absolute);
    }
  };
  walk(root);
  return found;
}

function firstJapaneseLine(prose: string): { line: number; excerpt: string } | null {
  const lines = prose.split("\n");
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index] ?? "";
    if (JAPANESE_KANA.test(line)) return { line: index + 1, excerpt: line.trim().slice(0, 120) };
  }
  return null;
}

/** パッケージルート配下の Markdown を検査する。 */
export function lintDocLanguage(root: string): DocLanguageReport {
  const diagnostics: DocLanguageDiagnostic[] = [];
  let checkedFiles = 0;

  for (const absolute of markdownFilesUnder(root)) {
    const relativePath = relative(root, absolute).split(sep).join("/");
    if (isExempt(relativePath)) continue;
    checkedFiles++;

    const source = readFileSync(absolute, "utf-8");
    if (relativePath.endsWith(".ja.md")) {
      if (!JAPANESE_KANA.test(source))
        diagnostics.push({ rule: "no-japanese-in-ja-doc", path: relativePath, line: 0, excerpt: "" });
      continue;
    }

    const hit = firstJapaneseLine(stripCode(source));
    if (hit !== null)
      diagnostics.push({
        rule: "japanese-in-english-doc",
        path: relativePath,
        line: hit.line,
        excerpt: hit.excerpt,
      });
  }

  return { checkedFiles, diagnostics };
}
