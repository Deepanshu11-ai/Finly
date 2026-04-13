// ================= GLOBAL =================
let ACTIVE_POLICY = null;

// ================= SET POLICY =================
function setPolicy() {
  ACTIVE_POLICY = document.getElementById("active_policy").value;

  if (!ACTIVE_POLICY) {
    alert("Enter policy ID");
    return;
  }

  document.getElementById("current_policy").innerText =
    "Active Policy: " + ACTIVE_POLICY;
}

// ================= SAFE FETCH =================
async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);

    let data;
    try {
      data = await res.json();
    } catch {
      const text = await res.text();
      alert("Server Error:\n" + text);
      return null;
    }

    return data;
  } catch (err) {
    alert("Network Error");
    return null;
  }
}

// ================= UPLOAD =================
async function upload() {
  const file = document.getElementById("file").files[0];

  if (!file) {
    alert("Select a file");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  const data = await safeFetch("/api/upload-policy/", {
    method: "POST",
    body: formData
  });

  if (!data) return;

  ACTIVE_POLICY = data.policy_id;

  document.getElementById("upload_result").innerText =
    "Uploaded Policy ID: " + data.policy_id;

  document.getElementById("current_policy").innerText =
    "Active Policy: " + data.policy_id;
}

// ================= COVERAGE =================
async function getCoverage() {
  if (!ACTIVE_POLICY) return alert("Set policy first");

  const data = await safeFetch(
    `/api/coverage/?policy_id=${ACTIVE_POLICY}`
  );

  if (!data) return;

  let html = '';
  
  // Covered items column
  if (data.covered && data.covered.length > 0) {
    html += `
      <div class="coverage-column covered">
        <h4>✅ Covered</h4>
        <div class="coverage-column-items">
          ${data.covered.map(item => `<div class="coverage-item">${item}</div>`).join('')}
        </div>
      </div>
    `;
  }

  // Not covered items column
  if (data.not_covered && data.not_covered.length > 0) {
    html += `
      <div class="coverage-column not-covered">
        <h4>❌ Not Covered</h4>
        <div class="coverage-column-items">
          ${data.not_covered.map(item => `<div class="coverage-item">${item}</div>`).join('')}
        </div>
      </div>
    `;
  }

  // Conditional items column
  if (data.conditions && data.conditions.length > 0) {
    html += `
      <div class="coverage-column conditional">
        <h4>⚠️ Conditional</h4>
        <div class="coverage-column-items">
          ${data.conditions.map(item => `<div class="coverage-item">${item}</div>`).join('')}
        </div>
      </div>
    `;
  }

  document.getElementById("coverage-list").innerHTML = html || '<p class="placeholder-text" style="padding: 2rem;">No coverage data available</p>';
}

// ================= ASK =================
async function ask() {
  if (!ACTIVE_POLICY) return alert("Set policy first");

  const query = document.getElementById("query").value;

  if (!query) {
    alert("Enter a question");
    return;
  }

  const data = await safeFetch("/api/ask/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      policy_id: ACTIVE_POLICY
    })
  });

  if (!data) return;

  const html = `
    <div style="padding: 1.25rem; background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(59, 130, 246, 0.08)); border-radius: 12px; border-left: 4px solid var(--accent-green); animation: fadeInUp 0.4s ease-out;">
      <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.8; margin: 0;">${data.answer || 'No answer available'}</p>
    </div>
  `;

  document.getElementById("answer").innerHTML = html;
}

