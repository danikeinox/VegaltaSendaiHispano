import { AppwriteException, type Models } from "node-appwrite";
import { formatMemberId } from "@/lib/constants";
import { buildCapacityStatus } from "@/lib/limits";
import {
  getAppwriteConfig,
  getDatabases,
  ID,
  Query,
} from "@/lib/appwrite-server";

export class MemberCapacityError extends Error {
  constructor(
    message: string,
    public readonly capacity: Awaited<ReturnType<typeof getMemberCapacityStatus>>
  ) {
    super(message);
    this.name = "MemberCapacityError";
  }
}

export type Member = {
  id: string;
  memberNumber: number;
  displayId: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string | null;
  createdAt: Date;
};

type MemberDocument = Models.Document & {
  memberNumber: number;
  displayId: string;
  firstName: string;
  lastName: string;
  email: string;
  country?: string | null;
};

function mapDocument(doc: MemberDocument): Member {
  return {
    id: doc.$id,
    memberNumber: doc.memberNumber,
    displayId: doc.displayId,
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    country: doc.country ?? null,
    createdAt: new Date(doc.$createdAt),
  };
}

/**
 * Incremento atómico del contador vía Appwrite incrementDocumentAttribute.
 */
async function allocateMemberNumber(): Promise<number> {
  const databases = getDatabases();
  const { databaseId, sequenceCollectionId, sequenceDocumentId } =
    getAppwriteConfig();

  const updated = await databases.incrementDocumentAttribute({
    databaseId,
    collectionId: sequenceCollectionId,
    documentId: sequenceDocumentId,
    attribute: "value",
    value: 1,
  });

  const memberNumber = (updated as unknown as { value: number }).value;
  if (!memberNumber || memberNumber < 1) {
    throw new Error("Failed to allocate member number");
  }

  return memberNumber;
}

export async function countMembers(): Promise<number> {
  const databases = getDatabases();
  const { databaseId, membersCollectionId } = getAppwriteConfig();

  const result = await databases.listDocuments<MemberDocument>(
    databaseId,
    membersCollectionId,
    [Query.limit(1)]
  );

  return result.total;
}

export async function getMemberCapacityStatus() {
  const currentMembers = await countMembers();
  return buildCapacityStatus(currentMembers);
}

export async function findMemberByEmail(
  email: string
): Promise<Member | null> {
  const databases = getDatabases();
  const { databaseId, membersCollectionId } = getAppwriteConfig();

  const result = await databases.listDocuments<MemberDocument>(
    databaseId,
    membersCollectionId,
    [Query.equal("email", email), Query.limit(1)]
  );

  const doc = result.documents[0];
  return doc ? mapDocument(doc) : null;
}

export async function findMemberByDisplayId(
  displayId: string
): Promise<Member | null> {
  const databases = getDatabases();
  const { databaseId, membersCollectionId } = getAppwriteConfig();

  const result = await databases.listDocuments<MemberDocument>(
    databaseId,
    membersCollectionId,
    [Query.equal("displayId", displayId), Query.limit(1)]
  );

  const doc = result.documents[0];
  return doc ? mapDocument(doc) : null;
}

export async function registerMember(data: {
  firstName: string;
  lastName: string;
  email: string;
  country?: string;
}): Promise<{ member: Member; isNew: boolean }> {
  const existing = await findMemberByEmail(data.email);
  if (existing) {
    return { member: existing, isNew: false };
  }

  const capacity = await getMemberCapacityStatus();
  if (capacity.isFull) {
    throw new MemberCapacityError("Member capacity reached", capacity);
  }

  const databases = getDatabases();
  const { databaseId, membersCollectionId } = getAppwriteConfig();

  const memberNumber = await allocateMemberNumber();
  const displayId = formatMemberId(memberNumber);

  try {
    const doc = await databases.createDocument<MemberDocument>(
      databaseId,
      membersCollectionId,
      ID.unique(),
      {
        memberNumber,
        displayId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        country: data.country ?? null,
      }
    );

    return { member: mapDocument(doc), isNew: true };
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 409) {
      const duplicate = await findMemberByEmail(data.email);
      if (duplicate) {
        return { member: duplicate, isNew: false };
      }
    }
    throw error;
  }
}
