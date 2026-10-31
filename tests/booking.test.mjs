import { PGlite } from "@electric-sql/pglite";
import { test } from "node:test";
import ts from "typescript";
const { availableSlots, localDate, validDate } = await import(
  "data:text/javascript;base64," +
    Buffer.from(
      ts.transpileModule(
        readFileSync(
          new URL("../lib/availability.ts", import.meta.url),
          "utf8",
        ),
        {
          compilerOptions: {
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2022,
          },
        },
      ).outputText,
    ).toString("base64")
);
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const root = new URL("../", import.meta.url);
const read = (file) => readFileSync(new URL(file, root), "utf8");
test("migrações, reservas, promoção e receita sem duplicação", async () => {
  const db = new PGlite();
  await db.exec(read("migrations/001_initial_schema.sql"));
  await db.exec(read("migrations/002_booking_and_sessions.sql"));
  await db.exec(read("migrations/002_booking_and_sessions.sql"));
  console.log("PASS migrations: clean install and safe re-run");
  await db.exec(
    "INSERT INTO clients(name,phone) VALUES('QA','51999999999'); INSERT INTO availability_windows(work_date,start_time,end_time) VALUES('2030-01-02','19:00','23:00');",
  );
  const source = read("app/api/appointments/route.ts");
  const bookingSql = source.match(/await sql`([\s\S]*?)`;/)[1];
  const tag = async (strings, ...values) =>
    (
      await db.query(
        strings.reduce(
          (q, s, i) => q + s + (i < values.length ? "$" + (i + 1) : ""),
          "",
        ),
        values,
      )
    ).rows;
  const book = Function(
    "sql",
    "client",
    "service_id",
    "date",
    "time",
    "expected_price_cents",
    "return sql`" + bookingSql + "`",
  );
  let rows = await book(
    tag,
    { id: 1, name: "QA", phone: "51999999999" },
    1,
    "2030-01-02",
    "19:00",
    3000,
  );
  assert.equal(rows.length, 1);
  assert.equal(
    (
      await book(
        tag,
        { id: 1, name: "QA", phone: "51999999999" },
        1,
        "2030-01-02",
        "19:15",
        3000,
      )
    ).length,
    0,
  );
  assert.equal(
    (
      await book(
        tag,
        { id: 1, name: "QA", phone: "51999999999" },
        1,
        "2030-01-02",
        "22:30",
        3000,
      )
    ).length,
    0,
  );
  assert.equal(
    (
      await book(
        tag,
        { id: 1, name: "QA", phone: "51999999999" },
        1,
        "2030-01-03",
        "19:00",
        3000,
      )
    ).length,
    0,
  );
  assert.equal(
    (
      await book(
        tag,
        { id: 1, name: "QA", phone: "51999999999" },
        1,
        "2030-01-02",
        "20:00",
        1,
      )
    ).length,
    0,
  );
  assert.equal(
    (
      await book(
        tag,
        { id: 1, name: "QA", phone: "51999999999" },
        1,
        "2030-01-02",
        "23:45",
        3000,
      )
    ).length,
    0,
  );
  console.log(
    "PASS booking: saved, overlap rejected, cannot overrun closing, closed days rejected, tampered price rejected",
  );
  await assert.rejects(
    db.exec(
      "INSERT INTO appointments(client_name,client_phone,service_name,price_cents,duration_minutes,appointment_date,appointment_time) VALUES('QA','51999999999','Corte',3000,30,'2030-01-02','19:15')",
    ),
    (e) => e.code === "23P01",
  );
  console.log("PASS overlap exclusion: database enforces reservation conflict");
  await db.exec(
    "INSERT INTO service_promotions(service_id,title,price_cents,valid_from,valid_until) VALUES(1,'Oferta',2500,'2030-01-02','2030-01-02')",
  );
  rows = await book(
    tag,
    { id: 1, name: "QA", phone: "51999999999" },
    1,
    "2030-01-02",
    "20:00",
    2500,
  );
  assert.equal(rows[0].price_cents, 2500);
  console.log("PASS promotion: date-specific discount persisted");
  const updateSource = read("app/api/admin/appointments/route.ts");
  const updateSql = updateSource.match(
    /const rows\s*=\s*await sql`([\s\S]*?)`;/,
  )[1];
  const complete = Function(
    "sql",
    "id",
    "status",
    "payment_method",
    "return sql`" + updateSql + "`",
  );
  assert.equal((await complete(tag, rows[0].id, "completed", "pix")).length, 1);
  assert.equal((await complete(tag, rows[0].id, "completed", "pix")).length, 0);
  assert.equal(
    (
      await db.query(
        "SELECT count(*)::int AS n FROM revenues WHERE appointment_id=$1",
        [rows[0].id],
      )
    ).rows[0].n,
    1,
  );
  console.log(
    "PASS financial: completion posts revenue once, repeated request rejected",
  );
  await db.close();
});

test("horários consideram intervalos, duração, ocupação e fim do expediente", () => {
  const windows = [
    { start_time: "19:10", end_time: "20:10" },
    { start_time: "21:00", end_time: "23:00" },
  ];
  const busy = [{ appointment_time: "21:15", duration_minutes: 45 }];
  const slots = availableSlots(
    "2030-01-02",
    windows,
    busy,
    40,
    new Date("2030-01-01T12:00:00Z"),
  );
  assert(slots.includes("19:10"));
  assert(!slots.includes("19:40"));
  assert(!slots.includes("20:10"));
  assert(!slots.includes("21:00"));
  assert(slots.includes("22:00"));
  assert(!slots.includes("22:30"));
});
test("datas e horários usam Brasília e rejeitam datas inválidas", () => {
  assert.equal(localDate(new Date("2030-01-02T01:00:00Z")), "2030-01-01");
  assert(!validDate("2030-02-30"));
  assert(!validDate("invalid"));
  const slots = availableSlots(
    "2030-01-02",
    [{ start_time: "19:00", end_time: "21:00" }],
    [],
    30,
    new Date("2030-01-02T22:00:00Z"),
  );
  assert(!slots.includes("19:00"));
  assert(slots.includes("19:15"));
});

test("senhas têm salt individual e preservam validação do hash legado", async () => {
  const source = read("lib/auth.ts");
  const functions = source.slice(
    source.indexOf("export async function hashPassword"),
    source.indexOf("export async function getAdminUser"),
  );
  const js = ts.transpileModule(
    'import crypto from "node:crypto"; import {promisify} from "node:util"; const scrypt=promisify(crypto.scrypt);' +
      functions,
    {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  const { hashPassword, verifyPassword } = await import(
    "data:text/javascript;base64," + Buffer.from(js).toString("base64")
  );
  const crypto = await import("node:crypto");
  const a = await hashPassword("test-password-123"),
    b = await hashPassword("test-password-123");
  assert.notEqual(a, b);
  assert(await verifyPassword("test-password-123", a));
  assert(!(await verifyPassword("wrong-password", a)));
  assert(
    await verifyPassword(
      "legacy-password",
      crypto.createHash("sha256").update("legacy-password").digest("hex"),
    ),
  );
  assert(!(await verifyPassword("anything", "invalid-hash")));
});
