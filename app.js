const URL = "./models/";
const webcamElement = document.getElementById("webcam");
const statusElement = document.getElementById("status");
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const predictionList = document.getElementById("predictionList");

let model, webcam, isPredicting = false;

async function init() {
  try {
    statusElement.textContent = "載入模型...";
    model = await tmImage.load(URL + "model.json", URL + "metadata.json");
    statusElement.textContent = "模型已載入，請啟動攝影機。";
    startButton.disabled = false;
  } catch (error) {
    console.error("模型載入失敗", error);
    statusElement.textContent = "無法載入模型。請確認 models 資料夾存在並包含 model.json/metadata.json。";
  }
}

async function initWebcam() {
  try {
    webcam = new tmImage.Webcam(640, 480, true);
    await webcam.setup();
    await webcam.play();
    webcamElement.srcObject = webcam.webcam.stream;
    window.requestAnimationFrame(loop);
    statusElement.textContent = "攝影機已啟動。正在辨識中...";
    startButton.disabled = true;
    stopButton.disabled = false;
    isPredicting = true;
  } catch (error) {
    console.error("無法啟動攝影機", error);
    statusElement.textContent = "攝影機啟動失敗，請確認瀏覽器有權限使用攝影機。";
  }
}

function stopWebcam() {
  if (!webcam) return;
  webcam.stop();
  webcamElement.srcObject = null;
  isPredicting = false;
  startButton.disabled = false;
  stopButton.disabled = true;
  statusElement.textContent = "攝影機已停止。按下啟動攝影機開始辨識。";
}

async function loop() {
  if (!isPredicting) return;
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);
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
