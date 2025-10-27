
---
name: qdrant
description: Guidance for Qdrant vector database—collection design, payload schema, indexing/quantization, upserts, filters, hybrid search, batching, performance, and ops.
---

# Qdrant Skill

Use this Skill whenever tasks involve vector search, embedding storage, semantic filtering, or hybrid (metadata + vector) queries.

## When to use
- Designing collections and payload schemas for embeddings (e.g., TweetEval).
- Configuring vectors (size, distance), HNSW params, quantization (PQ/Scalar).
- Implementing upsert, search, filter, and scroll with batching.
- Optimizing recall/latency and managing snapshots/backups.

## Core concepts
- **Collection**: logical container for vectors and payload (metadata).
- **Vector config**:
  - `size`: embedding dimension (e.g., 384, 768, 1024).
  - `distance`: `Cosine` (typical for normalized embeddings), `Dot`, or `Euclid`.
- **HNSW index**: graph-based ANN; key params: `m`, `ef_construct`, `ef`.
- **Quantization**: Scalar or Product Quantization (PQ) to reduce memory; measure recall impact.

## Collection design
- One collection per **embedding type** and **task domain** if configs differ.
- Payload holds searchable metadata: labels, class, timestamp, author, etc.
- Add **payload indexes** for frequently filtered fields.

### Example create collection (HTTP)
```json
POST /collections/tweeteval_embeddings
{
  "vectors": {
    "size": 768,
    "distance": "Cosine"
  },
  "hnsw_config": {
    "m": 24,
    "ef_construct": 300
  },
  "optimizers_config": {
    "default_segment_number": 2
  },
  "quantization_config": {
    "scalar": {
      "type": "int8"
    }
  }
}
````

### Example payload index

```json
PUT /collections/tweeteval_embeddings/index
{
  "field_name": "label",
  "field_schema": "keyword"
}
```

## Upsert & batching

* Prefer **upsert** with deterministic `id`.
* Batch in chunks (e.g., 512–2k vectors) to balance throughput and memory.
* Set `wait=true` for synchronous acknowledgement when needed.

```json
PUT /collections/tweeteval_embeddings/points?wait=true
{
  "points": [
    {
      "id": "tweet_123",
      "vector": [/* 768 floats */],
      "payload": {
        "label": "joy",
        "lang": "en",
        "created_at": "2025-01-02T12:00:00Z",
        "user_id": 42
      }
    }
  ]
}
```

## Search & filters

* **Vector search**:

  * Provide normalized vectors for `Cosine`.
  * Tune runtime `ef` per query for recall/latency trade-off.
* **Filters**:

  * Use payload filters to narrow candidates (e.g., `label == "joy"`, `lang in ["en","es"]`).
* **Hybrid search**:

  * Combine vector similarity with keyword filtering via payload indexes.
  * For text + vector hybrid ranking, pre-rank with BM25 externally or use re-ranking in the app layer.

### Example search with filter

```json
POST /collections/tweeteval_embeddings/points/search
{
  "vector": [/* 768 floats */],
  "limit": 20,
  "with_payload": true,
  "params": { "hnsw_ef": 128 },
  "filter": {
    "must": [
      { "key": "label", "match": { "value": "joy" } },
      { "key": "lang", "match": { "any": ["en","es"] } }
    ]
  }
}
```

## Updates & deletes

* Use **upsert** for idempotent updates.
* For soft deletes, mark payload (e.g., `deleted=true`) then schedule hard deletes.

## Performance tuning

* Start HNSW: `m=16–32`, `ef_construct=200–400`. Higher → better recall, slower build.
* Query-time `ef`: 64–256; increase until recall plateau.
* Consider **PQ** for large collections; measure **Recall@k** before/after.
* If memory bound, enable **on-disk payloads** and quantization; if IO bound, adjust segment counts and storage class.

## Evaluation

* Measure: **P95 latency**, **Recall@k**, **QPS** under representative filters.
* Build a small regression harness comparing parameter sets (m/ef/quantization).

## Consistency & durability

* Snapshots for backups; restore tested regularly.
* If using distributed deployments, align **replication factor** with SLA.
* Keep client timeouts reasonable; implement simple **retry** strategy for writes.

## Troubleshooting

* Poor recall: raise `ef`, verify vector normalization, check quantization settings.
* Slow queries: reduce payload size returned (`with_payload=false` or selective), raise `ef` carefully, add payload indexes to narrow candidates.
* Memory pressure: enable scalar/PQ, increase segments, verify deletion compaction.

## Safety guardrails

* Creating/dropping collections only with explicit user confirmation and snapshot taken.
* Bulk deletes performed via **soft delete + background compaction**.
* Always document parameter changes (m/ef/quantization) with before/after metrics.

```
```
````markdown
# .claude/skills/postgresql/SKILL.md
---
name: postgresql
description: Practical guidance for schema design, migrations, ops, testing, and performance in PostgreSQL for FastAPI + SQLAlchemy + Alembic projects. Includes safe-ops guardrails.
---

# PostgreSQL Skill

Use this Skill whenever tasks involve relational data modeling, migrations, SQLAlchemy ORM, or database ops.

## When to use
- Designing/altering tables, constraints, indexes.
- Writing SQLAlchemy models, queries, transactions.
- Creating Alembic migrations.
- Optimizing slow queries or diagnosing locks.

## Golden rules (quick)
- Prefer **explicit constraints**: `NOT NULL`, `CHECK`, `UNIQUE`, FK with `ON DELETE ...`.
- Use **surrogate PKs** (`BIGSERIAL`/`GENERATED BY DEFAULT AS IDENTITY`) + **natural keys** as `UNIQUE`.
- Always add **indexes that match your access patterns**; measure before/after with `EXPLAIN (ANALYZE, BUFFERS)`.
- Keep migrations **idempotent** and **reversible** where possible.
- Default all writes in the app to **transactions** with **READ COMMITTED** unless you require stricter isolation.

## Connection & env
- DSN shape: `postgresql+psycopg://user:pass@host:5432/dbname`
- Use **connection pooling** in production (e.g., SQLAlchemy `QueuePool`).
- Set `statement_timeout` (e.g., 5–15s) and `idle_in_transaction_session_timeout`.

