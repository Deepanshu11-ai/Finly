import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from .utils import get_context

BASE_DB_PATH = "vector_db"


# =========================
# 📥 PROCESS PDF (MISSING FUNCTION FIX)
# =========================
def process_pdf(file_path, policy_id):
    """
    Process a PDF file and create a ChromaDB vector database.
    
    Args:
        file_path: Path to the PDF file
        policy_id: ID to assign to the policy
        
    Returns:
        Number of chunks created
        
    Raises:
        Exception: If PDF processing fails at any step
    """
    try:
        db_path = os.path.join(BASE_DB_PATH, f"policy_{policy_id}")
        os.makedirs(db_path, exist_ok=True)
        print(f"📂 Created directory: {db_path}")

        print(f"📄 Loading PDF: {file_path}")
        loader = PyPDFLoader(file_path)
        documents = loader.load()
        print(f"✅ Loaded {len(documents)} pages from PDF")

        print(f"🔄 Splitting documents into chunks...")
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=100
        )
        chunks = splitter.split_documents(documents)
        print(f"✅ Created {len(chunks)} chunks")

        print(f"🧠 Generating embeddings...")
        embeddings = HuggingFaceEmbeddings(
            model_name="all-MiniLM-L6-v2"
        )

        print(f"💾 Creating ChromaDB vector store...")
        db = Chroma.from_documents(
            documents=chunks,
            embedding=embeddings,
            persist_directory=db_path
        )

        print(f"💾 Persisting database...")
        db.persist()

        print(f"✅ DB created at {db_path}")
        return len(chunks)
        
    except Exception as e:
        print(f"❌ Error processing PDF: {str(e)}")
        import traceback
        traceback.print_exc()
        raise


# =========================
# ❓ ASK
# =========================
def ask_question(query, policy_id=1):
    context = get_context(query, policy_id, k=12)

    if not context:
        print(f"⚠️ No context found for policy {policy_id}")
        return f"Unable to find information in policy {policy_id}. Please ensure the policy is uploaded."

    llm = ChatGroq(
        api_key="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",
        model_name="llama-3.3-70b-versatile",
        temperature=0
    )

    prompt = f"""You are an insurance policy expert helping answer questions about insurance coverage.

Based on the policy text provided, answer the following question accurately and clearly.

GUIDELINES:
- Answer based ONLY on information in the policy text
- If the answer is found, provide a specific answer with details
- If partially covered, explain what IS covered and what is NOT
- If not found, clearly state "This is not mentioned in the policy"
- Be concise but complete

POLICY TEXT:
{context}

USER QUESTION:
{query}

ANSWER:"""

    try:
        response = llm.invoke(prompt).content
        print(f"✅ Answer generated for: {query}")
        return response
    except Exception as e:
        print(f"❌ LLM Error: {e}")
        return f"Error processing query: {str(e)[:100]}"