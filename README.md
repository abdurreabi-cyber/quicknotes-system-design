# QuickNotes System Design

QuickNotes is a small browser-based notes client plus a system-design package for a proposed service that could support one million registered users.

The front end uses the JSONPlaceholder practice API to demonstrate GET, POST, and DELETE. JSONPlaceholder simulates create/delete operations, so those changes are not permanently stored on its server. The documents in `docs/` describe a separate production QuickNotes API and backend.

## Project files

- `index.html` - accessible HTML structure and note form.
- `style.css` - responsive styles and distinct success/error status states.
- `api.js` - reusable fetch helper, load/create/delete operations, validation, and error handling.
- [`docs/api-design.md`](docs/api-design.md) - REST endpoints, JSON examples, and error codes.
- [`docs/data-model.md`](docs/data-model.md) - relational entities, SQL schema, queries, indexes, and SQL/NoSQL decision.
- [`docs/architecture.md`](docs/architecture.md) - requirements, capacity estimate, architecture diagram, request flows, and trade-offs.

## How to run the API client

1. Download or clone this repository.
2. Open the project folder in VS Code.
3. Start a local static server. In VS Code, you can use the Live Server extension and select **Open with Live Server** on `index.html`.
4. Use **Load notes** to request the first 10 posts from `https://jsonplaceholder.typicode.com/posts`.
5. Enter a title (maximum 100 characters), optionally enter a body, and select **Create note**.
6. Select **Delete** on a note to send a DELETE request.

A network connection is required for the demo API. Opening the HTML file directly may work in some browsers, but using a local server is recommended. Do not put secrets or production credentials in this front-end project.

## Important demo limitation

JSONPlaceholder is a practice API. It returns simulated responses for POST and DELETE but does not permanently save those changes. The client updates the current browser list to demonstrate the user flow; refreshing the page returns to the server's sample data.

## What I learned

- How to use `fetch()` with GET, POST, and DELETE requests and check `response.ok`.
- How `async`/`await`, `try`/`catch`, and `finally` help handle loading and error states.
- How to validate user input and use `textContent` to safely insert user-provided text.
- How REST endpoints, relational database tables, and system architecture documents fit together.
- Why capacity estimates, replicas, caching, queues, and failure recovery matter when planning for growth.

## Git commit plan

The assignment requires at least five meaningful commits. Suggested sequence:

1. `Add initial HTML structure and form`
2. `Add responsive styling and status states`
3. `Add API client with GET`
4. `Add create note with POST`
5. `Add delete with DELETE`
6. `Add API design doc`
7. `Add data model doc`
8. `Add architecture doc`
9. `Add README and submission instructions`
