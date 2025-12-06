#!/bin/bash
# Wait for PostgreSQL to be ready
# Usage: ./wait-for-db.sh HOST PORT [TIMEOUT]

set -e

host="$1"
port="$2"
timeout="${3:-30}"

echo "Waiting for PostgreSQL at $host:$port (timeout: ${timeout}s)..."

counter=0
while [ $counter -lt $timeout ]; do
  if nc -z "$host" "$port" 2>/dev/null; then
    echo "PostgreSQL is ready!"
    exit 0
  fi
  counter=$((counter + 1))
  sleep 1
done

echo "PostgreSQL did not become ready within ${timeout} seconds"
exit 1
