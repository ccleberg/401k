"use strict";
function formatMoney(num) {
    return num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
}
function getInputValue(id) {
    const el = document.getElementById(id);
    return el ? parseFloat(el.value) : NaN;
}
function getThemeColors() {
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return dark
        ? { bgColor: "#1a1d27", fgColor: "#e8eaf0", gridColor: "#2d3141", lineColor: "#3d4258" }
        : { bgColor: "#ffffff", fgColor: "#1a1d23", gridColor: "#e2e6ea", lineColor: "#c8cdd5" };
}
function buildAxisLayout(title, colors) {
    const { bgColor, fgColor, gridColor, lineColor } = colors;
    return {
        title: { text: title, font: { color: fgColor, size: 13 } },
        paper_bgcolor: bgColor,
        plot_bgcolor: bgColor,
        font: { color: fgColor, family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
        margin: { t: 40, r: 16, b: 48, l: 60 },
        yaxis: { gridcolor: gridColor, zerolinecolor: gridColor, linecolor: lineColor },
        xaxis: { title: { text: "Months", font: { size: 11 } }, gridcolor: gridColor, zerolinecolor: gridColor, linecolor: lineColor },
    };
}
class Data {
    constructor(balance, contribution, returnRate, inflationRate) {
        this.balance = balance;
        this.contribution = contribution;
        this.returnRate = returnRate;
        this.inflationRate = inflationRate;
    }
    summaryRow() {
        return `<tr>
      <td>$${formatMoney(this.balance)}</td>
      <td>$${formatMoney(this.contribution)}</td>
      <td>${this.returnRate.toFixed(2)}%</td>
      <td>${this.inflationRate.toFixed(2)}%</td>
    </tr>`;
    }
    adjustedRate() {
        return (1 + this.returnRate / 100) / (1 + this.inflationRate / 100) - 1;
    }
}
function showResults(data, monthsArr, balanceArr, interestArr) {
    const infoTbody = document.querySelector("#infoTable tbody");
    infoTbody.innerHTML = data.summaryRow();
    document.querySelectorAll(".table-section").forEach((el) => (el.style.display = "block"));
    const graphCard = document.getElementById("graphCard");
    graphCard.style.display = "block";
    const colors = getThemeColors();
    const balanceTrace = { x: monthsArr, y: balanceArr, type: "scatter", line: { color: "#4f6ef7", width: 2 } };
    const interestTrace = { x: monthsArr, y: interestArr, type: "scatter", line: { color: "#22c55e", width: 2 } };
    Plotly.newPlot("balChartContainer", [balanceTrace], buildAxisLayout("Total Balance", colors), { responsive: true });
    Plotly.newPlot("intChartContainer", [interestTrace], buildAxisLayout("Accrued Interest", colors), { responsive: true });
}
function runCalculation(data, stopCondition) {
    document.querySelectorAll("tbody").forEach((el) => (el.innerHTML = ""));
    const resultsTbody = document.querySelector(".resultsTable tbody");
    const adjustedRate = data.adjustedRate();
    const monthlyContr = data.contribution;
    const monthsArr = [];
    const balanceArr = [];
    const interestArr = [];
    let pVal = data.balance;
    let i = 0;
    while (!stopCondition(pVal, i)) {
        const month = i + 1;
        const interest = pVal * (adjustedRate / 12);
        const newBalance = pVal + interest + monthlyContr;
        const row = document.createElement("tr");
        row.innerHTML = `<td>${month}</td><td>$${formatMoney(interest)}</td><td>$${formatMoney(monthlyContr)}</td><td>$${formatMoney(newBalance)}</td>`;
        resultsTbody.appendChild(row);
        if (month === 1 || month % 12 === 0) {
            interestArr.push(Math.round(interest * 100) / 100);
            balanceArr.push(Math.round(newBalance * 100) / 100);
            monthsArr.push(month);
        }
        pVal = newBalance;
        i++;
    }
    showResults(data, monthsArr, balanceArr, interestArr);
}
function retirementYears() {
    var _a;
    const data = new Data(getInputValue("begBalance"), getInputValue("monthlyContr"), getInputValue("returnRate"), getInputValue("inflationRate"));
    const years = getInputValue("years");
    const totalMonths = years * 12;
    runCalculation(data, (_bal, i) => i >= totalMonths);
    (_a = document.getElementById("graphCard")) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
}
function retirementMoney() {
    var _a;
    const data = new Data(getInputValue("begBalance"), getInputValue("monthlyContr"), getInputValue("returnRate"), getInputValue("inflationRate"));
    const target = getInputValue("money");
    runCalculation(data, (bal) => bal >= target);
    (_a = document.getElementById("graphCard")) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
}
window.retirementYears = retirementYears;
window.retirementMoney = retirementMoney;
