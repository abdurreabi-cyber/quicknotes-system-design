# QuickNotes REST API Design

This document describes the proposed **real QuickNotes backend**, not the JSONPlaceholder practice service used by the browser demo.

## Base URL and conventions

- Base URL: `https://api.quicknotes.example/v1`
- Content type: `application/json`
- Authentication: bearer access token for endpoints marked protected.
- IDs are UUIDs in the production API.
- Dates use ISO 8601 UTC timestamps.

## Endpoint summary

| Method | Path | Description | Success status |
|---|---|---|---:|
| POST | `/auth/register` | Create a user account | 201 Created |
| POST | `/auth/login` | Authenticate and return tokens | 200 OK |
| GET | `/notes` | List the signed-in user's notes; supports `limit`, `cursor`, and `tag` | 200 OK |
| POST | `/notes` | Create a note for the signed-in user | 201 Created |
| GET | `/notes/{noteId}` | Retrieve one note owned by the signed-in user | 200 OK |
| PATCH | `/notes/{noteId}` | Update selected fields of a note | 200 OK |
| DELETE | `/notes/{noteId}` | Delete a note owned by the signed-in user | 204 No Content |
| PUT | `/notes/{noteId}/tags/{tagId}` | Attach an existing tag to a note | 204 No Content |
| DELETE | `/notes/{noteId}/tags/{tagId}` | Remove a tag from a note | 204 No Content |

## List notes

`GET /v1/notes?limit=20&cursor=eyJpZCI6...`

Example response (`200 OK`):

```json
{
  "data": [
    {
      "id": "9e9df35b-1fb3-4c61-8b0b-2a62d5e2a001",
      "title": "Prepare weekly report",
      "body": "Collect the latest figures.",
      "tags": ["work"],
      "createdAt": "2026-10-14T08:30:00Z",
      "updatedAt": "2026-10-14T08:30:00Z"
    }
  ],
  "page": { "nextCursor": null, "hasMore": false }
}
```

## Create a note

`POST /v1/notes`

Request:

```json
{
  "title": "Prepare weekly report",
  "body": "Collect the latest figures.",
  "tagIds": ["a7b7a6e1-b58a-4c50-9a12-2e84f39ab111"]
}
```

Response (`201 Created`):

```json
{
  "data": {
    "id": "9e9df35b-1fb3-4c61-8b0b-2a62d5e2a001",
    "title": "Prepare weekly report",
    "body": "Collect the latest figures.",
    "createdAt": "2026-10-14T08:30:00Z",
    "updatedAt": "2026-10-14T08:30:00Z"
  }
}
```

## Error responses

| Status | Meaning | Typical cause |
|---:|---|---|
| 400 | Bad Request | Invalid JSON, missing title, or title over 100 characters |
| 401 | Unauthorized | Missing, expired, or invalid token |
| 403 | Forbidden | User is authenticated but lacks permission |
| 404 | Not Found | Note or tag does not exist, or is not visible to the user |
| 409 | Conflict | Duplicate or conflicting operation |
| 422 | Unprocessable Entity | Valid JSON that fails business validation |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server-side failure |
| 503 | Service Unavailable | Service temporarily unavailable |

Example error body (`400 Bad Request`):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The title is required and must be 100 characters or fewer.",
    "details": [{ "field": "title", "issue": "required" }],
    "requestId": "req_01J9ABCDEF"
  }
}
```

## API behaviour

- Only the authenticated owner can read, update, or delete a note.
- List responses are paginated to prevent unbounded responses.
- The server validates inputs even when the client also validates them.
- `DELETE` returns `204` only after the delete operation succeeds.
- Errors use a stable machine-readable `code` and a human-readable `message`.
