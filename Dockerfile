# ── Stage 1: Build Frontend ──────────────────────────────────────
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Build Backend ───────────────────────────────────────
FROM golang:1.25-alpine AS backend-build
WORKDIR /app/backend
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server .

# ── Stage 3: Final minimal image ────────────────────────────────
FROM alpine:3.21
RUN apk add --no-cache ca-certificates
WORKDIR /app

# Copy compiled backend binary
COPY --from=backend-build /app/backend/server .

# Copy frontend build output
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

EXPOSE 8080

ENTRYPOINT ["./server"]
