const $ = require("jquery");
jQuery = $;
const csv = require("jquery-csv");

const { Chart, registerables } = require("chart.js");
Chart.register(...registerables);

const mChartCanvas = document.getElementById("mainChart");

const tokenSelect = document.querySelector(".token-select");

const startDateInput = document.querySelector(".start-date-input");
const endDateInput = document.querySelector(".end-date-input");
const amountInvested = document.querySelector(".amount-invested");
const investInterval = document.querySelector(".invest-interval");
const description = document.querySelector(".description-input");
const calcBtn = document.querySelector(".calculate-btn");
const resTable = document.querySelector(".result-table");

const sp500opt = document.querySelector(".sp500");
const assetPriceOpt = document.querySelector(".asset-price");

calcBtn.addEventListener("click", calculateWalletBtn);
sp500opt.addEventListener("click", showSP500);
assetPriceOpt.addEventListener("click", showAssetPrice);
tokenSelect.addEventListener("change", changeCurrencyE);

let data;
let tokenData = [];
let d = []; //dates
let dZ = []; //dates zoomed
let p = []; //prices
let pZ = []; //prices zoomed
let w = []; //wallet state
let nt = []; //number of tokens
let mChart;
let inv;

//extra
let wColor = []; //wallet state color
let wBarThickness = []; //wallet state color
let spD = []; //S&P dates
let spP = []; //S&P price
let spPZ = [];
let spDZ = []; //S&P dates
let spW = []; //S&P wallet

// loadSP500();
// loadAllData("btc");
loadData("btc");
drawMainChart("btc");

function createRowResult(tag, inv, val, ret) {
  const tr = document.createElement("tr");
  tr.classList.add("result-tr");
  const td1 = document.createElement("td");
  const td2 = document.createElement("td");
  const td3 = document.createElement("td");
  const td4 = document.createElement("td");
  const td5 = document.createElement("td");
  const td6 = document.createElement("td");
  td1.classList.add("result-td");
  td2.classList.add("result-td");
  td3.classList.add("result-td");
  td4.classList.add("result-td");
  td5.classList.add("result-td");
  td6.classList.add("result-td");
  td1.innerText = tag;
  td2.innerText = inv.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  td3.innerText = val.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  td4.innerText =
    "  + " +
    ret.toLocaleString("en-US", { maximumSignificantDigits: 4 }) * 100 +
    "%";
  td5.innerText = "";
  tr.appendChild(td1);
  tr.appendChild(td2);
  tr.appendChild(td3);
  tr.appendChild(td4);
  tr.appendChild(td5);
  tr.appendChild(td6);
  resTable.appendChild(tr);
}
function changeCurrencyE(e){
  d = [];
  p = [];
  w = [];
  spW = [];
  loadData(e.target.value);
  changeCurrency(e.target.value);
}


function changeCurrency(e) {
  const token = e;
  //console.log(e.target.value);

  // parseTokenData(token, data);
  setForm();
  //initZoomData();
  //calculateWallet();

  mChart.data.labels = dZ;
  mChart.data.datasets[0].data = pZ; //load new
  mChart.data.datasets[1].data = w;
  mChart.data.datasets[2].data = spW;
  mChart.options.scales.myScale.min = minRange(pZ);
  mChart.options.scales.myScale2.max = maxRange(w);
  mChart.update();

  //drawMainChart(token);
}

function calculateWalletBtn(e) {
  e.preventDefault();
  zoomData2();
  calculateWallet();
  /*mChart.data.datasets[0].data = pZ;*/
  mChart.data.datasets[1].data = w;
  mChart.data.datasets[2].data = spW;
  mChart.options.scales.myScale.min = minRange(pZ);
  mChart.options.scales.myScale2.max = maxRange(w);
  mChart.data.datasets[1].borderWidth = wBarThickness;
  /*mChart.data.datasets[2].data = spPZ;*/
  //logArrays();
  mChart.update();
  console.log("updejtuje mchart");

  //console.log("po update mchart: " + pZ);
  //w=[];
}

