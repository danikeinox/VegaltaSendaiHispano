import {
  createAppwriteDatabases,
  ID,
  Query,
  type AppwriteDatabases,
} from "@/lib/appwrite-fetch";

export { ID, Query };

function getCredentials() {
  const endpoint =
    process.env.APPWRITE_ENDPOINT ??
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ??
    "https://fra.cloud.appwrite.io/v1";
  const projectId =
    process.env.APPWRITE_PROJECT_ID ??
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ??
    "6a2702ec000b42a91782";
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!apiKey) {
    throw new Error("APPWRITE_API_KEY is not set");
  }

  return { endpoint, projectId, apiKey };
}

let databasesClient: AppwriteDatabases | null = null;

export function getDatabases(): AppwriteDatabases {
  if (!databasesClient) {
    const { endpoint, projectId, apiKey } = getCredentials();
    databasesClient = createAppwriteDatabases({ endpoint, projectId, apiKey });
  }
  return databasesClient;
}

export function getAppwriteConfig() {
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const membersCollectionId = process.env.APPWRITE_MEMBERS_COLLECTION_ID;
  const sequenceCollectionId = process.env.APPWRITE_SEQUENCE_COLLECTION_ID;
  const sequenceDocumentId =
    process.env.APPWRITE_SEQUENCE_DOCUMENT_ID ?? "member_counter";

  if (!databaseId || !membersCollectionId || !sequenceCollectionId) {
    throw new Error(
      "Appwrite database/collection IDs not configured. Run: npm run appwrite:setup"
    );
  }

  return {
    databaseId,
    membersCollectionId,
    sequenceCollectionId,
    sequenceDocumentId,
  };
}
