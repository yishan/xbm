import { describe, expect, test } from "bun:test";
import { imageEmbed, scriptEmbed } from "./embed";

describe("scriptEmbed", () => {
  test("outputs only the library script and the custom element", () => {
    const code = scriptEmbed({ text: "Q" });
    expect(code.split("\n")).toEqual([
      `<script type="module" src="https://initialis.azlen.me/lib/initialis.js"></script>`,
      `<initialis-cap settings='{"text":"Q"}' size="200" grow></initialis-cap>`,
    ]);
    expect(code).not.toContain("draw(");
    expect(code).not.toContain('id="cap"');
    expect(code).not.toContain("shape-outside");
  });

  test("escapes quotes in the settings attribute", () => {
    expect(scriptEmbed({ text: "it's" })).toContain("settings='{\"text\":\"it&#39;s\"}'");
  });
});

describe("imageEmbed", () => {
  test("keeps the shape-outside wrap", () => {
    const code = imageEmbed("Q", "q-1024");
    expect(code).toContain("shape-outside:url(initialis-q-1024.png)");
    expect(code).toContain('alt="Q"');
  });
});
