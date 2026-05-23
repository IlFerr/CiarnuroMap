export function mostraAttributi(group, { tornaIndietroCallback } = {}) {
  const info =
    group && group.userData && group.userData.info ? group.userData.info : null;

  const panel = document.createElement("div");
  panel.classList.add("info-panel");
  document.body.appendChild(panel);

  const title = document.createElement("h1");
  title.classList.add("panel-title");
  title.innerText = info && info.name ? info.name : "Sconosciuto";
  panel.appendChild(title);

  if (info && info.type) {
    const typeEl = document.createElement("h2");
    typeEl.classList.add("panel-type");
    typeEl.innerText = info.type;
    panel.appendChild(typeEl);
  }

  const contentScroll = document.createElement("div");
  contentScroll.classList.add("panel-content");
  panel.appendChild(contentScroll);

  const descSection = document.createElement("div");
  descSection.classList.add("panel-section");
  const descLabel = document.createElement("h3");
  descLabel.innerText = "Descrizione";
  descSection.appendChild(descLabel);
  const descText = document.createElement("p");
  descText.classList.add("panel-description");
  descText.innerText =
    info && info.description
      ? info.description
      : "Nessuna descrizione disponibile.";
  descSection.appendChild(descText);
  contentScroll.appendChild(descSection);

  const specSection = document.createElement("div");
  specSection.classList.add("panel-section");
  const specLabel = document.createElement("h3");
  specLabel.innerText = "Caratteristiche";
  specSection.appendChild(specLabel);
  const specList = document.createElement("ul");
  specList.classList.add("panel-specs");

  const liType = document.createElement("li");
  liType.innerHTML =
    "<strong>Tipo:</strong> " + (info && info.type ? info.type : "-");
  specList.appendChild(liType);

  const liDiameter = document.createElement("li");
  liDiameter.innerHTML =
    "<strong>Diametro:</strong> " +
    (info && info.diameter != null ? info.diameter + " km" : "-");
  specList.appendChild(liDiameter);

  const liDistance = document.createElement("li");
  const distValue =
    info && info.sunDistance != null
      ? info.sunDistance
      : info && info.distance != null
        ? info.distance
        : null;
  liDistance.innerHTML =
    "<strong>Distanza:</strong> " +
    (distValue != null ? distValue + " UA" : "-");
  specList.appendChild(liDistance);

  if (info && info.planetDistance != null) {
    const liMoonDist = document.createElement("li");
    liMoonDist.innerHTML =
      "<strong>Satellite di:</strong> " + (info.name || "");
    specList.appendChild(liMoonDist);
  }

  specSection.appendChild(specList);
  contentScroll.appendChild(specSection);

  const back = document.createElement("button");
  back.classList.add("backButton");
  const img = document.createElement("img");
  img.src = "./assets/img/back.png";
  img.alt = "back";
  back.appendChild(img);
  document.body.appendChild(back);

  back.onclick = () => {
    rimuoviAttributi();
    if (typeof tornaIndietroCallback === "function") tornaIndietroCallback();
  };
}

export function rimuoviAttributi() {
  document.querySelectorAll(".info-panel").forEach((p) => p.remove());
  document.querySelectorAll(".backButton").forEach((b) => b.remove());
}
