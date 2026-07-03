FROM node:22-bookworm

ARG CLAUDE_CODE_VERSION
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    CLAUDE_CONFIG_DIR=/home/node/.claude \
    GANESH_CONTAINER=1

RUN npm install -g "@anthropic-ai/claude-code@${CLAUDE_CODE_VERSION}" "@playwright/mcp@0.0.77" \
    && npx -y "playwright@1.62.0-alpha-2026-06-29" install --with-deps chromium \
    && chmod -R a+rX /ms-playwright

# uv/uvx: lets Python-based MCP connectors (e.g. app bridges) run in-container.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

USER node
WORKDIR /workspace
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["sleep", "infinity"]
