const URL = "./models/";
const webcamElement = document.getElementById("webcam");
const statusElement = document.getElementById("status");
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const predictionList = document.getElementById("predictionList");

let model = null;
let stream = null;
let isPredicting = false;
const hiddenCanvas = document.createElement("canvas");
const hiddenCtx = hiddenCanvas.getContext("2d");
const IMAGE_SIZE = 224;
hiddenCanvas.width = IMAGE_SIZE;
hiddenCanvas.height = IMAGE_SIZE;

async function init() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      statusElement.textContent = "此瀏覽器不支援攝影機存取。請使用 Chrome、Edge 或 Firefox。";
      startButton.disabled = true;
      return;
    }

    statusElement.textContent = "載入模型...";
    model = await tmImage.load(URL + "model.json", URL + "metadata.json");
    statusElement.textContent = "模型已載入，請啟動攝影機。";
    startButton.disabled = false;
  } catch (error) {
    console.error("模型載入失敗", error);
    statusElement.textContent = "無法載入模型。請確認 models 資料夾存在並包含 model.json/metadata.json。";
    startButton.disabled = true;
  }
}

async function initWebcam() {
  try {
    statusElement.textContent = "請求攝影機權限...";
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
    webcamElement.srcObject = stream;
    await webcamElement.play();

    statusElement.textContent = "攝影機已啟動。正在辨識中...";
    startButton.disabled = true;
    stopButton.disabled = false;
    isPredicting = true;

    window.requestAnimationFrame(loop);
  } catch (error) {
    console.error("無法啟動攝影機", error);
    statusElement.textContent = `攝影機啟動失敗：${error.message || error}`;
  }
}

function stopWebcam() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }
  webcamElement.srcObject = null;
  isPredicting = false;
  startButton.disabled = false;
  stopButton.disabled = true;
  statusElement.textContent = "攝影機已停止。按下啟動攝影機開始辨識。";
}

async function loop() {
  if (!isPredicting) return;
  try {
    hiddenCtx.drawImage(webcamElement, 0, 0, IMAGE_SIZE, IMAGE_SIZE);
    await predict();
    window.requestAnimationFrame(loop);
  } catch (error) {
    console.error("辨識循環錯誤", error);
    statusElement.textContent = `辨識失敗：${error.message || error}`;
    stopWebcam();
  }
}

async function predict() {
  const prediction = await model.predict(hiddenCanvas);
  renderPredictions(prediction);
}

function renderPredictions(predictions) {
  predictionList.innerHTML = "";
  predictions.sort((a, b) => b.probability - a.probability);

  predictions.forEach((item) => {
    const row = document.createElement("div");
    row.className = "prediction-item";

    const label = document.createElement("div");
    label.className = "prediction-label";
    label.innerHTML = `<span>${item.className}</span><span>${(item.probability * 100).toFixed(1)}%</span>`;

    const bar = document.createElement("div");
    bar.className = "prediction-bar";
    const fill = document.createElement("div");
    fill.className = "prediction-fill";
    fill.style.width = `${item.probability * 100}%`;
    bar.appendChild(fill);

    row.appendChild(label);
    row.appendChild(bar);
    predictionList.appendChild(row);
  });
}

startButton.addEventListener("click", initWebcam);
stopButton.addEventListener("click", stopWebcam);

init();
