# パッケージ名とimport形式の統一

基線は `f8544d2eb18860d64b26feecbe2c077b9e6fb330`。プロジェクト名の綴りに合わせ、現行のワークスペーススコープを `@deep-spec-analysis` へ変更した。

## 修正範囲

- 全18ワークスペースのpackage.jsonのname/dependencies、ソースとテストのimport、Bun lockfileを統一。
- アーキテクチャ検査のスコープ定数・パッケージ名の解析・期待名・テストfixtureを更新。
- 現行L7規則に従い、パッケージ間はスコープ名による公開facade、同一パッケージ内は相対importに統一。同一パッケージをスコープ名で参照していた12件・10ファイルを修正した。
- `no-same-package-scoped-imports`を追加し、既存の越境相対import禁止と併せて使い分けを固定した。規則導入時は実ソースの12件を検出し、修正後は0件となる。
- 旧スコープが実行時・型検査時ともに解決できないことを境界テストで確認。旧名のaliasや互換exportsは追加していない。
- 現行ガイド・共有コーディング規則・projectの現行スコープを更新。過去の設計判断・監査・CodeKBスナップショットにある旧名は、当時の証拠として保持した。

## 依存リンクの移行

Bun 1.3.13では、通常のinstallと`--force`のどちらでも旧スコープのリンクがワークスペース内に残り、旧名が解決できることを再現した。16ディレクトリの81要素がすべて生成済みシンボリックリンクであると確認して個別に除去し、新しい依存宣言から解決できることを確認した。

既存チェックアウト向けの[安全な移行手順](../../../../../../../deep-spec-analysis/docs/architecture/package-namespace.md)を記載し、実行確認した。新しいチェックアウトではfrozen-lockfileによる通常のインストールでよい。

## 検証

- `bun install --frozen-lockfile`: 成功。
- `bun run check`: Biome596ファイル指摘なし、getter検査60ファイル・0件。
- `bun run typecheck`: 成功。
- import/パッケージ境界の検査: 52件成功。
- `bun test --coverage`: **950成功・1スキップ・0失敗、951テスト、44ファイル、終了コード0**。
- `bun scripts/coverage.ts --base origin/main`: 絶対・相対ゲートとも成功。変更後/基線ともline coverage99.90%。しきい値・除外は変更なし。
- 生成物の同期、plugin validation、7ハーネスのビルド: 成功。既存のcompose-hook-absent警告1件のみ。

配布用toolsは再生成した。名前変更だけではバンドルは変化せず、内部参照の統一によってdesign用3ファイルの宣言順が変わった。正常系golden・公開JSONスキーマ・aidlc-workflows submoduleは変更していない。
