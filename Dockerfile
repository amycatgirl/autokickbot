FROM node:20-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable
RUN mkdir -p /www/autokick
WORKDIR /www/autokick

COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm i --frozen-lockfile

CMD [ "node", "." ]
