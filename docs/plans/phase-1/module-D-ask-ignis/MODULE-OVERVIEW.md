# Module D — Ask IGNIS (RAG)

> **Purpose:** Build the retrieval-augmented AI research assistant.
> **Reference:** PRD v1.1 §19, §16.9 | DECISIONS.md D-005
> **v1.1 changes:** Scope resolution (scenario/experiment/story/global), source-role-aware retrieval, Earthdata content isolation.

## Tasks (7)
| Task | File | Summary |
|:---|:---|:---|
| D.1 | task-D1-embedding-pipeline.md | Generate embeddings for source chunks |
| D.2 | task-D2-vector-retrieval.md | pgvector retrieval with source-role filter (v1.1) |
| D.3 | task-D3-reranking.md | Rerank retrieved chunks |
| D.4 | task-D4-prompt-template.md | Grounded-answer prompt with scope resolution (v1.1) |
| D.5 | task-D5-low-evidence.md | Low-evidence fallback behavior |
| D.6 | task-D6-ask-endpoint.md | POST /ask endpoint with scope parameter (v1.1) |
| D.7 | task-D7-source-rendering.md | Response → UI rendering contract |

## Exit Condition (Gate 5)
- [ ] Ask IGNIS retrieves evidence before answering
- [ ] Sources and limitations are visible in response
- [ ] Low-evidence questions get honest insufficient-evidence response
- [ ] Earthdata content retrieved only when story context calls for it
