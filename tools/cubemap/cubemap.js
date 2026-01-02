const facesOrder = ["posx", "negx", "posy", "negy", "posz", "negz"];

function directionToUV(x, y, z) {
  const theta = Math.atan2(z, x);
  const phi = Math.asin(y);
  return [theta / (2 * Math.PI) + 0.5, 0.5 - phi / Math.PI];
}

function generateFace(panoData, pw, ph, size, face) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
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
      const [u, v] = directionToUV(dx/len, dy/len, dz/len);

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

document.getElementById("generateBtn").onclick = () => {
  const fileInput = document.getElementById("panoInput");
  const size = parseInt(document.getElementById("resInput").value);
  const status = document.getElementById("statusLabel");
  const crossCanvas = document.getElementById("crossCanvas");
  const downloadLink = document.getElementById("downloadLink");

  if (!fileInput.files[0]) return alert("Select an image");

  status.textContent = "Processing... (This may take a moment)";
  
  const img = new Image();
  img.onload = () => {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(img, 0, 0);
    const panoData = tempCtx.getImageData(0, 0, img.width, img.height).data;

    // Generate all 6 faces in memory
    const faceCanvases = {};
    for (const face of facesOrder) {
      faceCanvases[face] = generateFace(panoData, img.width, img.height, size, face);
    }

    // Stitch into Cross (4w x 3h)
    crossCanvas.width = size * 4;
    crossCanvas.height = size * 3;
    const ctx = crossCanvas.getContext("2d");

    // Layout mapping (Replicating your Python stitch_cross)
    ctx.drawImage(faceCanvases["posy"], size, 0);      // Top
    ctx.drawImage(faceCanvases["negx"], 0, size);      // Left
    ctx.drawImage(faceCanvases["posz"], size, size);   // Front
    ctx.drawImage(faceCanvases["posx"], size * 2, size); // Right
    ctx.drawImage(faceCanvases["negz"], size * 3, size); // Back
    ctx.drawImage(faceCanvases["negy"], size, size * 2); // Bottom

    // Setup Download
    status.textContent = "Done! ✔";
    document.getElementById("resultTitle").style.display = "block";
    downloadLink.style.display = "inline-block";
    downloadLink.href = crossCanvas.toDataURL("image/png");
    downloadLink.download = "cubemap_cross.png";
  };
  img.src = URL.createObjectURL(fileInput.files[0]);
};
