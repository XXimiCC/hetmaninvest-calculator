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
  waitingCost: document.getElementById("waitingCost"),
  waitingCostLabel: document.getElementById("waitingCostLabel"),
  chartFinalNow: document.getElementById("chartFinalNow"),
  chartLegend: document.getElementById("chartLegend"),
  chartGrid: document.getElementById("chartGrid"),
  chartAxes: document.getElementById("chartAxes"),
  chartArea: document.getElementById("chartArea"),
  chartSeries: document.getElementById("chartSeries"),
  chartPoints: document.getElementById("chartPoints"),
  chartLabels: document.getElementById("chartLabels"),
  chartLegendModal: document.getElementById("chartLegendModal"),
  chartGridModal: document.getElementById("chartGridModal"),
  chartAxesModal: document.getElementById("chartAxesModal"),
  chartAreaModal: document.getElementById("chartAreaModal"),
  chartSeriesModal: document.getElementById("chartSeriesModal"),
  chartPointsModal: document.getElementById("chartPointsModal"),
  chartLabelsModal: document.getElementById("chartLabelsModal"),
  insightNow: document.getElementById("insightNow"),
  insightCash: document.getElementById("insightCash"),
  insightDelay2: document.getElementById("insightDelay2"),
  insightDelay3: document.getElementById("insightDelay3"),
  insightNowText: document.getElementById("insightNowText"),
  insightCashText: document.getElementById("insightCashText"),
  insightDelay2Text: document.getElementById("insightDelay2Text"),
  insightDelay3Text: document.getElementById("insightDelay3Text"),
  insightSummary: document.getElementById("insightSummary"),
};

const scenarioButtons = document.querySelectorAll(".scenario-btn");
const chartModal = document.getElementById("chartModal");
const openChartModalButton = document.getElementById("openChartModal");
const closeChartModalButton = document.getElementById("closeChartModal");
const closeChartModalBackdrop = document.getElementById("closeChartModalBackdrop");
const chartWrap = document.querySelector(".chart-wrap");
const comparisonChart = document.getElementById("comparisonChart");

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

const chartConfig = {
  desktop: {
    width: 760,
    height: 420,
    padding: { top: 24, right: 26, bottom: 46, left: 80 },
    yTicks: 5,
    xTicks: 6,
  },
  mobile: {
    width: 430,
    height: 320,
    padding: { top: 20, right: 14, bottom: 42, left: 74 },
    yTicks: 4,
    xTicks: 4,
  },
};

const comparisonSeries = [
  {
    key: "now",
    label: "Инвестировать сейчас",
    shortLabel: "Сейчас",
    color: "#42E572",
    dasharray: "",
    width: 4,
  },
  {
    key: "cash",
    label: "Просто откладывать без доходности",
    shortLabel: "Без доходности",
    color: "#2563EB",
    dasharray: "8 8",
    width: 3,
  },
  {
    key: "delay2",
    label: "Старт через 2 года",
    shortLabel: "Пауза 2 года",
    color: "#0F766E",
    dasharray: "10 7",
    width: 3,
  },
  {
    key: "delay3",
    label: "Старт через 3 года",
    shortLabel: "Пауза 3 года",
    color: "#D97706",
    dasharray: "4 8",
    width: 3,
  },
];

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

function formatCompactCurrency(value) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatAxisCurrency(value, compact = false) {
  if (compact) {
    return formatCompactCurrency(value);
  }

  if (value >= 1000) {
    return `${Math.round(value).toLocaleString("ru-RU")} $`;
  }

  return `${Math.round(value)} $`;
}

