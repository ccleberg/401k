declare const Plotly: {
  newPlot(
    el: string | HTMLElement,
    data: object[],
    layout: object,
    config?: object
  ): void;
};

interface GraphColors {
  bgColor: string;
  fgColor: string;
  gridColor: string;
  lineColor: string;
}

function formatMoney(num: number): string {
  return num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
}

function getInputValue(id: string): number {
  const el = document.getElementById(id) as HTMLInputElement | null;
  return el ? parseFloat(el.value) : NaN;
}

function getThemeColors(): GraphColors {
  const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return dark
    ? { bgColor: "#1a1d27", fgColor: "#e8eaf0", gridColor: "#2d3141", lineColor: "#3d4258" }
    : { bgColor: "#ffffff", fgColor: "#1a1d23", gridColor: "#e2e6ea", lineColor: "#c8cdd5" };
}

function buildAxisLayout(title: string, colors: GraphColors): object {
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
  balance: number;
  contribution: number;
  returnRate: number;
  inflationRate: number;

  constructor(balance: number, contribution: number, returnRate: number, inflationRate: number) {
    this.balance = balance;
    this.contribution = contribution;
    this.returnRate = returnRate;
    this.inflationRate = inflationRate;
  }

  summaryRow(): string {
    return `<tr>
      <td>$${formatMoney(this.balance)}</td>
      <td>$${formatMoney(this.contribution)}</td>
      <td>${this.returnRate.toFixed(2)}%</td>
      <td>${this.inflationRate.toFixed(2)}%</td>
    </tr>`;
  }

  adjustedRate(): number {
    return (1 + this.returnRate / 100) / (1 + this.inflationRate / 100) - 1;
  }
}

function showResults(data: Data, monthsArr: number[], balanceArr: number[], interestArr: number[]): void {
  const infoTbody = document.querySelector("#infoTable tbody") as HTMLTableSectionElement;
  infoTbody.innerHTML = data.summaryRow();

  document.querySelectorAll<HTMLElement>(".table-section").forEach((el) => (el.style.display = "block"));

  const graphCard = document.getElementById("graphCard") as HTMLElement;
  graphCard.style.display = "block";

  const colors = getThemeColors();
  const balanceTrace = { x: monthsArr, y: balanceArr, type: "scatter", line: { color: "#4f6ef7", width: 2 } };
  const interestTrace = { x: monthsArr, y: interestArr, type: "scatter", line: { color: "#22c55e", width: 2 } };

  Plotly.newPlot("balChartContainer", [balanceTrace], buildAxisLayout("Total Balance", colors), { responsive: true });
  Plotly.newPlot("intChartContainer", [interestTrace], buildAxisLayout("Accrued Interest", colors), { responsive: true });
}

function runCalculation(data: Data, stopCondition: (balance: number, month: number) => boolean): void {
  document.querySelectorAll("tbody").forEach((el) => (el.innerHTML = ""));

  const resultsTbody = document.querySelector(".resultsTable tbody") as HTMLTableSectionElement;
  const adjustedRate = data.adjustedRate();
  const monthlyContr = data.contribution;

  const monthsArr: number[] = [];
  const balanceArr: number[] = [];
  const interestArr: number[] = [];

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

function retirementYears(): void {
  const data = new Data(
    getInputValue("begBalance"),
    getInputValue("monthlyContr"),
    getInputValue("returnRate"),
    getInputValue("inflationRate")
  );
  const years = getInputValue("years");
  const totalMonths = years * 12;
  runCalculation(data, (_bal, i) => i >= totalMonths);
  document.getElementById("graphCard")?.scrollIntoView({ behavior: "smooth" });
}

function retirementMoney(): void {
  const data = new Data(
    getInputValue("begBalance"),
    getInputValue("monthlyContr"),
    getInputValue("returnRate"),
    getInputValue("inflationRate")
  );
  const target = getInputValue("money");
  runCalculation(data, (bal) => bal >= target);
  document.getElementById("graphCard")?.scrollIntoView({ behavior: "smooth" });
}

(window as Window & typeof globalThis & { retirementYears: () => void; retirementMoney: () => void }).retirementYears = retirementYears;
(window as Window & typeof globalThis & { retirementYears: () => void; retirementMoney: () => void }).retirementMoney = retirementMoney;
