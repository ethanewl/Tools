const facesOrder = ["posx", "negx", "posy", "negy", "posz", "negz"];

// -------------------------
// Math
// -------------------------

function directionToUV(x, y, z) {
  const theta = Math.atan2(z, x);
  const phi = Math.asin(y);
  return [
    theta / (2 * Math.PI) + 0.5,
    0.5 - phi / Math.PI
  ];
}

// -------------------------
// Face generation
// -------------------------

function generateFace(panoData, pw, ph, size, face) {
  const canvas = document.createElement("canvas");
  if (!canvas) {
    console.error("Failed to create canvas element");
    return;
  }
  
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Failed to get 2D context. Resolution might be too high.");
    return;
  }

  const img = ctx.createImageData(size, size);


  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {

      const a = 2 * (x + 0.5) / size - 1;
      const b = 2 * (y + 0.5) / size - 1;

      let dx, dy, dz;
      if (face === "posx") [dx, dy, dz] = [1, -b, -a];
      if (face === "negx") [dx, dy, dz] = [-1, -b, a];
      if (face === "posy") [dx, dy, dz] = [a, 1, b];
      if (face === "negy") [dx, dy, dz] = [a, -1, -b];
      if (face === "posz") [dx, dy, dz] = [a, -b, 1];
      if (face === "negz") [dx, dy, dz] = [-a, -b, -1];

      const len = Math.hypot(dx, dy, dz);
      dx /= len;
      dy /= len;
      dz /= len;

      const [u, v] = directionToUV(dx, dy, dz);

      const px = Math.max(0, Math.min(pw - 1, Math.floor(u * pw)));
      const py = Math.max(0, Math.min(ph - 1, Math.floor(v * ph)));
      const panoIndex = (py * pw + px) * 4;

      const i = (y * size + x) * 4;
      img.data[i]     = panoData[panoIndex];
      img.data[i + 1] = panoData[panoIndex + 1];
      img.data[i + 2] = panoData[panoIndex + 2];
      img.data[i + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  return canvas;
}

// -------------------------
// UI hook
// -------------------------

document.getElementById("generateBtn").onclick = () => {
  const fileInput = document.getElementById("panoInput");
  const resInput = document.getElementById("resInput");
  const facesDiv = document.getElementById("faces");

  if (!fileInput.files.length) {
    alert("Select a panorama image");
    return;
  }

  const size = parseInt(resInput.value);
  if (!size || size <= 0) {
    alert("Invalid resolution");
    return;
  }

  facesDiv.innerHTML = "";

  const img = new Image();
  img.onload = () => {
    // Draw panorama to temp canvas
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(img, 0, 0);

    const panoData = tempCtx.getImageData(
      0, 0, img.width, img.height
    ).data;

    // Generate faces
    for (const face of facesOrder) {
      const faceCanvas = generateFace(
        panoData,
        img.width,
        img.height,
        size,
        face
      );

      const wrapper = document.createElement("div");
      wrapper.style.textAlign = "center";

      const label = document.createElement("div");
      label.textContent = face;
      label.style.marginBottom = "4px";
      label.style.fontWeight = "bold";

      wrapper.appendChild(label);
      wrapper.appendChild(faceCanvas);
      facesDiv.appendChild(wrapper);
    }
  };

  img.src = URL.createObjectURL(fileInput.files[0]);
};
