// ========== UI HELPERS ==========

// Scroll to section
function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

// Format result with styling
function formatCoverageResult(data) {
  const covered = data.covered ? data.covered.map(item => `✅ ${item}`).join('\n') : '✅ None';
  const notCovered = data.not_covered ? data.not_covered.map(item => `❌ ${item}`).join('\n') : '❌ None';
  const conditions = data.conditions ? data.conditions.map(item => `⚠️ ${item}`).join('\n') : '⚠️ None';

  return `COVERED:\n${covered}\n\nNOT COVERED:\n${notCovered}\n\nCONDITIONS:\n${conditions}`;
}

// Format score result with progress bar
function formatScoreResult(data) {
  const score = data.score || 0;
  const summary = data.summary || '';
  const pros = data.pros ? data.pros.map(p => `✓ ${p}`).join('\n') : '';
  const cons = data.cons ? data.cons.map(c => `✗ ${c}`).join('\n') : '';

  let html = `<div class="score-value">${score}/100</div>`;
  html += `<div class="progress-bar"><div class="progress-fill" style="width: ${score}%"></div></div>`;
  html += `<div class="score-details">`;
  html += `<div class="detail-section"><div class="detail-title">Summary</div>${summary}</div>`;
  if (pros) html += `<div class="detail-section"><div class="detail-title">Pros</div><ul class="detail-list">${pros.split('\n').map(p => `<li>${p}</li>`).join('')}</ul></div>`;
  if (cons) html += `<div class="detail-section"><div class="detail-title">Cons</div><ul class="detail-list">${cons.split('\n').map(c => `<li>${c}</li>`).join('')}</ul></div>`;
  html += `</div>`;

  return html;
}

// Format hidden clauses with severity badge
function formatHiddenClausesResult(data) {
  const hidden = data.hidden_clauses ? data.hidden_clauses.map(h => `⚠️ ${h}`).join('\n') : '⚠️ None';
  const severity = data.severity || 'Low';
  const severityClass = severity === 'High' ? 'danger' : severity === 'Medium' ? 'warning' : 'info';
  const summary = data.risk_summary || '';

  return `HIDDEN CLAUSES:\n${hidden}\n\nSEVERITY: ${severity}\n\nRISK SUMMARY:\n${summary}`;
}

// Format claim prediction result
function formatClaimPredictionResult(data) {
  const probability = data.approval_probability || 0;
  const decision = data.decision || 'Unknown';
  const decisionClass = decision.toLowerCase().includes('approved') ? 'decision-approved' : 'decision-denied';
  const factors = data.factors ? data.factors.map(f => `• ${f}`).join('\n') : '• None';
  const explanation = data.explanation || '';
  const features = data.extracted_features ? JSON.stringify(data.extracted_features, null, 2) : '';

  let result = `📊 APPROVAL PROBABILITY\n${probability}%\n`;
  result += `\nDECISION\n${decision}\n`;
  result += `\nFACTORS\n${factors}\n`;
  if (explanation) result += `\nEXPLANATION\n${explanation}\n`;
  if (features) result += `\nEXTRACTED FEATURES\n${features}`;

  return result;
}

// Show loading state
function setLoading(elementId, isLoading) {
  const element = document.getElementById(elementId);
  if (isLoading) {
    element.innerHTML = '<p class="placeholder-text">⏳ Loading...</p>';
  }
}

// Clear result
function clearResult(elementId) {
  const element = document.getElementById(elementId);
  element.innerHTML = '<p class="placeholder-text">Click a button to see results</p>';
}

// Override original functions to use enhanced formatting

// Enhanced getCoverage
const originalGetCoverage = getCoverage;
getCoverage = async function () {
  if (!ACTIVE_POLICY) return alert("Set policy first");

  const coverageElement = document.getElementById("coverage");
  setLoading("coverage", true);

  const data = await safeFetch(`/api/coverage/?policy_id=${ACTIVE_POLICY}`);

  if (!data) {
    coverageElement.innerHTML = '<p class="placeholder-text">Error loading coverage</p>';
    return;
  }

  coverageElement.innerText = formatCoverageResult(data);
}

// Enhanced score
const originalScore = score;
score = async function () {
  if (!ACTIVE_POLICY) return alert("Set policy first");

  const scoreElement = document.getElementById("score");
  setLoading("score", true);

  const data = await safeFetch(`/api/score/?policy_id=${ACTIVE_POLICY}`);

  if (!data) {
    scoreElement.innerHTML = '<p class="placeholder-text">Error loading score</p>';
    return;
  }

  scoreElement.innerHTML = formatScoreResult(data);
}

// Enhanced getHiddenClauses
const originalGetHiddenClauses = getHiddenClauses;
getHiddenClauses = async function () {
  if (!ACTIVE_POLICY) return alert("Set policy first");

  const hiddenElement = document.getElementById("hidden");
  setLoading("hidden", true);

  const data = await safeFetch(`/api/hidden/?policy_id=${ACTIVE_POLICY}`);

  if (!data) {
    hiddenElement.innerHTML = '<p class="placeholder-text">Error loading hidden clauses</p>';
    return;
  }

  hiddenElement.innerText = formatHiddenClausesResult(data);
}

// Enhanced predictClaim
const originalPredictClaim = predictClaim;
predictClaim = async function () {
  if (!ACTIVE_POLICY) return alert("Set policy first");

  const scenario = document.getElementById("claim_scenario").value;
  if (!scenario) return alert("Enter a claim scenario");

  const claimElement = document.getElementById("claim_result");
  setLoading("claim_result", true);

  const data = await safeFetch("/api/claim-predict/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      scenario,
      policy_id: ACTIVE_POLICY
    })
  });

  if (!data) {
    claimElement.innerHTML = '<p class="placeholder-text">Error predicting claim</p>';
    return;
  }

  claimElement.innerText = formatClaimPredictionResult(data);
}