function calculateWallet() {
  let j;
  inv = 0;
  let adding = false;
  w = [];
  spW = [];
  let sp = [];

  console.log("pierwsza cena " + spPZ[0]);
  console.log("pierwsza data " + new Date(spDZ[0]));

  //iterate throught zoomed data
  for (let i = 0; i < pZ.length; i++) {
    wColor[i] = "rgb(255, 159, 186)";
    wBarThickness[i] = barThickness(pZ.length) * 0.2;

    if (dZ[i] == startDateInput.value) {
      j = i % +investInterval.value;
      adding = true;
    }
    4;

    if (adding && i % +investInterval.value === j) {
      if (i > 0) {
        nt[i] = nt[i - 1] + +amountInvested.value / pZ[i];
        sp[i] = sp[i - 1] + +amountInvested.value / spPZ[i];
        wColor[i] = "rgb(72, 167, 255)";
        wBarThickness[i] = 0;
      } else {
        nt[i] = +amountInvested.value / pZ[i];
        sp[i] = +amountInvested.value / spPZ[i];
      }
      inv += +amountInvested.value;
    } else {
      if (i > 0) {
        nt[i] = nt[i - 1];
        sp[i] = sp[i - 1];
      } else {
        nt[i] = 0;
        sp[i] = 0;
      }
    }
    w[i] = nt[i] * pZ[i];
    spW[i] = sp[i] * spPZ[i];
    //console.log(spPZ[i] + " + " + sp[i] + " + " + spW[i]);
  }

  //console.log(spW);

  //if (resTable.children[1]) resTable.children[1].remove();
}

function initZoomData() {
  let start;
  let end;
  console.log("initial SPP length" + spP.length);

  for (let i = 0; i < p.length; i++) {
    if (d[i] === startDateInput.value) {
      start = i;
    }
    if (d[i] === endDateInput.value) {
      end = i;
    }
  }

  dZ = d.slice(start, end);
  pZ = p.slice(start, end);
  spPZ = spP.slice(start, end);
  spDZ = spD.slice(start, end);
  console.log("po init zoomie: " + spPZ[0]);
}

function zoomData2() {
  let start;
  let end;

  for (let i = 0; i < p.length; i++) {
    if (d[i] === startDateInput.value) {
      start = i;
    }
    if (d[i] === endDateInput.value) {
      end = i;
    }
  }

  pZ = p.slice(start, end);
  dZ = d.slice(start, end);
  spPZ = spP.slice(start, end);
  spDZ = spD.slice(start, end);

  console.log("po normallnym zoomie: " + spPZ[0]);

  mChart.data.labels = dZ;
  mChart.data.datasets[0].data = pZ;
  mChart.data.datasets[2].data = spPZ;
}

function logArrays() {
  console.log(
    "W:" +
      w.length +
      " pZ:" +
      pZ.length +
      " dZ:" +
      dZ.length +
      " p:" +
      p.length +
      " d:" +
      d.length +
      " spPZ:" +
      spPZ.length
  );
}

function drawMainChart(token) {
  console.log("Drawing init chart");
  logArrays();
  let labels = dZ;
  let data = {
    labels: labels,
    datasets: [
      {
        label: token + " price",
        type: "line",
        backgroundColor: "rgb(255, 159, 186)",
        borderColor: "rgb(255, 99, 132)",
        data: pZ,
        hidden: false,
      },
      {
        label: "wallet",
        type: "bar",
        backgroundColor: wColor,
        barThickness: "flex",
        barPercentage: 1,
        categoryPercentage: 1,
        borderWidth: wBarThickness,
        borderColor: "rgba(255, 99, 132,0.1)",
        data: w,
        yAxisID: "myScale2",
        order: 2,
        hidden: false,
      },
      {
        label: "S&P wallet",
        type: "bar",
        backgroundColor: "rgba(117, 6, 6, 0.6)",
        borderColor: "rgb(117, 6, 6)",
        data: spW,
        yAxisID: "myScale2",
        order: 1,
        hidden: false,
      },
    ],
  };

  let config = {
    /*type: "line",*/
    data: data,
    options: {
      scales: {
        myScale: {
          type: "logarithmic",
          position: "left",
          min: minRange(data.datasets[0].data),
          /*min: function (context) {
            return context.chart.data.datasets[0].data[0] / 8;
          },*/
        },
        myScale2: {
          /*type: "logarithmic",*/
          position: "right",
          min: 0,
        },
      },
      elements: {
        point: {
          radius: 1,
        },
      },
    },
  };

  mChart = new Chart(mChartCanvas, config);
}

