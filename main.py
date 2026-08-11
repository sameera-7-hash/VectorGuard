"""
VectorGuard - Proof of Concept Pipeline
=========================================
Demonstrates the core end-to-end mechanism VectorGuard relies on:

    1. Take sample "threat triangle" events (log / network / user-behavior text)
    2. Convert each event into a vector embedding
    3. Store the embeddings natively inside PostgreSQL using pgvector
    4. Run a similarity search to find events closest to a new/incoming event
       (this is the core "threat detection via nearest-neighbor" mechanism)

This is intentionally minimal — it is meant to prove the pipeline works end-to-end
on toy data before building out ingestion, real datasets, and the dashboard.

Requirements:
    pip install -r requirements.txt
    PostgreSQL running locally with the pgvector extension installed:
        CREATE EXTENSION IF NOT EXISTS vector;

Usage:
    python main.py
"""

import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import execute_values
from sentence_transformers import SentenceTransformer

load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", "5432"),
    "dbname": os.getenv("DB_NAME", "vectorguard"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "postgres"),
}

EMBEDDING_MODEL = "all-MiniLM-L6-v2"   # small, fast, good baseline
EMBEDDING_DIM = 384                    # output dimension of the model above

# ---------------------------------------------------------------------------
# Sample "Threat Triangle" events — placeholders for real log / network /
# user-behavior records that will later come from actual datasets
# ---------------------------------------------------------------------------
SAMPLE_EVENTS = [
    {"source": "log",      "text": "Failed login attempt for user admin from unknown host repeated 5 times"},
    {"source": "log",      "text": "User session started normally, credentials verified"},
    {"source": "network",  "text": "Unusual outbound traffic spike to unrecognized external IP on port 4444"},
    {"source": "network",  "text": "Standard HTTPS traffic to known internal service"},
    {"source": "behavior", "text": "User accessed sensitive files outside of normal working hours"},
    {"source": "behavior", "text": "User performed routine file access consistent with daily pattern"},
]

# A new incoming event we want to check against stored events
QUERY_EVENT = "Multiple failed login attempts followed by access to sensitive files at 3am"


def get_connection():
    """Open a connection to PostgreSQL."""
    return psycopg2.connect(**DB_CONFIG)


def setup_schema(conn):
    """Create the pgvector extension and the events table if they don't exist."""
    with conn.cursor() as cur:
        cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        cur.execute(f"""
            CREATE TABLE IF NOT EXISTS threat_events (
                id SERIAL PRIMARY KEY,
                source TEXT NOT NULL,
                event_text TEXT NOT NULL,
                embedding VECTOR({EMBEDDING_DIM})
            );
        """)
    conn.commit()


def embed_texts(model, texts):
    """Convert a list of strings into embedding vectors."""
    return model.encode(texts, convert_to_numpy=True).tolist()


def insert_events(conn, model, events):
    """Embed sample events and insert them into the pgvector table."""
    texts = [e["text"] for e in events]
    embeddings = embed_texts(model, texts)

    rows = [
        (e["source"], e["text"], emb)
        for e, emb in zip(events, embeddings)
    ]

    with conn.cursor() as cur:
        execute_values(
            cur,
            "INSERT INTO threat_events (source, event_text, embedding) VALUES %s",
            rows,
            template="(%s, %s, %s::vector)",
        )
    conn.commit()
    print(f"Inserted {len(rows)} sample events into threat_events.")


def find_similar_events(conn, model, query_text, top_k=3):
    """
    Core detection mechanism: embed the incoming event and run a
    nearest-neighbor similarity search directly inside the database.
    """
    query_embedding = embed_texts(model, [query_text])[0]

    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT source, event_text, embedding <-> %s::vector AS distance
            FROM threat_events
            ORDER BY distance ASC
            LIMIT %s;
            """,
            (query_embedding, top_k),
        )
        results = cur.fetchall()

    return results


def main():
    print("Loading embedding model...")
    model = SentenceTransformer(EMBEDDING_MODEL)

    print("Connecting to database...")
    conn = get_connection()

    print("Setting up schema (pgvector extension + table)...")
    setup_schema(conn)

    print("Embedding and inserting sample threat-triangle events...")
    insert_events(conn, model, SAMPLE_EVENTS)

    print(f"\nQuerying for events similar to:\n  \"{QUERY_EVENT}\"\n")
    results = find_similar_events(conn, model, QUERY_EVENT, top_k=3)

    print("Top matches (closer to 0 = more similar):")
    for source, text, distance in results:
        print(f"  [{source}] distance={distance:.4f} -> {text}")

    conn.close()


if __name__ == "__main__":
    main()
