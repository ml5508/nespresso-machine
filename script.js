// The machine has only four MAIN states.
const states = {
  OFF: "off",
  READY: "ready",
  BREWING: "brewing",
  FINISHED: "finished"
};

let machineState = states.OFF;
let hasCapsule = false;
let capsuleIsUsed = false;
let isLidClosed = false;
let waterLevel = 0;
let brewTimer;
let brewProgress = 0;

const machine = document.querySelector(".machine");
const mainButton = document.querySelector("#mainButton");
const capsuleButton = document.querySelector("#capsuleButton");
const lidButton = document.querySelector("#lidButton");
const waterButton = document.querySelector("#waterButton");
const ejectButton = document.querySelector("#ejectButton");
const stateBadge = document.querySelector("#stateBadge");
const statusTitle = document.querySelector("#statusTitle");
const statusMessage = document.querySelector("#statusMessage");
const capsuleDot = document.querySelector("#capsuleDot");
const capsuleLabel = document.querySelector("#capsuleLabel");
const waterText = document.querySelector("#waterText");
const lidText = document.querySelector("#lidText");
const progressFill = document.querySelector("#progressFill");
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector(".progress-track");

function updateScreen(title, message) {
  machine.className = `machine ${machineState}`;
  stateBadge.textContent = machineState.toUpperCase();
  statusTitle.textContent = title;
  statusMessage.textContent = message;
  capsuleDot.classList.toggle("loaded", hasCapsule && !capsuleIsUsed);
  capsuleDot.classList.toggle("used", hasCapsule && capsuleIsUsed);
  capsuleLabel.textContent = !hasCapsule
    ? "No capsule"
    : capsuleIsUsed
      ? "Used capsule — eject it"
      : "Capsule inserted";
  waterText.textContent = `Water: ${waterLevel}%`;
  lidText.textContent = `Lid: ${isLidClosed ? "closed" : "open"}`;
  lidButton.textContent = isLidClosed ? "Open lid" : "Close lid";

  // Setup controls represent physical actions, so they are unavailable while brewing.
  const isBrewing = machineState === states.BREWING;
  capsuleButton.disabled = isBrewing || hasCapsule || isLidClosed;
  lidButton.disabled = isBrewing;
  waterButton.disabled = isBrewing || waterLevel === 100;
  ejectButton.disabled = isBrewing || !hasCapsule || isLidClosed;
}

function setProgress(amount) {
  progressFill.style.width = `${amount}%`;
  progressText.textContent = `${amount}%`;
  progressBar.setAttribute("aria-valuenow", amount);
  document.documentElement.style.setProperty("--coffee-level", `${amount}%`);
}

function startBrewing() {
  machineState = states.BREWING;
  brewProgress = 0;
  setProgress(0);
  updateScreen("Brewing coffee", "The main button pulses while the coffee is brewing.");

  brewTimer = setInterval(() => {
    brewProgress += 2;
    setProgress(brewProgress);

    if (brewProgress >= 100) {
      clearInterval(brewTimer);
      waterLevel -= 25;
      capsuleIsUsed = true;
      machineState = states.FINISHED;
      updateScreen("Coffee is ready", "Open the lid and eject the used capsule to prepare another coffee.");
    }
  }, 90);
}

function handleMainButton() {
  if (machineState === states.OFF) {
    machineState = states.READY;
    updateScreen("Machine is ready", "Insert a capsule, add water, then press the main button to brew.");
    return;
  }

  if (machineState === states.READY) {
    if (hasCapsule && capsuleIsUsed) {
      updateScreen("Used capsule alert", "Open the lid and eject the used capsule before brewing again.");
    } else if (!hasCapsule && waterLevel < 25) {
      updateScreen("Machine needs setup", "Insert a capsule and add at least 25% water before brewing.");
    } else if (!hasCapsule) {
      updateScreen("Capsule needed", "Insert a capsule, then press the main button again.");
    } else if (waterLevel < 25) {
      updateScreen("More water needed", "Add at least 25% water, then press the main button again.");
    } else if (!isLidClosed) {
      updateScreen("Close the lid", "Close the lid fully, then press the main button again.");
    } else {
      startBrewing();
    }
    return;
  }

  if (machineState === states.BREWING) {
    clearInterval(brewTimer);

    // Use water according to how far the brew had progressed.
    const waterUsed = Math.ceil((brewProgress / 100) * 25);
    waterLevel = Math.max(0, waterLevel - waterUsed);
    capsuleIsUsed = true;
    machineState = states.READY;
    setProgress(0);
    updateScreen(
      "Brewing stopped",
      "The capsule is now used. Open the lid and eject it before brewing again."
    );
    return;
  }

  updateScreen("Used capsule alert", "Open the lid and eject the used capsule before making another coffee.");
}

mainButton.addEventListener("click", handleMainButton);

capsuleButton.addEventListener("click", () => {
  hasCapsule = true;
  capsuleIsUsed = false;
  updateScreen("Capsule inserted", "Close the lid when you are ready to brew.");
});

lidButton.addEventListener("click", () => {
  isLidClosed = !isLidClosed;
  const lidMessage = isLidClosed
    ? "The lid is fully closed. Press the main button when the machine is ready."
    : "The lid is open. You can insert or eject a capsule.";
  updateScreen(isLidClosed ? "Lid closed" : "Lid open", lidMessage);
});

waterButton.addEventListener("click", () => {
  waterLevel = Math.min(100, waterLevel + 25);
  updateScreen("Water added", "The machine remains in its current main state.");
});

ejectButton.addEventListener("click", () => {
  hasCapsule = false;
  capsuleIsUsed = false;
  if (machineState === states.FINISHED) {
    machineState = states.READY;
    setProgress(0);
    updateScreen("Machine is ready", "Insert a new capsule when you want another coffee.");
  } else {
    updateScreen("Capsule ejected", "Insert a capsule when you are ready to brew.");
  }
});

updateScreen("Machine is off", "Press the main button to turn it on.");