function barThickness(numOfBars) {
  if (mChart == undefined) {
    return 1;
  }
  return mChart.width / numOfBars;
}

function minRange(data) {
  let min = data[0];
  data.forEach((d) => {
    if (d < min) min = d;
  });
  return min * 0.95;
}

function maxRange(data) {
  let max = data[0];
  data.forEach((d) => {
    if (d > max) max = d;
  });

  return max * 1.05;
}

function setForm() {
  startDateInput.setAttribute("min", d[0]);
  startDateInput.setAttribute("max", d[d.length - 1]);
  startDateInput.setAttribute("value", d[0]);

  endDateInput.setAttribute("min", d[0]);
  endDateInput.setAttribute("max", d[d.length - 1]);
  endDateInput.setAttribute("value", d[d.length - 1]);

  amountInvested.setAttribute("value", 100);
  investInterval.setAttribute("value", 7);

  sp500opt.checked= true;
  assetPriceOpt.checked= true;

}

function loadData(token) {
  $(function () {
    // sent a GET request to retrieve the CSV file contents
    $.get("./src/sp500.csv", function (CSVdata) {
      // CSVdata is populated with the file contents
      // ready to be converted into an Array
      const data = $.csv.toObjects(CSVdata);
      //console.log(data);

      $.get("./src/crypto_price_data_mini.csv", function (CSVdata) {
        // CSVdata is populated with the file contents
        // ready to be converted into an Array
        const tdata = $.csv.toObjects(CSVdata);
        parseTokenData(token, tdata);
        parseSPData(data);
        initZoomData();
        calculateWallet();
        //drawMainChart(token);
        changeCurrency("btc")
        printInitTableData();
      });
    });
  });
}

function parseSPData(data) {
  console.log("initial SP data length to parse: " + data.length);
  data.forEach((record) => {
    let y = record["Date"].slice(6, 10);
    let day = record["Date"].slice(0, 2);
    let date = y + record["Date"].slice(2, 6) + day;
    //console.log( Date.parse(date) + "  " + Date.parse(d[0]));
    //checking if date ranges are the same
    if (
      Date.parse(date) >= Date.parse(d[0]) &&
      Date.parse(date) <= Date.parse(d[d.length - 1])
    ) {
      //console.log("in range");

      //checking if data is missing beginning

      if (
        (Date.parse(date) - Date.parse(d[0])) / 86400000 > 0 &&
        spP.length == 0
      ) {
        for (
          let j = 0;
          j < (Date.parse(date) - Date.parse(d[0])) / 86400000;
          j++
        ) {
          spD.push(Date.parse(d[0]));
          spP.push(+record["Price"]);
          spW.push(10000);
          console.log("puszin begining");
        }

        console.log(
          "missing front" +
            Date.parse(date) +
            " " +
            Date.parse(d[0]) +
            " " +
            (Date.parse(date) - Date.parse(d[0])) / 86400000
        );
      }

      //checking if data is continious

      if (Date.parse(date) > Date.parse(spD[spD.length - 1]) + 86400000) {
        for (
          let i = 1;
          i < (Date.parse(date) - Date.parse(spD[spD.length - 1])) / 86400000;
          i++
        ) {
          spD.push(spD[spD.length - 1]);
          spP.push(spP[spP.length - 1]);
          spW.push(10000);
        }
      }

      spD.push(date);
      spP.push(+record["Price"]);
      spW.push(100000);
    }
  });
}

