# PolicyPilot

Insurance policies are dense, opaque, and full of traps. PolicyPilot turns any PDF into plain-language coverage summaries, flags risky clauses, simulates real-life claims, and predicts approval — before you need to file.

![Python](https://img.shields.io/badge/Python-3.10-blue)
![Django](https://img.shields.io/badge/Django-Backend-green)
![AI](https://img.shields.io/badge/AI-RAG%20%2B%20ML-orange)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

## What it does

| Feature | Description |
|---|---|
| **Coverage Analysis** | Extracts what's covered, excluded, and conditional — structured, scannable, and plain-English. |
| **Ask AI** | Natural language Q&A over your uploaded policy. Ask anything, get grounded answers. |
| **Scenario Simulation** | Describe a situation. See whether it's covered — before you file. |
| **Claim Prediction** | ML model estimates approval likelihood based on your scenario and policy terms. |
| **Hidden Clause Detection** | Surfaces ambiguous, restrictive, or risky language buried in the fine print. |
| **Policy Comparison** | Upload multiple policies. Get a side-by-side breakdown of what each one actually offers. |

---

## Architecture

```
PDF Upload → Chunk & Embed (HuggingFace)
                      ↓
            Vector Store (ChromaDB)
                      ↓
       RAG + LLM Reasoning (Groq / LLaMA 3)
                      ↓
        ML Prediction (scikit-learn)
```

---

## Stack

**Backend** — Django, Django REST Framework

**Frontend** — HTML, CSS, JavaScript

**AI / ML** — LangChain, HuggingFace Embeddings, scikit-learn

**Infrastructure** — ChromaDB, Groq API (LLaMA 3)

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload-policy/` | Upload a policy PDF |
| `GET` | `/api/coverage/` | Get coverage details |
| `POST` | `/api/ask/` | Ask a question about the policy |
| `POST` | `/api/simulate/` | Test a real-life scenario |
| `POST` | `/api/claim-predict/` | Estimate claim approval probability |
| `GET` | `/api/hidden/` | Detect hidden or risky clauses |
| `POST` | `/api/compare/` | Compare multiple policies |

---

## Quick Setup

> Setup takes under 5 minutes.

**1. Clone the repo**

```bash
git clone https://github.com/Deepanshu11-ai/PolicyPilot.git
cd PolicyPilot
```

**2. Create & activate a virtual environment**

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
```

**3. Install dependencies**

```bash
pip install django djangorestframework langchain langchain-community \
  langchain-core langchain-groq chromadb sentence-transformers \
  scikit-learn pandas numpy pypdf python-dotenv
```

**4. Start the backend**

```bash
cd insurance_ai
python manage.py runserver
```

**5. Start the frontend** *(new terminal)*

```bash
cd insurance_ai/frontend
npm install && npm start
```

---

## How to Use

1. **Upload a policy** — upload any insurance policy as a PDF.
2. **Set it as active** — select the policy to begin analysis.
3. **Explore the tools:**
   - **Coverage Analysis** — see what's covered, excluded, and conditional
   - **Ask AI** — ask questions in plain language
   - **Scenario Simulator** — test whether a specific situation is covered
   - **Claim Predictor** — estimate your approval probability
   - **Hidden Clauses** — find risky or unclear language
   - **Policy Comparison** — compare multiple policies side by side
4. **Make a decision** — use the AI-generated insights to act with confidence.

---

## Project Structure

```
PolicyPilot/
├── core/
│   ├── ml/
│   ├── services/
│   └── views.py
├── insurance_ai/
│   ├── settings.py
│   └── urls.py
├── templates/
├── static/
├── frontend/
├── manage.py
├── requirements.txt
└── .env
```

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## Authors

Deepanshu · Himanshu · Himani · Sanvi

---

## License

Licensed under the [MIT License](LICENSE).