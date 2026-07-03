---
name: connect-apps
description: Use when the user wants Claude to work with another app or service — Blender, a video editor, a design tool, a database, or anything reachable through an MCP server.
---

# Connect Claude to other apps

Connections happen through "MCP servers" (never say that phrase to the user —
say "connector"). You run inside a container, which changes what works.
Figure out which case applies before promising anything. Run
`claude mcp add --help` to confirm exact syntax before using it.

## Case 1: Online services — works great

Remote connectors (an https URL). Add it for all future sessions:
`claude mcp add --transport http --scope user <name> <url>`
Sign-in happens right in the chat (the /mcp screen): the user opens a link
in their browser, like their first sign-in. It's saved in their settings and
survives restarts.

## Case 2: Apps running on their computer — often works

Programs like Blender run OUTSIDE this container: you cannot see their
windows or files directly. But many app connectors talk to the app over a
local network port, and the special address `host.docker.internal` reaches
the user's computer from in here.

1. Look up the app's connector (web search). Check two things: does the app
   side listen on a port (e.g. a Blender add-on with a "start server"
   button), and does the connector let you point it at a host/port (an env
   var or flag)?
2. Walk the user through the app-side part in plain words, one step at a
   time: install the add-on, click start.
3. Add the connector here, pointed at their computer, e.g.:
   `claude mcp add --scope user blender -e BLENDER_HOST=host.docker.internal -- uvx blender-mcp`
   (`npx …` and `uvx …` connectors both run in this container.)
4. Prove it with one tiny action ("add a cube") before building anything big.

If the connector insists on reading the app's files or launching the app
itself, it cannot work from in here — that's Case 3.

## Case 3: Needs full access to their computer — be honest

Some connections only work with Claude running directly on their computer,
outside this safe workspace. Don't fake it or half-connect it. Say: "This
one needs the repair-shop version of me. Open a terminal in the ganesh
folder, run `claude`, and ask there." That session has full computer access
but none of this workspace's safety rails — suggest they keep it short and
specific.

## Always

- One sentence on what you're connecting and why, before doing it.
- Test the connection with something trivial before relying on it.
- Record the connection (what, how, any port) in the project's
  `.ganesh/notes.md` so future sessions know it exists.
- If a connector needs a key or password, it goes into the connector's own
  sign-in flow or an env var at add-time — never into project files.