function parseTokenData(token, data) {
  data.forEach((record) => {
    if (record["Symbol"] === token) {
      //create new chart arrays for selected token
      d.push(record["Date"]);
      p.push(+record["Price"]);
      w.push(1);
    }
  });

  setForm();
  //logArrays();
  //initZoomData();
  //calculateWallet();
}

function loadAllData(token) {
  //executes when page and token data are loaded
  $(function () {
    // sent a GET request to retrieve the CSV file contents
    $.get("./src/crypto_price_data_mini.csv", function (CSVdata) {
      // CSVdata is populated with the file contents
      // ready to be converted into an Array
      data = $.csv.toObjects(CSVdata);
      parseTokenData(token, data);
      drawMainChart(token);
    });
  });
}

function printInitTableData() {
  createRowResult(
    "S&P benchmark",
    inv,
    spW[spW.length - 1],
    spW[spW.length - 1] / inv - 1
  );

  createRowResult(
    description.value,
    inv,
    w[pZ.length - 1],
    w[pZ.length - 1] / inv - 1
  );
}

function loadSP500() {
  //console.log("sp500");
  $(function () {
    // sent a GET request to retrieve the CSV file contents
    $.get("./src/sp500.csv", function (CSVdata) {
      // CSVdata is populated with the file contents
      // ready to be converted into an Array
      const data = $.csv.toObjects(CSVdata);
      //console.log(data);
      data.forEach((record) => {
        let y = record["Date"].slice(6, 10);
        let day = record["Date"].slice(0, 2);
        let date = y + record["Date"].slice(2, 6) + day;
        //console.log( Date.parse(date) + "  " + Date.parse(d[0]));
        //checking if date ranges are the same
        if (
          Date.parse(date) >= Date.parse(d[0]) &&
          Date.parse(date) <= Date.parse(d[d.length - 1])
        ) {
          //console.log("in range");

          //checking if data is missing beginning

          if (
            (Date.parse(date) - Date.parse(d[0])) / 86400000 > 0 &&
            spP.length == 0
          ) {
            for (
              let j = 0;
              j < (Date.parse(date) - Date.parse(d[0])) / 86400000;
              j++
            ) {
              spD.push(Date.parse(d[0]));
              spP.push(+record["Price"]);
              spW.push(10000);
              console.log("puszin begining");
            }

            console.log(
              "missing front" +
                Date.parse(date) +
                " " +
                Date.parse(d[0]) +
                " " +
                (Date.parse(date) - Date.parse(d[0])) / 86400000
            );
          }

          //checking if data is continious

          if (Date.parse(date) > Date.parse(spD[spD.length - 1]) + 86400000) {
            for (
              let i = 1;
              i <
              (Date.parse(date) - Date.parse(spD[spD.length - 1])) / 86400000;
              i++
            ) {
              spD.push(spD[spD.length - 1]);
              spP.push(spP[spP.length - 1]);
              spW.push(10000);
            }
          }

          spD.push(date);
          spP.push(+record["Price"]);
          spW.push(100000);
        }
      });
      console.log(spP[0]);
      console.log(new Date(spD[0]));
      for (let i = 1; i < 20; i++) {
        console.log(spP[i]);
      }
    });
  });
}

function showSP500() {
  // mChart.data.datasets[1].data = w;
  if (sp500opt.checked) {
    mChart.data.datasets[2].hidden = false;
  } else {
    mChart.data.datasets[2].hidden = true;
  }
  mChart.update();
}

function showAssetPrice() {
  if (assetPriceOpt.checked) {
    mChart.data.datasets[0].hidden = false;
  } else {
    mChart.data.datasets[0].hidden = true;
  }
  mChart.update();
}

if (module.hot) {
  module.hot.accept();
}
