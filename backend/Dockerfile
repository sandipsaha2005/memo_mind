FROM denoland/deno:latest

WORKDIR /app
COPY . .
RUN deno cache main.ts
CMD ["deno", "run", "--allow-ffi", "--allow-net", "--allow-env", "--allow-read", "--allow-sys", "main.ts"]