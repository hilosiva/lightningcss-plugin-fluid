# lightningcss-plugin-fluid

CSSのclamp関数を生成する、`fluid()` 関数を提供するLightningCSSのプラグインです。



## インストール

### NPM

```
npm i -D lightningcss-plugin-fluid
```


## セットアップ


`visitor` に `composeVisitors` を使って登録します。
以下は、`vite` を使っている場合の例です。


vite.config.js
```javascript
import { defineConfig } from "vite";
import { composeVisitors } from "lightningcss";
import fluidVisitor from "lightningcss-plugin-fluid";

export default defineConfig({
  css: {
    transformer: "lightningcss",
    lightningcss: {
      visitor: composeVisitors([fluidVisitor()]),
    },
  },
});
```

なお、`vite` のドキュメントには　`css.lightningcss` のオプションに、`visitor` は用意されていないようです。
TypeScriptを使うと型エラーになりますが、内部的には設定ができます。


## 使い方

```css
font-size: fluid(最小値 最大値 最小ビューポート値 最大ビューポート値);
```


最小値と最大値は必須で、`px` または `rem` で指定します。

最小ビューポート値と最大ビューポート値は任意で、`px` で指定します。
省略した場合は既定値である、`375px` （オプションで変更可能）と、`1920px` （オプションで変更可能）が指定されます。（最小ビューポート値のみを省略することはできません）

例
```css
font-size: fluid(24px 40px);
margin-block: fluid(2.5rem 4rem) fluid(24px 32px 768px 1024px);
```



ビルド結果
```css
font-size: clamp(1.5rem, 1.25728rem + 1.0356vi, 2.5rem);
margin-block: clamp(2.5rem, 2.13592rem + 1.5534vi, 4rem) clamp(1.5rem, 0rem + 3.125vi, 2rem);
```

カスタムプロパティは、単位なしのpx値のみ対応しています。


例
```css
--font-sm: 14;
--font-lg: 20;

font-size: fluid(var(--font-sm) var(--font-lg));
```



ビルド結果
```css
font-size: clamp((var(--font-sm) * (1rem / 16)), (((var(--font-sm)  - ((var(--font-lg)  - var(--font-sm)) / (1920 - 375)) * 375 ) * (1rem / 16))  + ( ((var(--font-lg)  - var(--font-sm)) / (1920 - 375)) * 100vi)), (var(--font-lg) * (1rem / 16)));
```


## オプション

以下のオプションが利用できます。

| オプション名 | 値 | 型   |
| --- | --- | --- |
| `minViewPort` | デフォルトとして使う最小ビューポートのpx値（既定値: `375`）  | number / undefined  |
| `maxViewPort`  |  デフォルトとして使う最大ビューポートのpx値（既定値: `1920`）  | number / undefined |
| `baseFontSize`  | デフォルトとしてルート要素のフォントサイズpx値（既定値: `16`） | number / undefined |
| `unit`  | 推奨値に利用する単位（既定値: `"vw"`） | "vi" / "vw" / "cqw" / "cqi" |


vite.config.js
```javascript
import { defineConfig } from "vite";
import { composeVisitors } from "lightningcss";
import fluidVisitor from "lightningcss-plugin-fluid";

export default defineConfig({
  css: {
    transformer: "lightningcss",
    lightningcss: {
      visitor: composeVisitors([fluidVisitor({
        minViewPort: 320,
        maxViewPort: 1440
      })]),
    },
  },
});
```
