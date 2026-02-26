#!/usr/bin/env -S node --import tsx

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

type PackageJson = {
  version?: string;
};

type ParsedTag = {
  tag: string;
  version: string;
  year: number;
  month: number;
  day: number;
  kind: "stable" | "prerelease";
  stage: number;
  patch: number;
  preLabel: string;
  preNum: number;
};

type NpmTimeMap = Record<string, string>;

function run(command: string): string {
  return execSync(command, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 1024 * 1024 * 50,
  }).trim();
}

function parseArgs(): { limit: number } {
  const args = process.argv.slice(2);
  let limit = 12;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg) {
      continue;
    }
    if (arg === "--limit" && args[i + 1]) {
      const value = Number(args[i + 1]);
      if (Number.isFinite(value) && value > 0) {
        limit = Math.floor(value);
      }
      i += 1;
      continue;
    }
    if (arg.startsWith("--limit=")) {
      const value = Number(arg.slice("--limit=".length));
      if (Number.isFinite(value) && value > 0) {
        limit = Math.floor(value);
      }
    }
  }

  return { limit };
}

function parseReleaseTag(rawTag: string): ParsedTag | null {
  const match = /^v(\d{4})\.(\d{1,2})\.(\d{1,2})(?:-([0-9A-Za-z.-]+))?$/.exec(rawTag);
  if (!match) {
    return null;
  }

  const [, y, m, d, suffixRaw] = match;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  const suffix = suffixRaw?.toLowerCase();

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  if (!suffix) {
    return {
      tag: rawTag,
      version: rawTag.slice(1),
      year,
      month,
      day,
      kind: "stable",
      stage: 1,
      patch: 0,
      preLabel: "",
      preNum: 0,
    };
  }

  if (/^\d+$/.test(suffix)) {
    return {
      tag: rawTag,
      version: rawTag.slice(1),
      year,
      month,
      day,
      kind: "stable",
      stage: 2,
      patch: Number(suffix),
      preLabel: "",
      preNum: 0,
    };
  }

  const preMatch = /^([a-z]+)(?:[.-]?(\d+))?$/.exec(suffix);
  const preLabel = preMatch?.[1] ?? suffix;
  const preNum = preMatch?.[2] ? Number(preMatch[2]) : 0;

  return {
    tag: rawTag,
    version: rawTag.slice(1),
    year,
    month,
    day,
    kind: "prerelease",
    stage: 0,
    patch: 0,
    preLabel,
    preNum,
  };
}

function compareTags(a: ParsedTag, b: ParsedTag): number {
  if (a.year !== b.year) {
    return a.year - b.year;
  }
  if (a.month !== b.month) {
    return a.month - b.month;
  }
  if (a.day !== b.day) {
    return a.day - b.day;
  }
  if (a.stage !== b.stage) {
    return a.stage - b.stage;
  }
  if (a.patch !== b.patch) {
    return a.patch - b.patch;
  }
  if (a.preLabel !== b.preLabel) {
    return a.preLabel.localeCompare(b.preLabel);
  }
  if (a.preNum !== b.preNum) {
    return a.preNum - b.preNum;
  }
  return a.tag.localeCompare(b.tag);
}

function readLocalVersion(): string {
  const pkg = JSON.parse(readFileSync("package.json", "utf8")) as PackageJson;
  if (!pkg.version) {
    throw new Error("package.json missing version");
  }
  return pkg.version;
}

function readUpstreamTags(): ParsedTag[] {
  const raw = run("git ls-remote --tags https://github.com/openclaw/openclaw.git");
  const tags = new Set<string>();

  for (const line of raw.split("\n")) {
    if (!line) {
      continue;
    }
    const fields = line.split("\t");
    if (fields.length < 2) {
      continue;
    }
    const ref = fields[1];
    if (!ref.startsWith("refs/tags/")) {
      continue;
    }
    if (ref.endsWith("^{}")) {
      continue;
    }
    tags.add(ref.slice("refs/tags/".length));
  }

  return [...tags]
    .map((tag) => parseReleaseTag(tag))
    .filter((entry): entry is ParsedTag => entry !== null)
    .toSorted((a, b) => compareTags(b, a));
}

function readNpmTimes(): NpmTimeMap {
  const userConfig = run("mktemp");
  const raw = run(`npm view openclaw time --json --userconfig "${userConfig}"`);
  return JSON.parse(raw) as NpmTimeMap;
}

function fmtDate(date: string | undefined): string {
  if (!date) {
    return "n/a";
  }
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }
  return parsed.toISOString().slice(0, 10);
}

function buildStatus(localVersion: string, latestStable: ParsedTag | undefined): string {
  if (!latestStable) {
    return "unknown";
  }
  const localParsed = parseReleaseTag(`v${localVersion}`);
  if (!localParsed) {
    return "local version does not match release tag format";
  }
  const delta = compareTags(localParsed, latestStable);
  if (delta === 0) {
    return "up-to-date with latest stable";
  }
  if (delta < 0) {
    return "behind latest stable";
  }
  return "ahead of latest stable";
}

function printRecent(tags: ParsedTag[], npmTimes: NpmTimeMap, limit: number): void {
  const shown = tags.slice(0, limit);
  console.log("");
  console.log(`Recent upstream tags (top ${shown.length})`);
  for (const tag of shown) {
    const date = fmtDate(npmTimes[tag.version]);
    const channel = tag.kind === "stable" ? "stable" : "pre";
    console.log(`- ${tag.tag}  ${channel.padEnd(6)}  ${date}`);
  }
}

function main(): void {
  const { limit } = parseArgs();
  const localVersion = readLocalVersion();
  const tags = readUpstreamTags();
  const npmTimes = readNpmTimes();
  const latestNpm = run(`npm view openclaw version --userconfig "${run("mktemp")}"`);

  const latestStable = tags.find((tag) => tag.kind === "stable");
  const latestPrerelease = tags.find((tag) => tag.kind === "prerelease");
  const status = buildStatus(localVersion, latestStable);

  console.log("release-status: upstream official repository");
  console.log(`- official: https://github.com/openclaw/openclaw`);
  console.log(`- local package version: ${localVersion}`);
  console.log(`- npm latest: ${latestNpm} (${fmtDate(npmTimes[latestNpm])})`);
  if (latestStable) {
    console.log(
      `- latest upstream stable tag: ${latestStable.tag} (${fmtDate(npmTimes[latestStable.version])})`,
    );
  } else {
    console.log("- latest upstream stable tag: n/a");
  }
  if (latestPrerelease) {
    console.log(
      `- latest upstream prerelease tag: ${latestPrerelease.tag} (${fmtDate(npmTimes[latestPrerelease.version])})`,
    );
  } else {
    console.log("- latest upstream prerelease tag: n/a");
  }
  console.log(`- local status: ${status}`);

  printRecent(tags, npmTimes, limit);
}

main();