function calculatePortfolio({
  initialAmount,
  monthlyContribution,
  annualRate,
  years,
  contributionTiming,
  delayYears = 0,
}) {
  const totalMonths = Math.max(1, Math.round(years * 12));
  const monthlyRate = annualRate / 100 / 12;
  const delayMonths = Math.min(totalMonths, Math.max(0, Math.round(delayYears * 12)));
  let balance = initialAmount;
  let totalContributed = initialAmount;
  const monthlySeries = [{ month: 0, year: 0, balance, contributed: totalContributed }];
  const yearlyRows = [];

  for (let month = 1; month <= totalMonths; month += 1) {
    const isDelayedMonth = month <= delayMonths;

    if (!isDelayedMonth && contributionTiming === "beginning") {
      balance += monthlyContribution;
      totalContributed += monthlyContribution;
      balance *= 1 + monthlyRate;
    } else {
      balance *= 1 + monthlyRate;

      if (!isDelayedMonth) {
        balance += monthlyContribution;
        totalContributed += monthlyContribution;
      }
    }

    monthlySeries.push({
      month,
      year: month / 12,
      balance,
      contributed: totalContributed,
    });

    if (month % 12 === 0 || month === totalMonths) {
      yearlyRows.push({
        year: Math.ceil(month / 12),
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
    monthlySeries,
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

function createSvgNode(tagName, attrs = {}) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tagName);
  Object.entries(attrs).forEach(([key, value]) => {
    node.setAttribute(key, value);
  });
  return node;
}

function getLinePath(points) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
}

function getAreaPath(points, baselineY) {
  if (!points.length) {
    return "";
  }

  const linePath = getLinePath(points);
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  return `${linePath} L ${lastPoint.x.toFixed(2)} ${baselineY.toFixed(2)} L ${firstPoint.x.toFixed(2)} ${baselineY.toFixed(2)} Z`;
}

function clearChart(nodes) {
  nodes.forEach((node) => {
    node.innerHTML = "";
  });
}

function renderChart(seriesResults, totalYears, options = {}) {
  const {
    svgId = "comparisonChart",
    gridNode = outputs.chartGrid,
    axesNode = outputs.chartAxes,
    areaNode = outputs.chartArea,
    seriesNode = outputs.chartSeries,
    pointsNode = outputs.chartPoints,
    labelsNode = outputs.chartLabels,
    legendNode = outputs.chartLegend,
    forceDesktop = false,
  } = options;

  clearChart([gridNode, axesNode, seriesNode, pointsNode, labelsNode]);

  const isCompactViewport = !forceDesktop && window.innerWidth <= 640;
  const config = forceDesktop ? chartConfig.desktop : (isCompactViewport ? chartConfig.mobile : chartConfig.desktop);
  const { width, height, padding, xTicks, yTicks } = config;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const svg = document.getElementById(svgId);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  const maxValue = Math.max(...seriesResults.flatMap((series) => series.monthlySeries.map((point) => point.balance)));
  const safeMaxValue = maxValue <= 0 ? 1 : maxValue;

  const xScale = (year) => padding.left + (year / totalYears) * chartWidth;
  const yScale = (value) => padding.top + chartHeight - (value / safeMaxValue) * chartHeight;

  for (let tick = 0; tick <= yTicks; tick += 1) {
    const value = (safeMaxValue / yTicks) * tick;
    const y = yScale(value);
    const gridLine = createSvgNode("line", {
      x1: padding.left,
      y1: y,
      x2: width - padding.right,
      y2: y,
      class: "chart-grid-line",
    });
    gridNode.appendChild(gridLine);

    const label = createSvgNode("text", {
      x: isCompactViewport ? padding.left - 10 : padding.left - 14,
      y: y + 4,
      class: "chart-axis-label chart-axis-label-y",
    });
    label.textContent = formatCompactCurrency(value);
    axesNode.appendChild(label);
  }

  for (let tick = 0; tick <= xTicks; tick += 1) {
    const year = (totalYears / xTicks) * tick;
    const x = xScale(year);
    const gridLine = createSvgNode("line", {
      x1: x,
      y1: padding.top,
      x2: x,
      y2: height - padding.bottom,
      class: "chart-grid-line chart-grid-line-vertical",
    });
    gridNode.appendChild(gridLine);

    const label = createSvgNode("text", {
      x,
      y: height - padding.bottom + 24,
      class: "chart-axis-label chart-axis-label-x",
    });
    label.textContent = `${Math.round(year)} г.`;
    axesNode.appendChild(label);
  }

  areaNode.setAttribute(
    "d",
    getAreaPath(
      seriesResults[0].monthlySeries.map((point) => ({
        x: xScale(point.year),
        y: yScale(point.balance),
      })),
      height - padding.bottom
    )
  );

  seriesResults.forEach((series, index) => {
    const points = series.monthlySeries.map((point) => ({
      x: xScale(point.year),
      y: yScale(point.balance),
    }));
    const finalPoint = points[points.length - 1];

    const path = createSvgNode("path", {
      d: getLinePath(points),
      fill: "none",
      stroke: series.color,
      "stroke-width": String(series.width),
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "stroke-dasharray": series.dasharray,
      class: `chart-series-line chart-series-line-${series.key}`,
    });
    seriesNode.appendChild(path);

    const pointHalo = createSvgNode("circle", {
      cx: finalPoint.x,
      cy: finalPoint.y,
      r: index === 0 ? "11" : "8.5",
      fill: series.color,
      opacity: index === 0 ? "0.16" : "0.12",
      class: "chart-final-halo",
    });
    pointsNode.appendChild(pointHalo);

    const point = createSvgNode("circle", {
      cx: finalPoint.x,
      cy: finalPoint.y,
      r: index === 0 ? "6" : "4.5",
      fill: series.color,
      class: "chart-final-point",
    });
    pointsNode.appendChild(point);

    const labelGroup = createSvgNode("g", {
      class: "chart-end-label-group",
    });
    const labelOffsetY = isCompactViewport ? -10 + index * 18 : -14 + index * 22;
    const text = createSvgNode("text", {
      x: isCompactViewport ? finalPoint.x - 14 : finalPoint.x - 8,
      y: finalPoint.y + labelOffsetY,
      class: "chart-end-label",
      fill: series.color,
      "text-anchor": isCompactViewport ? "end" : "start",
    });
    text.textContent = isCompactViewport
      ? {
          now: "Сейчас",
          cash: "Без %",
          delay2: "Пауза 2г",
          delay3: "Пауза 3г",
        }[series.key] || series.shortLabel
      : series.shortLabel;
    labelGroup.appendChild(text);
    labelsNode.appendChild(labelGroup);
  });
}

function renderLegend(seriesResults, legendNode = outputs.chartLegend) {
  legendNode.innerHTML = seriesResults
    .map(
      (series) => `
        <div class="legend-item">
          <span class="legend-swatch${series.dasharray ? " is-dashed" : ""}" style="--swatch:${series.color};"></span>
          <div>
            <strong>${series.label}</strong>
            <small>${formatCurrency(series.finalValue)} к финалу</small>
          </div>
        </div>
      `
    )
    .join("");
}

function openChartModal() {
  chartModal.classList.add("is-open");
  chartModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeChartModal() {
  chartModal.classList.remove("is-open");
  chartModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function renderInsights(seriesResults) {
  const now = seriesResults.find((series) => series.key === "now");
  const cash = seriesResults.find((series) => series.key === "cash");
  const delay2 = seriesResults.find((series) => series.key === "delay2");
  const delay3 = seriesResults.find((series) => series.key === "delay3");
  const advantageVsCash = now.finalValue - cash.finalValue;
  const costDelay2 = now.finalValue - delay2.finalValue;
  const costDelay3 = now.finalValue - delay3.finalValue;

  outputs.waitingCost.textContent = formatCurrency(costDelay3);
  outputs.waitingCostLabel.textContent = "если отложить старт на 3 года";
  outputs.chartFinalNow.textContent = formatCurrency(now.finalValue);

  outputs.insightNow.textContent = formatCurrency(now.finalValue);
  outputs.insightCash.textContent = formatCurrency(cash.finalValue);
  outputs.insightDelay2.textContent = formatCurrency(delay2.finalValue);
  outputs.insightDelay3.textContent = formatCurrency(delay3.finalValue);

  outputs.insightNowText.textContent = `На ${formatCurrency(advantageVsCash)} больше, чем при простом накоплении без доходности.`;
  outputs.insightCashText.textContent = `Тот же объём взносов, но без силы сложного процента итог ниже на ${formatCurrency(advantageVsCash)}.`;
  outputs.insightDelay2Text.textContent = `Двухлетняя пауза уменьшает итоговый капитал на ${formatCurrency(costDelay2)}.`;
  outputs.insightDelay3Text.textContent = `Трёхлетняя пауза уменьшает итоговый капитал на ${formatCurrency(costDelay3)}.`;

  outputs.insightSummary.textContent =
    `Если начать сейчас, капитал составит ${formatCurrency(now.finalValue)}. ` +
    `Если просто откладывать без доходности, итог будет ${formatCurrency(cash.finalValue)}. ` +
    `Пауза на 2 года стоит ${formatCurrency(costDelay2)}, а пауза на 3 года уже ${formatCurrency(costDelay3)} к финалу.`;
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
  const comparisonResults = comparisonSeries.map((series) => {
    if (series.key === "cash") {
      return { ...series, ...calculatePortfolio({ ...data, annualRate: 0 }) };
    }

    if (series.key === "delay2") {
      return { ...series, ...calculatePortfolio({ ...data, delayYears: 2 }) };
    }

    if (series.key === "delay3") {
      return { ...series, ...calculatePortfolio({ ...data, delayYears: 3 }) };
    }

    return { ...series, ...result };
  });

  outputs.finalValue.textContent = formatCurrency(result.finalValue);
  outputs.totalContributed.textContent = formatCurrency(result.totalContributed);
  outputs.totalGrowth.textContent = formatCurrency(result.totalGrowth);

  renderBreakdown(result.yearlyRows);
  renderChart(comparisonResults, data.years);
  renderLegend(comparisonResults, outputs.chartLegend);
  renderChart(comparisonResults, data.years, {
    svgId: "comparisonChartModal",
    gridNode: outputs.chartGridModal,
    axesNode: outputs.chartAxesModal,
    areaNode: outputs.chartAreaModal,
    seriesNode: outputs.chartSeriesModal,
    pointsNode: outputs.chartPointsModal,
    labelsNode: outputs.chartLabelsModal,
    forceDesktop: true,
  });
  renderLegend(comparisonResults, outputs.chartLegendModal);
  renderInsights(comparisonResults);
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

window.addEventListener("resize", recalculate);
openChartModalButton.addEventListener("click", openChartModal);
chartWrap.addEventListener("click", openChartModal);
comparisonChart.style.cursor = "zoom-in";
closeChartModalButton.addEventListener("click", closeChartModal);
closeChartModalBackdrop.addEventListener("click", closeChartModal);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && chartModal.classList.contains("is-open")) {
    closeChartModal();
  }
});

recalculate();
