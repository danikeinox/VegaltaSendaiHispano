/**
 * Crea la base de datos, colecciones e índices en Appwrite.
 * Requiere APPWRITE_API_KEY con permisos de databases.write
 *
 * Uso: node scripts/setup-appwrite.mjs
 */
import { Client, Databases, Permission, Role } from "node-appwrite";

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
  console.error("ERROR: Define APPWRITE_API_KEY antes de ejecutar este script.");
  process.exit(1);
}

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID ?? "vegalta_sendai";
const MEMBERS_COLLECTION_ID =
  process.env.APPWRITE_MEMBERS_COLLECTION_ID ?? "members";
const SEQUENCE_COLLECTION_ID =
  process.env.APPWRITE_SEQUENCE_COLLECTION_ID ?? "id_sequence";
const SEQUENCE_DOCUMENT_ID =
  process.env.APPWRITE_SEQUENCE_DOCUMENT_ID ?? "member_counter";

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

async function ensureDatabase() {
  try {
    await databases.get(DATABASE_ID);
    console.log(`Database '${DATABASE_ID}' ya existe`);
  } catch {
    await databases.create(DATABASE_ID, "Vegalta Sendai Hispano");
    console.log(`Database '${DATABASE_ID}' creada`);
  }
}

async function ensureMembersCollection() {
  try {
    await databases.getCollection(DATABASE_ID, MEMBERS_COLLECTION_ID);
    console.log(`Collection '${MEMBERS_COLLECTION_ID}' ya existe`);
  } catch {
    await databases.createCollection(
      DATABASE_ID,
      MEMBERS_COLLECTION_ID,
      "Members",
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
      ],
      true,
      true
    );
    console.log(`Collection '${MEMBERS_COLLECTION_ID}' creada`);

    await databases.createIntegerAttribute(
      DATABASE_ID,
      MEMBERS_COLLECTION_ID,
      "memberNumber",
      true
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      MEMBERS_COLLECTION_ID,
      "displayId",
      16,
      true
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      MEMBERS_COLLECTION_ID,
      "firstName",
      50,
      true
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      MEMBERS_COLLECTION_ID,
      "lastName",
      50,
      true
    );
    await databases.createEmailAttribute(
      DATABASE_ID,
      MEMBERS_COLLECTION_ID,
      "email",
      true
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      MEMBERS_COLLECTION_ID,
      "country",
      56,
      false
    );

    await waitForAttributes(MEMBERS_COLLECTION_ID);

    await databases.createIndex(
      DATABASE_ID,
      MEMBERS_COLLECTION_ID,
      "idx_email_unique",
      "unique",
      ["email"]
    );
    await databases.createIndex(
      DATABASE_ID,
      MEMBERS_COLLECTION_ID,
      "idx_display_id_unique",
      "unique",
      ["displayId"]
    );
    await databases.createIndex(
      DATABASE_ID,
      MEMBERS_COLLECTION_ID,
      "idx_member_number_unique",
      "unique",
      ["memberNumber"]
    );
    console.log("Índices de members creados");
  }
}

async function ensureSequenceCollection() {
  try {
    await databases.getCollection(DATABASE_ID, SEQUENCE_COLLECTION_ID);
    console.log(`Collection '${SEQUENCE_COLLECTION_ID}' ya existe`);
  } catch {
    await databases.createCollection(
      DATABASE_ID,
      SEQUENCE_COLLECTION_ID,
      "ID Sequence",
      [Permission.read(Role.any()), Permission.update(Role.any())],
      true,
      true
    );
    console.log(`Collection '${SEQUENCE_COLLECTION_ID}' creada`);

    await databases.createIntegerAttribute(
      DATABASE_ID,
      SEQUENCE_COLLECTION_ID,
      "value",
      true,
      0
    );

    await waitForAttributes(SEQUENCE_COLLECTION_ID);
  }

  try {
    await databases.getDocument(
      DATABASE_ID,
      SEQUENCE_COLLECTION_ID,
      SEQUENCE_DOCUMENT_ID
    );
    console.log(`Documento secuencia '${SEQUENCE_DOCUMENT_ID}' ya existe`);
  } catch {
    await databases.createDocument(
      DATABASE_ID,
      SEQUENCE_COLLECTION_ID,
      SEQUENCE_DOCUMENT_ID,
      { value: 0 }
    );
    console.log(`Documento secuencia inicializado (value=0)`);
  }
}

async function waitForAttributes(collectionId) {
  for (let i = 0; i < 30; i++) {
    const collection = await databases.getCollection(
      DATABASE_ID,
      collectionId
    );
    if (collection.attributes.every((a) => a.status === "available")) {
      return;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Timeout esperando atributos de ${collectionId}`);
}

async function main() {
  console.log("Configurando Appwrite para Vegalta Sendai Hispano...\n");
  await ensureDatabase();
  await ensureMembersCollection();
  await ensureSequenceCollection();

  console.log("\n--- Añade esto a tu .env ---");
  console.log(`APPWRITE_DATABASE_ID=${DATABASE_ID}`);
  console.log(`APPWRITE_MEMBERS_COLLECTION_ID=${MEMBERS_COLLECTION_ID}`);
  console.log(`APPWRITE_SEQUENCE_COLLECTION_ID=${SEQUENCE_COLLECTION_ID}`);
  console.log(`APPWRITE_SEQUENCE_DOCUMENT_ID=${SEQUENCE_DOCUMENT_ID}`);
  console.log("\nSetup completado.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
