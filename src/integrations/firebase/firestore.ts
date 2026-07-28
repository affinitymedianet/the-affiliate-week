/**
 * Firestore access over the REST API.
 *
 * The REST API is plain `fetch`, so the exact same code runs in the browser,
 * during server rendering, and on any host — no Node-only dependencies.
 * Authorisation is enforced by Firestore security rules; signed-in requests
 * carry the user's Firebase ID token.
 */
import { assertFirebaseConfigured, firebaseConfig, isFirebaseConfigured } from "./config";

export type Row = Record<string, unknown>;

type FsValue = Record<string, unknown>;

function encodeValue(value: unknown): FsValue {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (typeof value === "string") return { stringValue: value };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(encodeValue) } };
  }
  if (typeof value === "object") {
    return { mapValue: { fields: encodeFields(value as Row) } };
  }
  return { stringValue: String(value) };
}

function encodeFields(data: Row): Record<string, FsValue> {
  const fields: Record<string, FsValue> = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === "id") continue;
    fields[key] = encodeValue(value);
  }
  return fields;
}

function decodeValue(value: FsValue): unknown {
  if (value == null) return null;
  if ("nullValue" in value) return null;
  if ("booleanValue" in value) return value.booleanValue as boolean;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("stringValue" in value) return value.stringValue as string;
  if ("timestampValue" in value) return value.timestampValue as string;
  if ("arrayValue" in value) {
    const arr = (value.arrayValue as { values?: FsValue[] })?.values ?? [];
    return arr.map(decodeValue);
  }
  if ("mapValue" in value) {
    const fields = (value.mapValue as { fields?: Record<string, FsValue> })?.fields ?? {};
    return decodeFields(fields);
  }
  return null;
}

function decodeFields(fields: Record<string, FsValue>): Row {
  const row: Row = {};
  for (const [key, value] of Object.entries(fields)) row[key] = decodeValue(value);
  return row;
}

type FsDocument = { name?: string; fields?: Record<string, FsValue> };

function docToRow(doc: FsDocument): Row {
  const id = (doc.name ?? "").split("/").pop() ?? "";
  return { id, ...decodeFields(doc.fields ?? {}) };
}

