function formatMoney(num) {
  return parseFloat(num).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
}

class Data {
  constructor(balance, contribution, returnRate, inflationRate, years, money) {
    this.balance = balance;
    this.contribution = contribution;
    this.returnRate = returnRate;
    this.inflationRate = inflationRate;
    this.years = years;
    this.money = money;
  }
  summary() {
    const summaryRow = "<tr> <td>$ " + formatMoney(this.balance) + "</td> <td>$ " + formatMoney(this.contribution) + "</td> <td>" + (this.returnRate).toFixed(2) + " %</td> <td>" + (this.inflationRate).toFixed(2) + " %</td> </tr>";
    return summaryRow;
  }
  adjustedRate() {
    const adjustedRate = ((1 + (this.returnRate / 100)) / (1 + (this.inflationRate / 100)) - 1);
    return adjustedRate;
  }
  graphData(monthsArr, balanceArr, interestArr) {
    let matched = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if(matched) {
      var bgColor = "#202020";
      var fgColor = "#ffffff";
      var gridColor = "#3b3b3b";
      var lineColor = "#5b5b5b";
    } else {
      var bgColor = "#ffffff";
      var fgColor = "#222222";
      var gridColor = "#c8c8c8";
      var lineColor = "#555555";
    }
    
    const balanceTrace = {
      x: monthsArr,
      y: balanceArr,
      type: "scatter",
      line: {
        color: "#24ab48",
        width: 2
      }
    };
    const interestTrace = {
      x: monthsArr,
      y: interestArr,
      type: "scatter",
      line: {
        color: "#0062ff",
        width: 2
      }
    };
    const balanceTitle = {
      title: {
        text: "Total Balance",
        color: fgColor
      },
      paper_bgcolor: bgColor,
      plot_bgcolor: bgColor,
      font: {
        color: fgColor
      },
      yaxis: {
        title: "Total Balance",
        gridcolor: gridColor,
        zerolinecolor: gridColor,
        linecolor: lineColor
      },
      xaxis: {
        title: "Months",
        gridcolor: gridColor,
        zerolinecolor: gridColor,
        linecolor: lineColor
      }
    };
    const interestTitle = {
      title: {
        text: "Accrued Interest",
        color: fgColor
      },
      paper_bgcolor: bgColor,
      plot_bgcolor: bgColor,
      font: {
        color: fgColor
      },
      yaxis: {
        title: "Accrued Interest",
        gridcolor: gridColor,
        zerolinecolor: gridColor,
        linecolor: lineColor
      },
      xaxis: {
        title: "Months",
        gridcolor: gridColor,
        zerolinecolor: gridColor,
        linecolor: lineColor
      }
    };
    return [balanceTrace, interestTrace, balanceTitle, interestTitle];
  }
}

function retirementYears() {
  $("tbody").empty();
  const myData = new Data(parseFloat($("#begBalance").val()), parseFloat($("#monthlyContr").val()), parseFloat($("#returnRate").val()), parseFloat($("#inflationRate").val()), parseFloat($("#years").val()), null);
  const summary = myData.summary();
  $(".infoTable tbody").append(summary);
  $(".infoTable, .resultsTable, #infoTableHeading, #resultsTableHeading").show();
  var interestArr = [],
    balanceArr = [],
    monthsArr = [];
  const adjustedRate = myData.adjustedRate();
  const monthlyContr = myData.contribution;
  let pVal = myData.balance;
  for (var i = 0; i < (myData.years * 12); i++) {
    var interest = (pVal * (adjustedRate / 12)).toFixed(2);
    var newBalance = (parseFloat(pVal) + parseFloat(interest) + monthlyContr).toFixed(2);
    $(".resultsTable tbody").append("<tr> <td>" + (i + 1) + "</td> <td>$ " + formatMoney(interest) + "</td> <td>$ " + formatMoney(monthlyContr) + "</td> <td>$ " + formatMoney(newBalance) + "</td> </tr>");
    if ((i + 1) === 1 || (i + 1) % 12 === 0 || i === (myData.years * 12)) {
      interestArr.push(parseInt(interest * 100) / 100);
      balanceArr.push(parseInt(newBalance * 100) / 100);
      monthsArr.push(i + 1);
    }
    pVal = newBalance;
  }
  $(".graphCard").css("display", "block");
  const graphData = myData.graphData(monthsArr, balanceArr, interestArr);
  Plotly.newPlot("balChartContainer", [graphData[0]], graphData[2], {
    responsive: true
  });
  Plotly.newPlot("intChartContainer", [graphData[1]], graphData[3], {
    responsive: true
  });
}

function retirementMoney() {
  $("tbody").empty();
  const myData = new Data(parseFloat($("#begBalance").val()), parseFloat($("#monthlyContr").val()), parseFloat($("#returnRate").val()), parseFloat($("#inflationRate").val()), null, parseFloat($("#money").val()));
  const summary = myData.summary();
  $(".infoTable tbody").append(summary);
  $(".infoTable, .resultsTable, #infoTableHeading, #resultsTableHeading").show();
  var interestArr = [],
    balanceArr = [],
    monthsArr = [];
  const adjustedRate = myData.adjustedRate();
  const monthlyContr = myData.contribution;
  let pVal = myData.balance;
  let money = myData.money;
  for (var i = 0; pVal < money; i++) {
    var months = i + 1;
    var newBalance = (pVal + (pVal * (adjustedRate / 12)) + monthlyContr);
    $(".resultsTable tbody").append("<tr> <td>" + months + "</td> <td>$ " + formatMoney((pVal * (adjustedRate / 12))) + "</td> <td>$ " + formatMoney(monthlyContr) + "</td> <td>$ " + formatMoney(newBalance) + "</td> </tr>");
    var roundedInterest = parseInt((pVal * (adjustedRate / 12)) * 100) / 100;
    var roundedBalance = parseInt(newBalance * 100) / 100;
    if (months === 1 || months % 12 === 0 || pVal > money) {
      interestArr.push(roundedInterest);
      balanceArr.push(roundedBalance);
      monthsArr.push(months);
    }
    pVal = newBalance;
  }
  $(".graphCard").css("display", "block");
  const graphData = myData.graphData(monthsArr, balanceArr, interestArr);
  Plotly.newPlot("balChartContainer", [graphData[0]], graphData[2], {
    responsive: true
  });
  Plotly.newPlot("intChartContainer", [graphData[1]], graphData[3], {
    responsive: true
  });
}
