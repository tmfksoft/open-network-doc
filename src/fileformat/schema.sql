-- schema_version = 1
--
-- Node/edge type-specific fields (DeviceData, GroupHeaderData, PhysicalLinkData, etc.)
-- are stored as a single JSON column rather than one table per type. The original
-- design normalized these, but the TS data model has kept growing ad hoc optional
-- fields (dhcp, icon, ...) since — a JSON column tracks that shape directly instead
-- of needing a migration per field. Markdown `description` bodies are NOT stored
-- here; they live as separate files under /markdown/ in the archive, referenced by
-- the deterministic convention /markdown/nodes/{nodeId}.md and /markdown/edges/{edgeId}.md.

CREATE TABLE schema_meta (
  key   TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE sheets (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  notes       TEXT,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE TABLE nodes (
  id         TEXT PRIMARY KEY,
  sheet_id   TEXT NOT NULL REFERENCES sheets(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  parent_id  TEXT REFERENCES nodes(id) ON DELETE SET NULL,
  pos_x      REAL NOT NULL,
  pos_y      REAL NOT NULL,
  width      REAL,
  height     REAL,
  z_index    INTEGER,
  label      TEXT NOT NULL,
  data_json  TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_nodes_sheet ON nodes(sheet_id);
CREATE INDEX idx_nodes_parent ON nodes(parent_id);

CREATE TABLE edges (
  id                  TEXT PRIMARY KEY,
  sheet_id            TEXT NOT NULL REFERENCES sheets(id) ON DELETE CASCADE,
  source_node_id      TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  target_node_id      TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  source_handle       TEXT,
  target_handle       TEXT,
  type                TEXT NOT NULL,
  label               TEXT,
  color               TEXT,
  vlan_id             INTEGER,
  line_style          TEXT,
  arrow_style         TEXT,
  physical_link_json  TEXT,
  created_at          TEXT NOT NULL,
  updated_at          TEXT NOT NULL
);
CREATE INDEX idx_edges_sheet ON edges(sheet_id);

-- kb_pages.tags is a JSON-encoded string array, not a kb_tags/kb_page_tags join
-- table — same pragmatic reasoning as the nodes/edges data_json columns above,
-- and a page's tag list is small enough that normalizing it buys nothing here.
-- kb_pages.content is NOT stored here; it lives at /markdown/kb/{pageId}.md.
CREATE TABLE kb_pages (
  id          TEXT PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  folder_path TEXT,
  order_index INTEGER NOT NULL,
  tags_json   TEXT NOT NULL DEFAULT '[]',
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

-- No `assets` table: an asset's id and mime type are already fully recoverable
-- from its zip entry (/assets/images/<assetId>.<ext>), so a SQL row would just
-- be bookkeeping the same two facts a second time.
