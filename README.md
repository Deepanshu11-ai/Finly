# 🛡️ PolicyPilot

> **AI-powered insurance analysis platform** — transform complex policy documents into clear, actionable insights.

PolicyPilot helps users understand, evaluate, and compare insurance policies with confidence. It leverages advanced AI to extract coverage details, detect hidden clauses, simulate real-life scenarios, and predict claim approval likelihood — turning dense legal documents into plain-language decisions.

---

## 🚀 Features

| Feature                     | Description                                                         |
| --------------------------- | ------------------------------------------------------------------- |
| **Coverage Analysis**       | Automatically extracts what is and isn't covered by a policy        |
| **Ask AI**                  | Natural language Q&A directly over your uploaded policy documents   |
| **Scenario Simulation**     | Test real-life scenarios against policy terms before filing a claim |
| **Claim Prediction (ML)**   | Predicts claim approval probability using a trained ML model        |
| **Hidden Clause Detection** | Flags risky or ambiguous clauses buried in fine print               |
| **Policy Comparison**       | Side-by-side intelligent comparison across multiple policies        |

---

## ⚙️ Tech Stack

### 🖥 Backend

* Django
* Django REST Framework

### 🎨 Frontend

* HTML
* CSS
* JavaScript

### 🤖 AI / ML

* LangChain (RAG pipeline)
* HuggingFace Embeddings
* Scikit-learn (ML model)

### 🧠 Infrastructure

* ChromaDB (Vector Database)
* Groq API (LLaMA 3 for LLM tasks)

---

## 🧠 Architecture

```
PDF Upload → Chunking & Embedding (HuggingFace)
                      ↓
            Vector Store (ChromaDB)
                      ↓
         RAG + LLM Reasoning (Groq / LLaMA 3)
                      ↓
         ML Prediction (Scikit-learn Model)
```

---

## 🔗 APIs & Integrations

* **Groq API** → LLM reasoning, Q&A, extraction, explanation
* **HuggingFace** → Embeddings for semantic search
* **ChromaDB** → Vector storage & retrieval

---

## ⚙️ 🚀 Installation & Setup

> ⚡ Setup takes less than 5 minutes.

### 1. Clone the Repository

```bash
git clone https://github.com/Deepanshu11-ai/PolicyPilot.git
cd PolicyPilot
```

---

### 2. Create & Activate Virtual Environment

```bash
python -m venv .venv

# macOS / Linux
source .venv/bin/activate

# Windows
.venv\Scripts\activate
```

---

### 3. Install Dependencies

```bash
pip install django djangorestframework langchain langchain-community langchain-core langchain-groq chromadb sentence-transformers scikit-learn pandas numpy pypdf python-dotenv
```

---

### 4. Setup Backend

```bash
cd insurance_ai
python manage.py migrate
```

---

### 5. Train ML Model (One-time)

```bash
python core/ml/train.py
```

---

### 6. Run Backend Server

```bash
python manage.py runserver
```

---

### 7. Run Frontend (New Terminal)

```bash
cd PolicyPilot
.venv\Scripts\activate   # or source .venv/bin/activate
cd insurance_ai/frontend
npm install
npm start
```

---

### 8. Open Application

```
http://127.0.0.1:8000/
```

---

## 🧪 Usage

1. Upload an insurance policy (PDF)
2. Set it as the active policy
3. Explore features:

   * Coverage Analysis
   * Ask AI
   * Scenario Simulation
   * Claim Prediction
   * Hidden Clauses
   * Policy Comparison

---

## 📁 Project Structure

```
PolicyPilot/
├── core/
│   ├── ml/
│   │   └── train.py
│   ├── services/
│   ├── views.py
│
├── insurance_ai/
│   ├── settings.py
│   ├── urls.py
│
├── templates/
├── static/
├── frontend/
├── manage.py
├── requirements.txt
└── .env
```

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

## 📜 License

This project is licensed under the MIT License.

---

## 🎯 Tagline

> “We don’t just help you read policies — we help you make smarter decisions.”
