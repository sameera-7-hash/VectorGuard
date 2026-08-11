# VectorGuard
### AI-Driven Threat Triangle Using Native In-Database Vector Search

## Overview
VectorGuard is a threat-detection system that uses **native in-database vector search**
(e.g., PostgreSQL + pgvector) to identify security threats by comparing embedded
representations of system events — logs, network traffic, and user behavior — against
known threat patterns, without relying on a separate standalone vector database.

The "Threat Triangle" refers to three correlated data sources analyzed together to
improve detection accuracy and reduce false positives:

1. **System / Application Logs** — anomalies in log sequences and events
2. **Network Traffic Data** — suspicious flow patterns, connections, packet behavior
3. **User Behavior Data** — deviations from normal access/usage patterns

By vectorizing and storing all three directly inside the database, VectorGuard avoids
the complexity and latency of syncing data across a separate vector store and a
relational store.

## Motivation
Existing work tends to fall into one of two buckets:
- Log/anomaly detection research that never uses vector databases (relies on
  in-memory classifiers or deep learning models).
- Vector database research that covers cybersecurity conceptually but doesn't
  implement a native, in-database applied system.

VectorGuard aims to sit between these: an applied system that uses native in-DB
vector search as the core retrieval mechanism for multi-source threat detection.

## Planned Architecture
```
[Log Data] [Network Data] [User Behavior Data]
        \        |         /
         v       v        v
        Embedding Pipeline (sentence-transformers)
                 |
                 v
      PostgreSQL + pgvector (native in-DB vector store)
                 |
                 v
     Similarity Search / Anomaly Scoring (KNN, thresholding)
                 |
                 v
        Alert Dashboard (Streamlit / FastAPI)
```

## Tech Stack
| Component | Choice | Why |
|---|---|---|
| Database | PostgreSQL + pgvector | Native in-DB vector search, avoids separate vector DB, mature ecosystem |
| Embeddings | sentence-transformers | Lightweight, no external API dependency, good baseline performance |
| Classical ML baseline | scikit-learn (KNN, Decision Tree) | Prior work shows simple models often match/beat deep learning on anomaly detection |
| API/Dashboard | FastAPI + Streamlit | Quick to stand up for demo purposes |

## Project Status
🚧 **Early stage — architecture and literature review phase.**
See `progress_review.md` (or the Progress Review tab in the project spreadsheet) for
current milestones.

## Getting Started
```bash
# 1. Clone the repository
git clone <repo-url>
cd vectorguard

# 2. Create a virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up PostgreSQL with pgvector
#    (requires PostgreSQL 13+ and the pgvector extension installed)
psql -c "CREATE EXTENSION IF NOT EXISTS vector;"

# 5. Configure environment variables
cp .env.example .env
# edit .env with your database credentials

# 6. Run the pipeline (once implemented)
python src/main.py
```

## Repository Structure (planned)
```
vectorguard/
├── data/                # sample/raw datasets (not committed)
├── src/
│   ├── ingestion/        # data loading & preprocessing
│   ├── embeddings/       # embedding generation
│   ├── db/               # pgvector schema, connection, queries
│   ├── detection/        # similarity search & scoring logic
│   └── dashboard/        # Streamlit/FastAPI app
├── notebooks/            # exploratory analysis
├── tests/
├── requirements.txt
└── README.md
```

## Datasets (candidates)
- HDFS / BGL log datasets (log-based anomaly detection)
- CICIDS2017 or UNSW-NB15 (network traffic threat detection)

## References
Key papers informing this project are listed in the literature review spreadsheet
(`VectorGuard_Literature_Review.xlsx`), including work on log-based anomaly detection,
vector database management systems in cybersecurity, and native in-database vector
search performance.

## Team
_Add team member names here._

## License
_Add license here (e.g., MIT), or leave as coursework/academic project._
