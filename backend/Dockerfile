FROM denoland/deno:latest

WORKDIR /app

COPY deno.json .
COPY deno.lock .

RUN deno install

COPY . .

EXPOSE 9999

CMD ["deno", "task", "dev"]