# Infernity

> A document intelligence platform for querying PDFs using natural language.
> [Demo](https://www.linkedin.com/posts/bjkhapung_reading-a-40-page-document-is-pain-so-i-ugcPost-7439549968111079424-3-Rk?utm_source=share&utm_medium=member_desktop&rcm=ACoAADq7escBNGdy7HXNd66vfpuWbQaQ5XvSGrI)

---

## Overview

Infernity lets you upload PDF documents and ask questions about them in plain English. Instead of skimming through pages manually, you get precise, context-aware answers — with the exact source passages highlighted so you always know where the information came from.

## Features

- **Natural Language Querying** — Ask questions about your documents the way you'd ask a person.
- **RAG Architecture** — Retrieval-Augmented Generation ensures answers are grounded in your actual document content, not hallucinated.
- **Vector Database Integration** — Documents are chunked and embedded for fast, semantically accurate retrieval.
- **Chunk Highlighting** — Every answer surfaces the exact source passages it was derived from, directly in the document, building transparency and trust.

## How It Works

1. **Upload** a PDF document.
2. The document is **chunked and embedded** into a vector database.
3. You **ask a question** in natural language.
4. Relevant chunks are **retrieved** from the vector store based on semantic similarity.
5. An LLM **generates an answer** using only the retrieved context.
6. The source chunks are **highlighted** in the original document so you can verify every response.

---

Built with curiosity and too many PDFs.