function base() {
  assertFirebaseConfigured();
  return `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;
}

function withKey(url: string) {
  const join = url.includes("?") ? "&" : "?";
  return `${url}${join}key=${firebaseConfig.apiKey}`;
}

async function request(url: string, init: RequestInit, token?: string | null) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(withKey(url), { ...init, headers });
  if (!response.ok) {
    const text = await response.text();
    let message = text;
    try {
      message = (JSON.parse(text) as { error?: { message?: string } }).error?.message ?? text;
    } catch {
      /* keep raw text */
    }
    throw new Error(message || `Firestore request failed (${response.status})`);
  }
  return response.status === 204 ? null : await response.json();
}

export type WhereClause = {
  field: string;
  op: "EQUAL" | "NOT_EQUAL" | "LESS_THAN_OR_EQUAL" | "GREATER_THAN_OR_EQUAL" | "IN";
  value: unknown;
};

export type OrderClause = { field: string; direction?: "ASCENDING" | "DESCENDING" };

/**
 * Structured query. Public reads MUST pass the `published` filter so the
 * security rules can prove every returned document is publicly readable.
 */
export async function fsQuery(
  collection: string,
  options: { where?: WhereClause[]; orderBy?: OrderClause[]; limit?: number } = {},
  token?: string | null,
): Promise<Row[]> {
  const filters = (options.where ?? []).map((clause) => ({
    fieldFilter: {
      field: { fieldPath: clause.field },
      op: clause.op,
      value: encodeValue(clause.value),
    },
  }));

  if (!isFirebaseConfigured()) return [];
  const structuredQuery: Row = { from: [{ collectionId: collection }] };
  if (filters.length === 1) structuredQuery.where = filters[0];
  if (filters.length > 1) {
    structuredQuery.where = { compositeFilter: { op: "AND", filters } };
  }
  if (options.orderBy?.length) {
    structuredQuery.orderBy = options.orderBy.map((o) => ({
      field: { fieldPath: o.field },
      direction: o.direction ?? "ASCENDING",
    }));
  }
  if (options.limit) structuredQuery.limit = options.limit;

  const result = (await request(
    `${base()}:runQuery`,
    { method: "POST", body: JSON.stringify({ structuredQuery }) },
    token,
  )) as { document?: FsDocument }[] | null;

  return (result ?? []).filter((entry) => entry.document).map((entry) => docToRow(entry.document!));
}

/** Plain collection listing — only for staff reads (rules require auth). */
export async function fsList(
  collection: string,
  token?: string | null,
  pageSize = 1000,
): Promise<Row[]> {
  if (!isFirebaseConfigured()) return [];
  const rows: Row[] = [];
  let pageToken: string | undefined;
  do {
    const url = `${base()}/${collection}?pageSize=${pageSize}${
      pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""
    }`;
    const page = (await request(url, { method: "GET" }, token)) as {
      documents?: FsDocument[];
      nextPageToken?: string;
    } | null;
    rows.push(...(page?.documents ?? []).map(docToRow));
    pageToken = page?.nextPageToken;
  } while (pageToken);
  return rows;
}

export async function fsGet(
  collection: string,
  id: string,
  token?: string | null,
): Promise<Row | null> {
  if (!isFirebaseConfigured()) return null;
  try {
    const doc = (await request(
      `${base()}/${collection}/${encodeURIComponent(id)}`,
      { method: "GET" },
      token,
    )) as FsDocument;
    return docToRow(doc);
  } catch {
    return null;
  }
}

export async function fsCreate(
  collection: string,
  data: Row,
  token?: string | null,
  docId?: string,
): Promise<string> {
  const url = `${base()}/${collection}${docId ? `?documentId=${encodeURIComponent(docId)}` : ""}`;
  const doc = (await request(
    url,
    { method: "POST", body: JSON.stringify({ fields: encodeFields(data) }) },
    token,
  )) as FsDocument;
  return (doc.name ?? "").split("/").pop() ?? "";
}

/** Partial update — only the supplied fields are written. */
export async function fsUpdate(
  collection: string,
  id: string,
  patch: Row,
  token?: string | null,
): Promise<void> {
  const mask = Object.keys(patch)
    .filter((key) => key !== "id")
    .map((key) => `updateMask.fieldPaths=${encodeURIComponent(key)}`)
    .join("&");
  if (!mask) return;
  await request(
    `${base()}/${collection}/${encodeURIComponent(id)}?${mask}`,
    { method: "PATCH", body: JSON.stringify({ fields: encodeFields(patch) }) },
    token,
  );
}

export async function fsDelete(collection: string, id: string, token?: string | null) {
  await request(`${base()}/${collection}/${encodeURIComponent(id)}`, { method: "DELETE" }, token);
}

/** Read a document by full path, e.g. `settings/site`. */
export async function fsGetPath(path: string, token?: string | null): Promise<Row | null> {
  if (!isFirebaseConfigured()) return null;
  try {
    const doc = (await request(`${base()}/${path}`, { method: "GET" }, token)) as FsDocument;
    return docToRow(doc);
  } catch {
    return null;
  }
}

/** Create-or-merge a document by full path. */
export async function fsSetPath(path: string, patch: Row, token?: string | null): Promise<void> {
  const mask = Object.keys(patch)
    .filter((key) => key !== "id")
    .map((key) => `updateMask.fieldPaths=${encodeURIComponent(key)}`)
    .join("&");
  await request(
    `${base()}/${path}${mask ? `?${mask}` : ""}`,
    { method: "PATCH", body: JSON.stringify({ fields: encodeFields(patch) }) },
    token,
  );
}

export const nowIso = () => new Date().toISOString();
