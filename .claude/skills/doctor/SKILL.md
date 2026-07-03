---
name: doctor
description: Use when the user says anything is broken, slow, weird, or not working — diagnose with the doctor script, then fix what it found.
---

# Doctor

1. Run `bin/ganesh doctor --machine`. The DOCTOR| lines tell you the
   first broken link.
2. Fix it yourself where possible (start Docker, rebuild, re-run setup steps
   from the setup skill). Only involve the user for clicks, installs, or
   sign-ins you can't do.
3. Re-run doctor until it passes, then tell them in one sentence what was
   wrong and that it's fixed.
4. Can't fix it? Run the get-help skill.