## Schema & modeling
- Timestamps: `created_at TIMESTAMPTZ DEFAULT now()`, `updated_at TIMESTAMPTZ`.
- Soft delete: `deleted_at TIMESTAMPTZ NULL` (index if frequently filtered).
- Status enums: Postgres `ENUM` or lookup table; prefer lookup table for portability.
- JSONB for semi-structured fields; index with `GIN` (`jsonb_path_ops`) when filtered.

### Example SQLAlchemy model
```py
from sqlalchemy import (
    Column, BigInteger, Text, Enum, Boolean, DateTime, func, ForeignKey, CheckConstraint, Index
)
from sqlalchemy.orm import relationship, Mapped, mapped_column, declarative_base

Base = declarative_base()

class Task(Base):
    __tablename__ = "tasks"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[str] = mapped_column(Enum("low", "medium", "high", name="priority_enum"), nullable=False, server_default="medium")
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    is_done: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    created_at: Mapped = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint("length(title) BETWEEN 1 AND 280", name="tasks_title_len_ck"),
        Index("ix_tasks_owner_done", "owner_id", "is_done"),
    )
````

## Alembic migrations

* **Never** hand-edit autogenerate outputs without reviewing diffs.
* For large tables: use **concurrent indexes** (`op.execute("CREATE INDEX CONCURRENTLY ...")`) in separate migration.
* Add **downgrade** when feasible; if not, explain why in comments.

### Example autogenerate flow

```bash
alembic revision --autogenerate -m "add priority to tasks"
alembic upgrade head
```

### Concurrent index template

```py
def upgrade() -> None:
    op.execute("CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_tasks_owner_done ON tasks(owner_id, is_done)")
def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_tasks_owner_done")
```

## Query patterns

* Paginate with keyset when possible:

```sql
-- keyset: where (owner_id, id) > (:owner_id, :cursor_id) order by owner_id, id
```

* Use **`SELECT ... FOR UPDATE SKIP LOCKED`** for work queues.
* Use **CTEs** for readability; benchmark as they can be optimization fences pre-PG12.

## Transactions & isolation

* Default `READ COMMITTED`.
* For race-free counters or balance transfers, use **`SERIALIZABLE`** or row-level locks with **`FOR UPDATE`**.

## Testing (pytest)

* Use **transactional tests** with rollbacks.
* Seed minimal fixtures; avoid global mutable state.
* Validate migrations with a **migration test**: start at base, `upgrade head`, assert schema.

## Performance checklist

* Add the **right index** (btree for equality/sorting; **GIN** for JSONB containment; **GiST/SP-GiST** for geo; **BRIN** for append-only large tables).
* Keep **rows narrow**; avoid unbounded `TEXT` on hot tables.
* Vacuum & analyze; tune `work_mem`, `shared_buffers`, `effective_cache_size` sensibly.

## Ops & safety

* Backups: periodic **base backups + WAL archiving**; verify restores.
* Use **`pg_stat_activity`** to find blockers.
* Never run destructive ops during peak hours; wrap in feature flags/migrations.

### Dangerous ops guardrail

* Dropping columns/tables or changing NULLability on big tables must be:

  1. reviewed,
  2. tested on a clone,
  3. executed off-peak,
  4. accompanied by backups and a rollback plan.

````

```markdown
# .claude/skills/qdrant/SKILL.md
---
name: qdrant
description: Guidance for Qdrant vector database—collection design, payload schema, indexing/quantization, upserts, filters, hybrid search, batching, performance, and ops.
---

