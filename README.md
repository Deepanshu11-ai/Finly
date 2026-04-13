# PolicyPilot 🛡️

> **AI-powered insurance analysis platform** — transform complex policy documents into clear, actionable insights.

PolicyPilot helps users understand, evaluate, and compare insurance policies with confidence. It leverages advanced AI to extract coverage details, detect hidden clauses, simulate real-life scenarios, and predict claim approval likelihood — turning dense legal documents into plain-language decisions.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture & Integrations](#architecture--integrations)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Project Structure](#project-structure)

---

## Features

| Feature | Description |
|---|---|
| **Coverage Analysis** | Automatically extracts what is and isn't covered by a policy |
| **Ask AI** | Natural language Q&A directly over your uploaded policy documents |
| **Scenario Simulation** | Test real-life scenarios against policy terms before filing a claim |
| **Claim Prediction** | ML model estimates claim approval likelihood based on policy features |
| **Hidden Clause Detection** | Flags ambiguous or disadvantageous clauses buried in fine print |
| **Policy Comparison** | Side-by-side intelligent comparison across multiple policies |

---

## Tech Stack

**Backend**
- [Django](https://www.djangoproject.com/) & Django REST Framework

**Frontend**
- HTML, CSS, JavaScript

**AI / ML**
- [LangChain](https://langchain.com/) — RAG (Retrieval-Augmented Generation) pipeline
- [HuggingFace Embeddings](https://huggingface.co/) — document vectorization
- [Scikit-learn](https://scikit-learn.org/) — claim prediction ML model

**Infrastructure**
- [ChromaDB](https://www.trychroma.com/) — vector database for document storage and retrieval
- [Groq (LLaMA 3)](https://groq.com/) — LLM inference for reasoning and generation

---

## Architecture & Integrations

PolicyPilot combines three AI layers into a unified pipeline:

```
PDF Upload → Chunking & Embedding (HuggingFace)
                      ↓
            Vector Store (ChromaDB)
                      ↓
         RAG Query + LLM Reasoning (Groq / LLaMA 3)
                      ↓
         Claim Prediction (Scikit-learn ML Model)
```

**Groq API** handles all LLM-based tasks: question answering, coverage extraction, hidden clause detection, and feature explanation.

**HuggingFace Models** generate semantic embeddings for accurate document retrieval.

**ChromaDB** stores and indexes policy document chunks, enabling fast similarity search during RAG queries.

---

## Getting Started

### Prerequisites

- Python 3.9+
- pip
- A [Groq API key](https://console.groq.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/policypilot.git
cd policypilot
```

### 2. Create a Virtual Environment

```bash
python -m venv .venv

# macOS / Linux
source .venv/bin/activate

# Windows
.venv\Scripts\activate
```

### 3. Install Dependencies

```bash
cd insurance_ai

pip install -r requirements.txt
```

### 4. Apply Database Migrations

```bash
python manage.py migrate
```

### 5. Train the ML Model

> **One-time step.** Required before using the Claim Prediction feature.

```bash
python core/ml/train.py
```

### 8. Start the Development Server

```bash
python manage.py runserver
```

The application will be available at **[http://127.0.0.1:8000](http://127.0.0.1:8000)**.

---

## Usage

1. **Upload a Policy** — Upload any insurance policy in PDF format.
2. **Set Active Policy** — Select the uploaded policy as your active document.
3. **Explore Features** — Use the sidebar to navigate Coverage Analysis, Ask AI, Scenario Simulation, Claim Prediction, Hidden Clauses, and Policy Comparison.

---

## Project Structure

```
policypilot/
├── core/
│   ├── ml/
│   │   └── train.py          # ML model training script
│   ├── rag/                  # LangChain RAG pipeline
│   └── views.py
├── templates/                # HTML frontend templates
├── static/                   # CSS and JS assets
├── manage.py
├── requirements.txt
└── .env                      # Environment variables (not committed)
```

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## License

This project is licensed under the [MIT License](LICENSE).
