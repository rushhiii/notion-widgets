import fs from "node:fs/promises";
import path from "node:path";

async function loadLocalEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env.local");

  try {
    const raw = await fs.readFile(envPath, "utf8");
    const lines = raw.split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex <= 0) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^"|"$/g, "");

      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // No local env file found; continue with existing environment variables.
  }
}

const outputPath = path.resolve(process.cwd(), "lib", "quotes.notion.json");

function getPlainText(property) {
  if (!property) return "";

  if (property.type === "title") {
    return (property.title ?? []).map((item) => item.plain_text).join("").trim();
  }

  if (property.type === "rich_text") {
    return (property.rich_text ?? []).map((item) => item.plain_text).join("").trim();
  }

  if (property.type === "select") {
    return property.select?.name?.trim() ?? "";
  }

  return "";
}

function getCheckbox(property) {
  if (!property) return null;
  if (property.type === "checkbox") return Boolean(property.checkbox);
  return null;
}

function getSelectOrMultiSelectValues(property) {
  if (!property) return [];
  if (property.type === "multi_select") {
    return (property.multi_select ?? []).map((item) => item.name?.trim()).filter(Boolean);
  }
  if (property.type === "select") {
    const name = property.select?.name?.trim();
    return name ? [name] : [];
  }
  return [];
}

function pickProperty(properties, candidates) {
  const propertyEntries = Object.entries(properties ?? {});

  for (const candidate of candidates) {
    const hit = propertyEntries.find(([name]) => name.toLowerCase() === candidate.toLowerCase());
    if (hit) return hit[1];
  }

  return null;
}

function firstPropertyOfType(properties, type) {
  return Object.values(properties ?? {}).find((property) => property?.type === type) ?? null;
}

function normalizePage(page) {
  const properties = page.properties ?? {};

  const textProperty =
    pickProperty(properties, ["text", "quote", "content", "message"]) ??
    Object.values(properties).find((property) => property?.type === "title" || property?.type === "rich_text");

  const authorProperty = pickProperty(properties, ["author", "speaker", "by"]);
  const categoryProperty = pickProperty(properties, ["category", "tag", "type"]);
  const languageProperty = pickProperty(properties, ["language", "lang"]);
  const sourceTypeProperty = pickProperty(properties, ["source type", "sourcetype", "source"]);
  const resourcesProperty = pickProperty(properties, ["resources", "resource", "reference", "song", "track", "from"]);
  const tagsProperty = pickProperty(properties, ["tags", "tag list", "labels"]);
  const pinnedProperty = pickProperty(properties, ["pinned", "pin"]);
  const personalProperty = pickProperty(properties, ["personal", "private"]);
  const showProperty = pickProperty(properties, [ "show", "visible", "display"]);

  const fallbackSelect = firstPropertyOfType(properties, "select");
  const fallbackMultiSelect = firstPropertyOfType(properties, "multi_select");

  const text = getPlainText(textProperty);
  if (!text) return null;

  const languageValues = getSelectOrMultiSelectValues(languageProperty);
  const sourceTypeValues = getSelectOrMultiSelectValues(sourceTypeProperty);
  const tagValues = getSelectOrMultiSelectValues(tagsProperty);

  const resolvedCategory = categoryProperty || fallbackSelect;
  const resolvedLanguageValues = languageValues.length ? languageValues : getSelectOrMultiSelectValues(fallbackSelect);
  const resolvedSourceTypeValues = sourceTypeValues.length
    ? sourceTypeValues
    : getSelectOrMultiSelectValues(sourceTypeProperty || fallbackSelect);
  const resolvedTagValues = tagValues.length ? tagValues : getSelectOrMultiSelectValues(tagsProperty || fallbackMultiSelect);

  const pinned = getCheckbox(pinnedProperty);
  const personal = getCheckbox(personalProperty);
  const show = getCheckbox(showProperty);

  return {
    text,
    author: getPlainText(authorProperty) || "Unknown",
    resources: getPlainText(resourcesProperty) || undefined,
    category: (getPlainText(resolvedCategory) || "general").toLowerCase(),
    language: resolvedLanguageValues[0]?.toLowerCase(),
    sourceType: resolvedSourceTypeValues[0]?.toLowerCase(),
    tags: resolvedTagValues.map((t) => t.toLowerCase()),
    pinned: pinned ?? false,
    personal: personal ?? false,
    show: show ?? true,
  };
}

async function queryAllPagesFromEndpoint({ notionToken, endpointUrl, notionVersion }) {
  const pages = [];
  let hasMore = true;
  let nextCursor;

  while (hasMore) {
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${notionToken}`,
        "Notion-Version": notionVersion,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nextCursor ? { start_cursor: nextCursor } : {}),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null);
      const error = new Error(
        `Notion API error (${response.status}): ${JSON.stringify(errorPayload ?? {})}`,
      );
      error.payload = errorPayload;
      throw error;
    }

    const data = await response.json();
    pages.push(...(data.results ?? []));
    hasMore = Boolean(data.has_more);
    nextCursor = data.next_cursor;
  }

  return pages;
}

async function getAllPages(notionToken, databaseId) {
  const databaseQueryUrl = `https://api.notion.com/v1/databases/${databaseId}/query`;

  try {
    return await queryAllPagesFromEndpoint({
      notionToken,
      endpointUrl: databaseQueryUrl,
      notionVersion: "2022-06-28",
    });
  } catch (error) {
    const childDataSourceIds = error?.payload?.additional_data?.child_data_source_ids;
    const minimumApiVersion = error?.payload?.additional_data?.minimum_api_version;

    if (!Array.isArray(childDataSourceIds) || childDataSourceIds.length === 0) {
      throw error;
    }

    const notionVersion = minimumApiVersion || "2025-09-03";
    const allPages = [];

    for (const dataSourceId of childDataSourceIds) {
      const pages = await queryAllPagesFromEndpoint({
        notionToken,
        endpointUrl: `https://api.notion.com/v1/data_sources/${dataSourceId}/query`,
        notionVersion,
      });
      allPages.push(...pages);
    }

    return allPages;
  }
}

async function run() {
  await loadLocalEnvFile();

  const notionToken = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!notionToken || !databaseId) {
    console.error("Missing NOTION_TOKEN or NOTION_DATABASE_ID.");
    console.error("Create a .env.local from .env.example and retry.");
    process.exit(1);
  }

  const pages = await getAllPages(notionToken, databaseId);
  const quotes = pages.map(normalizePage).filter(Boolean);

  await fs.writeFile(outputPath, `${JSON.stringify(quotes, null, 2)}\n`, "utf8");
  console.log(`Synced ${quotes.length} quotes to lib/quotes.notion.json`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
