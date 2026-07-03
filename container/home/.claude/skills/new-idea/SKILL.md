---
name: new-idea
description: Use when the user wants to start a new app or project — walks from idea to running app with plain-English planning and approval first.
---

# New idea → running app

1. **Understand.** Ask one question at a time (5–7 max): what should it do,
   who uses it, what's the one thing it must get right, any look-and-feel
   wishes. Reflect their answers back in their own words.
2. **Plan.** Present a short plan in plain English: what it will do (bullet
   list), what the screens look like (simple ASCII sketches), and what you'll
   build first. No tech talk. Ask: "Want me to build this?"
3. **Set up.** After approval: create /workspace/projects/<kebab-name>,
   run `git init` inside it, write .ganesh/notes.md (first line = status
   sentence), scaffold the stack you chose per the building rules.
4. **Build the first slice.** Smallest end-to-end version first — one screen
   that really works beats five that don't. Test as you go.
5. **Show it.** Start the dev server on port 3000, take a Playwright
   screenshot, show it in chat, then: "Open http://localhost:3000 in your
   browser." Iterate on their reactions.
6. **Wrap.** When they're happy or done for now, follow the finish-up skill.
