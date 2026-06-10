/**
 * Cliente Appwrite vía fetch nativo (compatible con Cloudflare Workers).
 * node-appwrite usa node-fetch-native-with-agent y falla en el runtime Edge.
 */

export class AppwriteException extends Error {
  constructor(
    message: string,
    public code: number,
    public type = "",
    public response = ""
  ) {
    super(message);
    this.name = "AppwriteException";
  }
}

type AppwriteCredentials = {
  endpoint: string;
  projectId: string;
  apiKey: string;
};

type DocumentList<T> = {
  total: number;
  documents: T[];
};

function flattenParams(
  params: Record<string, unknown>
): Array<[string, string]> {
  const pairs: Array<[string, string]> = [];

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        const serialized =
          typeof item === "string"
            ? item
            : typeof item === "object" &&
                item !== null &&
                "toString" in item &&
                typeof item.toString === "function"
              ? item.toString()
              : JSON.stringify(item);
        pairs.push([`${key}[]`, serialized]);
      }
      continue;
    }

    pairs.push([key, String(value)]);
  }

  return pairs;
}

async function appwriteRequest<T>(
  credentials: AppwriteCredentials,
  method: string,
  path: string,
  params?: Record<string, unknown>
): Promise<T> {
  const url = new URL(`${credentials.endpoint}${path}`);
  const headers: Record<string, string> = {
    "X-Appwrite-Project": credentials.projectId,
    "X-Appwrite-Key": credentials.apiKey,
  };

  let body: string | undefined;

  if (method.toUpperCase() === "GET" && params) {
    for (const [key, value] of flattenParams(params)) {
      url.searchParams.append(key, value);
    }
  } else if (params) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(params);
  }

  const response = await fetch(url.toString(), {
    method: method.toUpperCase(),
    headers,
    body,
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as Record<string, unknown>) : {};

  if (!response.ok) {
    throw new AppwriteException(
      String(data.message ?? "Appwrite request failed"),
      response.status,
      String(data.type ?? ""),
      text
    );
  }

  return data as T;
}

export class Query {
  constructor(
    private readonly method: string,
    private readonly attribute?: string,
    private readonly values?: unknown[]
  ) {}

  toString(): string {
    return JSON.stringify({
      method: this.method,
      ...(this.attribute !== undefined ? { attribute: this.attribute } : {}),
      ...(this.values !== undefined ? { values: this.values } : {}),
    });
  }

  static equal(attribute: string, value: string): Query {
    return new Query("equal", attribute, [value]);
  }

  static limit(limit: number): Query {
    return new Query("limit", undefined, [limit]);
  }
}

export const ID = {
  unique(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  },
};

export function createAppwriteDatabases(credentials: AppwriteCredentials) {
  return {
    listDocuments<T extends Record<string, unknown>>(
      databaseId: string,
      collectionId: string,
      queries?: Query[]
    ): Promise<DocumentList<T>> {
      return appwriteRequest<DocumentList<T>>(
        credentials,
        "GET",
        `/databases/${databaseId}/collections/${collectionId}/documents`,
        queries ? { queries } : undefined
      );
    },

    getDocument<T extends Record<string, unknown>>(
      databaseId: string,
      collectionId: string,
      documentId: string
    ): Promise<T> {
      return appwriteRequest<T>(
        credentials,
        "GET",
        `/databases/${databaseId}/collections/${collectionId}/documents/${documentId}`
      );
    },

    createDocument<T extends Record<string, unknown>>(
      databaseId: string,
      collectionId: string,
      documentId: string,
      data: Record<string, unknown>
    ): Promise<T> {
      return appwriteRequest<T>(
        credentials,
        "POST",
        `/databases/${databaseId}/collections/${collectionId}/documents`,
        { documentId, data }
      );
    },

    updateDocument<T extends Record<string, unknown>>(
      databaseId: string,
      collectionId: string,
      documentId: string,
      data: Record<string, unknown>
    ): Promise<T> {
      return appwriteRequest<T>(
        credentials,
        "PATCH",
        `/databases/${databaseId}/collections/${collectionId}/documents/${documentId}`,
        { data }
      );
    },

    incrementDocumentAttribute<T extends Record<string, unknown>>(params: {
      databaseId: string;
      collectionId: string;
      documentId: string;
      attribute: string;
      value?: number;
    }): Promise<T> {
      const { databaseId, collectionId, documentId, attribute, value } = params;
      return appwriteRequest<T>(
        credentials,
        "PATCH",
        `/databases/${databaseId}/collections/${collectionId}/documents/${documentId}/${attribute}/increment`,
        value !== undefined ? { value } : undefined
      );
    },
  };
}

export type AppwriteDatabases = ReturnType<typeof createAppwriteDatabases>;