# Qdrant Skill

Use this Skill whenever tasks involve vector search, embedding storage, semantic filtering, or hybrid (metadata + vector) queries.

## When to use
- Designing collections and payload schemas for embeddings (e.g., TweetEval).
- Configuring vectors (size, distance), HNSW params, quantization (PQ/Scalar).
- Implementing upsert, search, filter, and scroll with batching.
- Optimizing recall/latency and managing snapshots/backups.

## Core concepts
- **Collection**: logical container for vectors and payload (metadata).
- **Vector config**:
  - `size`: embedding dimension (e.g., 384, 768, 1024).
  - `distance`: `Cosine` (typical for normalized embeddings), `Dot`, or `Euclid`.
- **HNSW index**: graph-based ANN; key params: `m`, `ef_construct`, `ef`.
- **Quantization**: Scalar or Product Quantization (PQ) to reduce memory; measure recall impact.

## Collection design
- One collection per **embedding type** and **task domain** if configs differ.
- Payload holds searchable metadata: labels, class, timestamp, author, etc.
- Add **payload indexes** for frequently filtered fields.

### Example create collection (HTTP)
```json
POST /collections/tweeteval_embeddings
{
  "vectors": {
    "size": 768,
    "distance": "Cosine"
  },
  "hnsw_config": {
    "m": 24,
    "ef_construct": 300
  },
  "optimizers_config": {
    "default_segment_number": 2
  },
  "quantization_config": {
    "scalar": {
      "type": "int8"
    }
  }
}
````

### Example payload index

```json
PUT /collections/tweeteval_embeddings/index
{
  "field_name": "label",
  "field_schema": "keyword"
}
```

## Upsert & batching

* Prefer **upsert** with deterministic `id`.
* Batch in chunks (e.g., 512–2k vectors) to balance throughput and memory.
* Set `wait=true` for synchronous acknowledgement when needed.

```json
PUT /collections/tweeteval_embeddings/points?wait=true
{
  "points": [
    {
      "id": "tweet_123",
      "vector": [/* 768 floats */],
      "payload": {
        "label": "joy",
        "lang": "en",
        "created_at": "2025-01-02T12:00:00Z",
        "user_id": 42
      }
    }
  ]
}
```

## Search & filters

* **Vector search**:

  * Provide normalized vectors for `Cosine`.
  * Tune runtime `ef` per query for recall/latency trade-off.
* **Filters**:

  * Use payload filters to narrow candidates (e.g., `label == "joy"`, `lang in ["en","es"]`).
* **Hybrid search**:

  * Combine vector similarity with keyword filtering via payload indexes.
  * For text + vector hybrid ranking, pre-rank with BM25 externally or use re-ranking in the app layer.

### Example search with filter

```json
POST /collections/tweeteval_embeddings/points/search
{
  "vector": [/* 768 floats */],
  "limit": 20,
  "with_payload": true,
  "params": { "hnsw_ef": 128 },
  "filter": {
    "must": [
      { "key": "label", "match": { "value": "joy" } },
      { "key": "lang", "match": { "any": ["en","es"] } }
    ]
  }
}
```

## Updates & deletes

* Use **upsert** for idempotent updates.
* For soft deletes, mark payload (e.g., `deleted=true`) then schedule hard deletes.

## Performance tuning

* Start HNSW: `m=16–32`, `ef_construct=200–400`. Higher → better recall, slower build.
* Query-time `ef`: 64–256; increase until recall plateau.
* Consider **PQ** for large collections; measure **Recall@k** before/after.
* If memory bound, enable **on-disk payloads** and quantization; if IO bound, adjust segment counts and storage class.

## Evaluation

* Measure: **P95 latency**, **Recall@k**, **QPS** under representative filters.
* Build a small regression harness comparing parameter sets (m/ef/quantization).

## Consistency & durability

* Snapshots for backups; restore tested regularly.
* If using distributed deployments, align **replication factor** with SLA.
* Keep client timeouts reasonable; implement simple **retry** strategy for writes.

## Troubleshooting

* Poor recall: raise `ef`, verify vector normalization, check quantization settings.
* Slow queries: reduce payload size returned (`with_payload=false` or selective), raise `ef` carefully, add payload indexes to narrow candidates.
* Memory pressure: enable scalar/PQ, increase segments, verify deletion compaction.

## Safety guardrails

* Creating/dropping collections only with explicit user confirmation and snapshot taken.
* Bulk deletes performed via **soft delete + background compaction**.
* Always document parameter changes (m/ef/quantization) with before/after metrics.
