const form = document.getElementById("calculator-form");
const inputs = {
  initialAmount: document.getElementById("initialAmount"),
  monthlyContribution: document.getElementById("monthlyContribution"),
  annualRate: document.getElementById("annualRate"),
  years: document.getElementById("years"),
  contributionTiming: document.getElementById("contributionTiming"),
};

const outputs = {
  finalValue: document.getElementById("finalValue"),
  totalContributed: document.getElementById("totalContributed"),
  totalGrowth: document.getElementById("totalGrowth"),
  yearlyBreakdown: document.getElementById("yearlyBreakdown"),
};

const scenarioButtons = document.querySelectorAll(".scenario-btn");

const scenarios = {
  conservative: {
    initialAmount: 5000,
    monthlyContribution: 300,
    annualRate: 5.5,
    years: 10,
    contributionTiming: "end",
  },
  base: {
    initialAmount: 10000,
    monthlyContribution: 500,
    annualRate: 8.5,
    years: 15,
    contributionTiming: "end",
  },
  aggressive: {
    initialAmount: 15000,
    monthlyContribution: 800,
    annualRate: 11.5,
    years: 20,
    contributionTiming: "beginning",
  },
};

function formatCurrency(value) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function sanitizeNumber(value, fallback = 0, min = 0) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? Math.max(parsed, min) : fallback;
}

function calculatePortfolio({ initialAmount, monthlyContribution, annualRate, years, contributionTiming }) {
  const totalMonths = Math.max(1, Math.round(years * 12));
  const monthlyRate = annualRate / 100 / 12;
  let balance = initialAmount;
  let totalContributed = initialAmount;
  const yearlyRows = [];

  for (let month = 1; month <= totalMonths; month += 1) {
    if (contributionTiming === "beginning") {
      balance += monthlyContribution;
      totalContributed += monthlyContribution;
      balance *= 1 + monthlyRate;
    } else {
      balance *= 1 + monthlyRate;
      balance += monthlyContribution;
      totalContributed += monthlyContribution;
    }

    if (month % 12 === 0 || month === totalMonths) {
      const yearNumber = Math.ceil(month / 12);
      yearlyRows.push({
        year: yearNumber,
        contributed: totalContributed,
        growth: balance - totalContributed,
        balance,
      });
    }
  }

  return {
    finalValue: balance,
    totalContributed,
    totalGrowth: balance - totalContributed,
    yearlyRows,
  };
}

function renderBreakdown(rows) {
  outputs.yearlyBreakdown.innerHTML = rows
    .map(
      (row) => `
        <tr>
          <td>${row.year}</td>
          <td>${formatCurrency(row.contributed)}</td>
          <td>${formatCurrency(row.growth)}</td>
          <td>${formatCurrency(row.balance)}</td>
        </tr>
      `
    )
    .join("");
}

function updateScenarioState(activeKey) {
  scenarioButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.scenario === activeKey);
  });
}

function recalculate() {
  const data = {
    initialAmount: sanitizeNumber(inputs.initialAmount.value),
    monthlyContribution: sanitizeNumber(inputs.monthlyContribution.value),
    annualRate: sanitizeNumber(inputs.annualRate.value),
    years: sanitizeNumber(inputs.years.value, 1, 1),
    contributionTiming: inputs.contributionTiming.value,
  };

  const result = calculatePortfolio(data);
  outputs.finalValue.textContent = formatCurrency(result.finalValue);
  outputs.totalContributed.textContent = formatCurrency(result.totalContributed);
  outputs.totalGrowth.textContent = formatCurrency(result.totalGrowth);
  renderBreakdown(result.yearlyRows);
}

scenarioButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const scenario = scenarios[button.dataset.scenario];
    Object.entries(scenario).forEach(([key, value]) => {
      inputs[key].value = value;
    });
    updateScenarioState(button.dataset.scenario);
    recalculate();
  });
});

form.addEventListener("input", () => {
  updateScenarioState("");
  recalculate();
});

recalculate();
