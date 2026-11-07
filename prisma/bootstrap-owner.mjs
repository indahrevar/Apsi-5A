import "dotenv/config";
import { randomUUID, scryptSync, randomBytes } from "node:crypto";
import pg from "pg";

function promptSecret(label) {
  if (!process.stdin.isTTY) {
    throw new Error("Run this command in an interactive terminal or set INITIAL_OWNER_PASSWORD securely.");
  }

  return new Promise((resolve, reject) => {
    let value = "";
    const cleanup = () => {
      process.stdin.removeListener("data", onData);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\n");
    };
    const onData = (input) => {
      for (const character of input.toString("utf8")) {
        if (character === "\u0003") {
          cleanup();
          reject(new Error("Owner setup cancelled."));
          return;
        }
        if (character === "\r" || character === "\n") {
          cleanup();
          resolve(value);
          return;
        }
        if (character === "\u007f" || character === "\b") {
          value = value.slice(0, -1);
        } else if (character >= " ") {
          value += character;
        }
      }
    };

    process.stdout.write(label);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", onData);
  });
}

const connectionString =
  process.env["DIRECT_URL"] ??
  process.env["DATABASE_URL_UNPOOLED"] ??
  process.env["DATABASE_URL"];
const username = process.env["INITIAL_OWNER_USERNAME"]?.trim().toLowerCase();
const name = process.env["INITIAL_OWNER_NAME"]?.trim();
const gender = process.env["INITIAL_OWNER_GENDER"];
const phone = process.env["INITIAL_OWNER_PHONE"]?.trim();
const email = process.env["INITIAL_OWNER_EMAIL"]?.trim().toLowerCase();

if (!connectionString) throw new Error("Set DATABASE_URL or DIRECT_URL before bootstrapping the owner.");
if (!username || username.length < 3 || username.length > 50) {
  throw new Error("INITIAL_OWNER_USERNAME must be between 3 and 50 characters.");
}
if (!name || name.length > 50) throw new Error("INITIAL_OWNER_NAME must be between 1 and 50 characters.");
if (!["Laki-laki", "Perempuan"].includes(gender)) {
  throw new Error("INITIAL_OWNER_GENDER must be Laki-laki or Perempuan.");
}
if (!phone || phone.length > 16) throw new Error("INITIAL_OWNER_PHONE must be between 1 and 16 characters.");
if (!email || email.length > 40 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error("INITIAL_OWNER_EMAIL must be a valid email address up to 40 characters.");
}

const password =
  process.env["INITIAL_OWNER_PASSWORD"] ?? (await promptSecret("Initial owner password: "));
if (
  !password ||
  password.length < 8 ||
  password.length > 128 ||
  !/[A-Za-z]/.test(password) ||
  !/\d/.test(password)
) {
  throw new Error("The initial owner password must be 8–128 characters and contain a letter and a number.");
}

const salt = randomBytes(16);
const passwordHash = `scrypt$${salt.toString("hex")}$${scryptSync(password, salt, 64).toString("hex")}`;
const pool = new pg.Pool({ connectionString, max: 1 });
const client = await pool.connect();

try {
  await client.query("BEGIN");
  const { rows } = await client.query(
    `SELECT EXISTS (SELECT 1 FROM owner) OR
            EXISTS (SELECT 1 FROM account WHERE role = 'OWNER'::account_role) AS already_initialized`,
  );
  if (rows[0].already_initialized) {
    throw new Error("An owner already exists; refusing to create or replace production accounts.");
  }

  await client.query(
    `INSERT INTO owner (id_owner, nama_owner, jenis_kelamin, no_telepon, email, tanggal_bergabung)
     VALUES ('OWN01', $1, $2, $3, $4, CURRENT_DATE)`,
    [name, gender, phone, email],
  );
  await client.query(
    `INSERT INTO account (id_account, username, password_hash, role, id_owner)
     VALUES ($1, $2, $3, 'OWNER'::account_role, 'OWN01')`,
    [randomUUID(), username, passwordHash],
  );
  await client.query("COMMIT");
  console.log("Initial owner account created. Sign in with the username you configured.");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}
