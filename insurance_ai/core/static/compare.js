// ========== COMPARE PAGE LOGIC ==========

async function compare() {
  const p1 = document.getElementById("p1").value;
  const p2 = document.getElementById("p2").value;

  if (!p1 || !p2) {
    alert("Enter both policy IDs");
    return;
  }

  if (p1 === p2) {
    alert("Policy IDs must be different");
    return;
  }

  const resultElement = document.getElementById("result");
  resultElement.innerHTML = '<p class="placeholder-text">⏳ Comparing policies...</p>';

  const data = await safeFetch("/api/compare/", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      policy_1: p1,
      policy_2: p2
    })
  });

  if (!data) {
    resultElement.innerHTML = '<p class="placeholder-text">Error comparing policies</p>';
    return;
  }

  // Format results
  const betterPolicy = data.better_policy || 'N/A';
  const verdict = data.verdict || 'No verdict available';
  const differences = data.differences || [];

  // Determine winner badge color
  const winnerColor = betterPolicy === p1 ? 'var(--success)' : 'var(--warning)';
  const winnerBg = betterPolicy === p1 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)';

  let resultHTML = `
    <div style="text-align: center; margin-bottom: 2rem;">
      <div style="
        display: inline-block;
        padding: 1.5rem 3rem;
        background: ${winnerBg};
        border: 2px solid ${winnerColor};
        border-radius: 1rem;
        margin-bottom: 1rem;
      ">
        <div style="font-size: 1.25rem; color: var(--text-secondary); margin-bottom: 0.5rem;">🏆 Better Policy</div>
        <div style="font-size: 2.5rem; font-weight: 800; color: ${winnerColor};">Policy ${betterPolicy}</div>
      </div>
    </div>
  `;

  resultHTML += `<div style="margin-bottom: 2rem;">
    <h3 style="color: var(--primary); margin-bottom: 1rem; font-size: 1.25rem;">📋 Verdict</h3>
    <p style="color: var(--text-secondary); line-height: 1.8;">${verdict}</p>
  </div>`;

  if (differences.length > 0) {
    resultHTML += `<div>
      <h3 style="color: var(--primary); margin-bottom: 1rem; font-size: 1.25rem;">📊 Key Differences</h3>
      <ul style="list-style: none; color: var(--text-secondary);">`;
    
    differences.forEach(diff => {
      resultHTML += `<li style="padding: 0.75rem 0; border-bottom: 1px solid var(--border); display: flex; align-items: center;">
        <span style="color: var(--primary); margin-right: 0.75rem; font-size: 1.25rem;">→</span>
        ${diff}
      </li>`;
    });
    
    resultHTML += `</ul></div>`;
  }

  resultElement.innerHTML = resultHTML;
}