// ================= SCENARIO =================
async function simulate() {
  if (!ACTIVE_POLICY) return alert("Set policy first");

  const scenario = document.getElementById("scenario-input").value;

  if (!scenario) {
    alert("Enter scenario");
    return;
  }

  const data = await safeFetch("/api/simulate/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      scenario,
      policy_id: ACTIVE_POLICY
    })
  });

  if (!data) return;

  const riskLevel = (data.risk_level || 'Medium').toLowerCase();
  let riskBadgeClass = 'warning';
  let riskIcon = '🟠';
  if (riskLevel === 'low') {
    riskBadgeClass = 'success';
    riskIcon = '🟢';
  } else if (riskLevel === 'high') {
    riskBadgeClass = 'danger';
    riskIcon = '🔴';
  }

  let html = `
    <div style="margin-bottom: 1.5rem;">
      <div style="padding: 1.5rem; background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(139, 92, 246, 0.08)); border-radius: 12px; border: 1px solid var(--border-color);">
        <div style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Decision</div>
        <div style="font-size: 1.6rem; font-weight: 700; color: var(--text-primary);">${data.decision || 'N/A'}</div>
      </div>
    </div>
    
    <div style="margin-bottom: 1.5rem;">
      <h4 style="color: var(--text-primary); margin-bottom: 0.75rem; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">💭 Reasoning</h4>
      <p style="color: var(--text-secondary); line-height: 1.7; font-size: 0.95rem;">${data.reason || 'No reasoning provided'}</p>
    </div>
    
    <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-tertiary); border-radius: 10px; border: 1px solid var(--border-color);">
      <span style="font-size: 1.5rem;">${riskIcon}</span>
      <div style="flex: 1;">
        <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0 0 0.5rem 0; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Risk Level</p>
        <span class="badge ${riskBadgeClass}" style="display: inline-block;">${data.risk_level || 'Medium'}</span>
      </div>
    </div>
  `;

  document.getElementById("simulation").innerHTML = html;
}
// ================= SCORE =================
async function score() {
  if (!ACTIVE_POLICY) return alert("Set policy first");

  const data = await safeFetch(
    `/api/score/?policy_id=${ACTIVE_POLICY}`
  );

  if (!data) return;

  const scoreValue = parseInt(data.score) || 0;
  const rotation = (scoreValue / 100) * 360;
  
  let html = `
    <div class="score-container" style="--score-rotation: ${rotation}deg;">
      <div class="score-circle" style="--score-rotation: ${rotation}deg;">${scoreValue}</div>
      <div class="score-label">out of 100</div>
      
      <div class="score-details" style="width: 100%; margin-top: 1.5rem;">
        <div style="margin-bottom: 1.5rem;">
          <p style="color: var(--text-secondary); margin-bottom: 0.75rem; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">📝 Summary</p>
          <p style="color: var(--text-primary); line-height: 1.6; font-size: 0.95rem;">${data.summary || 'No summary available'}</p>
        </div>
  `;

  if (data.pros && data.pros.length > 0) {
    html += '<div style="margin-bottom: 1.5rem;"><h4 style="color: var(--accent-green); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">✓ Strengths</h4>';
    data.pros.forEach(pro => {
      html += `<p style="color: var(--text-secondary); padding: 0.75rem 0; border-bottom: 1px solid var(--border-color); font-size: 0.9rem;"><span style="color: var(--accent-green); margin-right: 0.75rem; font-weight: 600;">→</span> ${pro}</p>`;
    });
    html += '</div>';
  }

  if (data.cons && data.cons.length > 0) {
    html += '<div><h4 style="color: var(--accent-red); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">✗ Weaknesses</h4>';
    data.cons.forEach(con => {
      html += `<p style="color: var(--text-secondary); padding: 0.75rem 0; border-bottom: 1px solid var(--border-color); font-size: 0.9rem;"><span style="color: var(--accent-red); margin-right: 0.75rem; font-weight: 600;">→</span> ${con}</p>`;
    });
    html += '</div>';
  }

  html += '</div></div>';
  
  document.getElementById("score").innerHTML = html;
}

// ================= HIDDEN CLAUSES =================
async function getHiddenClauses() {
  if (!ACTIVE_POLICY) return alert("Set policy first");

  const data = await safeFetch(
    `/api/hidden/?policy_id=${ACTIVE_POLICY}`
  );

  if (!data) return;

  let html = '';
  
  if (data.hidden_clauses && data.hidden_clauses.length > 0) {
    data.hidden_clauses.forEach((clause, idx) => {
      const severity = data.severities && data.severities[idx] ? data.severities[idx] : 'Medium';
      const severityClass = severity === 'High' ? 'danger' : severity === 'Low' ? 'success' : 'warning';
      const severityIcon = severity === 'High' ? '🔴' : severity === 'Low' ? '🟡' : '🟠';
      
      html += `
        <div class="alert-card ${severityClass}" style="margin-bottom: 1rem; animation: slideInUp 0.4s ease-out;">
          <div style="flex-shrink: 0; font-size: 1.25rem;">${severityIcon}</div>
          <div class="alert-content" style="flex: 1;">
            <h4 style="margin: 0 0 0.5rem 0;">${clause}</h4>
            <span class="badge ${severityClass}" style="display: inline-block; font-size: 0.75rem;">${severity.toUpperCase()} SEVERITY</span>
          </div>
        </div>
      `;
    });
  }
  
  if (data.risk_summary) {
    html += `
      <div style="margin-top: 1.5rem; padding: 1.25rem; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(59, 130, 246, 0.05)); border-radius: 10px; border: 1px solid var(--border-color); border-left: 4px solid var(--accent-indigo);">
        <h4 style="color: var(--text-primary); margin: 0 0 0.75rem 0; font-size: 0.95rem;">📋 Risk Summary</h4>
        <p style="color: var(--text-secondary); margin: 0; line-height: 1.6; font-size: 0.9rem;">${data.risk_summary}</p>
      </div>
    `;
  }

  document.getElementById("hidden").innerHTML = html || '<div style="text-align: center; padding: 2rem;"><p class="placeholder-text">✨ No hidden clauses detected! Your policy looks clean.</p></div>';
}
// ================= COMPARE PAGE =================
async function compare() {
  const p1 = document.getElementById("p1").value;
  const p2 = document.getElementById("p2").value;

  if (!p1 || !p2) {
    alert("Enter both policy IDs");
    return;
  }

  const data = await safeFetch("/api/compare/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      policy_1: p1,
      policy_2: p2
    })
  });

  if (!data) return;

  document.getElementById("result").innerText =
    "🏆 Better Policy: " + (data.better_policy || "N/A") +
    "\n\nVerdict:\n" + (data.verdict || "N/A") +
    "\n\nDifferences:\n- " + (data.differences?.join("\n- ") || "None");
}

