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

### 4. Run Backend Server

```bash
cd insurance_ai
python manage.py runserver
```

---

### 5. Run Frontend (New Terminal)

```bash
cd PolicyPilot
.venv\Scripts\activate   # or source .venv/bin/activate
cd insurance_ai/frontend
npm install
npm start
```
---
## 🔗 API Endpoints

- `/api/upload-policy/` → Upload policy  
- `/api/coverage/` → Get coverage details  
- `/api/ask/` → Ask questions  
- `/api/simulate/` → Scenario simulation  
- `/api/claim-predict/` → ML prediction  
- `/api/hidden/` → Hidden clauses  
- `/api/compare/` → Compare policies  
---
![Python](https://img.shields.io/badge/Python-3.10-blue)
![Django](https://img.shields.io/badge/Django-Backend-green)
![AI](https://img.shields.io/badge/AI-RAG%20%2B%20ML-orange)
## 🧪 How to Use

1. **Upload Policy**
   Upload any insurance policy document (PDF).

2. **Set Active Policy**
   Select the uploaded policy to start analysis.

3. **Explore Features**

   * **Coverage Analysis** → View covered, not covered, and conditions
   * **Ask AI** → Ask questions about the policy in natural language
   * **Scenario Simulator** → Test real-life scenarios
   * **Claim Predictor** → Estimate approval probability
   * **Hidden Clauses** → Identify risky or unclear clauses
   * **Policy Comparison** → Compare multiple policies side-by-side

4. **Interpret Results**
   Use AI-generated insights and predictions to make informed decisions.

---

## 📁 Project Structure

```
PolicyPilot/
├── core/
│   ├── ml/
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
## 👨‍💻 Authors

- Deepanshu  
- Himanshu
- Himani
- Sanvi
---

## 📜 License

This project is licensed under the MIT License.

---

## 🎯 Tagline

> “We don’t just help you read policies — we help you make smarter decisions.”
