import initSqlJs, { type Database } from 'sql.js'
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url'
import schemaSql from '../schema.sql?raw'

let sqlJsPromise: ReturnType<typeof initSqlJs> | null = null

function getSqlJs() {
  sqlJsPromise ??= initSqlJs({ locateFile: () => sqlWasmUrl })
  return sqlJsPromise
}

/** Creates a fresh in-memory database with the current schema applied. */
export async function createDatabase(): Promise<Database> {
  const SQL = await getSqlJs()
  const db = new SQL.Database()
  db.run(schemaSql)
  return db
}

/** Opens an existing database from serialized bytes (e.g. read from a .ond archive). */
export async function openDatabase(bytes: Uint8Array): Promise<Database> {
  const SQL = await getSqlJs()
  return new SQL.Database(bytes)
}