// ================= CLAIM PREDICTOR =================
async function predictClaim() {
  if (!ACTIVE_POLICY) return alert("Set policy first");

  const scenario = document.getElementById("claim_scenario").value;

  if (!scenario) {
    alert("Describe a claim scenario");
    return;
  }

  const data = await safeFetch("/api/claim-predict/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      scenario,
      policy_id: ACTIVE_POLICY
    })
  });

  if (!data) return;

  const probability = parseInt(data.approval_probability) || 0;
  
  // Determine color based on probability
  let probabilityColor, probabilityGradient, badgeClass;
  if (probability >= 70) {
    probabilityColor = 'var(--accent-green)';
    probabilityGradient = 'linear-gradient(90deg, var(--accent-blue), var(--accent-green))';
    badgeClass = 'success';
  } else if (probability >= 40) {
    probabilityColor = 'var(--accent-yellow)';
    probabilityGradient = 'linear-gradient(90deg, var(--accent-yellow), var(--accent-orange))';
    badgeClass = 'warning';
  } else {
    probabilityColor = 'var(--accent-red)';
    probabilityGradient = 'linear-gradient(90deg, var(--accent-red), var(--accent-orange))';
    badgeClass = 'danger';
  }

  let html = `
    <div style="margin-bottom: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <span style="color: var(--text-secondary); font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Approval Probability</span>
        <span style="font-size: 1.8rem; font-weight: 700; color: ${probabilityColor};">${probability}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${probability}%; background: ${probabilityGradient};"></div>
      </div>
    </div>

    <div style="padding: 1.5rem; background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05)); border-radius: 12px; border: 1px solid var(--border-color); margin-bottom: 1.5rem;">
      <div style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Predicted Decision</div>
      <div style="font-size: 1.4rem; font-weight: 700; color: var(--text-primary); margin-bottom: 1rem;">
        ${data.decision || 'Unable to predict'}
      </div>
      <span class="badge ${badgeClass}" style="display: inline-block;">
        ${probability >= 70 ? '✔ LIKELY APPROVED' : probability >= 40 ? '⚠ UNCERTAIN' : '✖ LIKELY REJECTED'}
      </span>
    </div>
  `;

  if (data.factors && data.factors.length > 0) {
    html += '<div style="margin-bottom: 1.5rem;"><h4 style="color: var(--text-primary); margin-bottom: 1rem; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">🔍 Contributing Factors</h4>';
    data.factors.forEach(factor => {
      html += `<p style="color: var(--text-secondary); padding: 0.75rem 0; border-bottom: 1px solid var(--border-color); font-size: 0.9rem;"><span style="color: var(--accent-blue); margin-right: 0.75rem; font-weight: 600;">→</span>${factor}</p>`;
    });
    html += '</div>';
  }

  if (data.explanation) {
    html += `
      <div style="padding: 1rem; background: var(--bg-tertiary); border-radius: 10px; border-left: 4px solid var(--accent-indigo);">
        <h4 style="color: var(--text-primary); margin-bottom: 0.75rem; font-size: 0.9rem;">💡 Analysis</h4>
        <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6;">${data.explanation}</p>
      </div>
    `;
  }

  document.getElementById("claim_result").innerHTML = html;
}