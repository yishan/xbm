import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { behaviorsFor, OWNERS, REQUIREMENTS, TAGS, visibleRequirements } from "./board"

const root = join(import.meta.dir, "..")

describe("requirements board", () => {
  const order = REQUIREMENTS.map((item) => item.id)

  test("owner filter keeps matching cards and an empty selection shows all", () => {
    expect(visibleRequirements(REQUIREMENTS, "owner", [], [], order)).toHaveLength(REQUIREMENTS.length)
    const picked = visibleRequirements(REQUIREMENTS, "owner", ["林夏"], [], order)
    expect(picked.every((item) => item.owner === "林夏")).toBe(true)
    expect(picked.map((item) => item.id)).toEqual(["entry", "keys"])
  })

  test("tag filter matches any selected tag", () => {
    const picked = visibleRequirements(REQUIREMENTS, "tags", [], ["焦点", "文案"], order)
    expect(picked.map((item) => item.id)).toEqual(["empty", "focus"])
  })

  test("rank follows the given order", () => {
    const reversed = [...order].reverse()
    expect(visibleRequirements(REQUIREMENTS, "rank", ["林夏"], ["界面"], reversed).map((item) => item.id)).toEqual(reversed)
  })

  test("sample owners and tags come from the board", () => {
    expect(OWNERS).toContain("苏晚")
    expect(TAGS).toContain("无障碍")
  })
})

describe("pinned UI SDK", () => {
  test("package.json pins 0.1.0-beta.2 exactly and the source uses the behaviors", () => {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      dependencies: Record<string, string>
    }
    expect(pkg.dependencies["@ui-sdk/core"]).toBe("0.1.0-beta.2")
    expect(pkg.dependencies["@ui-sdk/react"]).toBe("0.1.0-beta.2")
    const bunfig = readFileSync(join(root, "bunfig.toml"), "utf8")
    expect(bunfig).toContain('minimumReleaseAge = 259200')
    expect(bunfig).toContain('minimumReleaseAgeExcludes = ["@ui-sdk/react", "@ui-sdk/core"]')
    const field = readFileSync(join(root, "src/primitives/field.ts"), "utf8")
    const rank = readFileSync(join(root, "src/primitives/rank.ts"), "utf8")
    for (const name of behaviorsFor("owner")) expect(field).toContain(name)
    for (const name of behaviorsFor("tags")) expect(field).toContain(name)
    for (const name of behaviorsFor("rank")) expect(rank).toContain(name)
    expect(field).toContain("createFocusRecovery")
  })
})
