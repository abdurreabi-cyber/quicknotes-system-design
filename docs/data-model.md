# QuickNotes Data Model

## Entities and relationships

- **users**: one user can own many notes. This is a one-to-many relationship.
- **notes**: each note belongs to one user and can be linked to multiple tags.
- **tags**: tags are owned by a user and can be reused across that user's notes.
- **note_tags**: junction table joining notes and tags. It implements the many-to-many relationship between notes and tags.

All timestamps are stored in UTC. The schema below uses PostgreSQL syntax.

## Tables and keys

| Table | Important columns | Keys |
|---|---|---|
| `users` | `id UUID`, `email VARCHAR(255)`, `password_hash TEXT`, `created_at TIMESTAMPTZ` | PK `id`, unique `email` |
| `notes` | `id UUID`, `user_id UUID`, `title VARCHAR(100)`, `body TEXT`, timestamps | PK `id`, FK `user_id` → `users.id` |
| `tags` | `id UUID`, `user_id UUID`, `name VARCHAR(50)`, `created_at TIMESTAMPTZ` | PK `id`, FK `user_id` → `users.id`, unique `(user_id, name)` |
| `note_tags` | `note_id UUID`, `tag_id UUID`, `created_at TIMESTAMPTZ` | Composite PK `(note_id, tag_id)`, FKs to `notes.id` and `tags.id` |

## CREATE TABLE statements

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tags_user_name UNIQUE (user_id, name)
);

CREATE TABLE note_tags (
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (note_id, tag_id)
);

CREATE INDEX idx_notes_user_updated ON notes (user_id, updated_at DESC);
CREATE INDEX idx_note_tags_tag ON note_tags (tag_id);
```

## Example SQL queries

1. List the most recently updated notes for one user:

```sql
SELECT id, title, body, updated_at
FROM notes
WHERE user_id = '00000000-0000-0000-0000-000000000001'
ORDER BY updated_at DESC
LIMIT 20;
```

2. Find notes tagged `work` (JOIN example):

```sql
SELECT n.id, n.title, n.updated_at
FROM notes AS n
JOIN note_tags AS nt ON nt.note_id = n.id
JOIN tags AS t ON t.id = nt.tag_id
WHERE n.user_id = '00000000-0000-0000-0000-000000000001'
  AND t.name = 'work'
ORDER BY n.updated_at DESC;
```

3. Count notes for each user:

```sql
SELECT u.id, u.email, COUNT(n.id) AS note_count
FROM users AS u
LEFT JOIN notes AS n ON n.user_id = u.id
GROUP BY u.id, u.email
ORDER BY note_count DESC;
```

## Index rationale

`idx_notes_user_updated (user_id, updated_at DESC)` supports the common operation of listing a user's notes in newest-updated-first order. It narrows the rows by user and avoids an extra sort for many list queries. The `note_tags(tag_id)` index helps look up notes for a selected tag.

## SQL vs NoSQL decision

A relational SQL database such as PostgreSQL is a good fit because users, notes, and tags have clear relationships and need referential integrity. Transactions help keep note creation and tag assignments consistent. The schema can be indexed and read replicas can support read-heavy traffic. A NoSQL store could be useful later for specific high-volume or flexible data, but it is not necessary for this core data model.
