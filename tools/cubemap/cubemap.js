const facesOrder = ["posx", "negx", "posy", "negy", "posz", "negz"];

// Helper for UV mapping
function directionToUV(x, y, z) {
  const theta = Math.atan2(z, x);
  const phi = Math.asin(y);
  return [theta / (2 * Math.PI) + 0.5, 0.5 - phi / Math.PI];
}

async function processFile(file, size) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.drawImage(img, 0, 0);
      const panoData = tempCtx.getImageData(0, 0, img.width, img.height).data;

      const faceCanvases = {};
      for (const face of facesOrder) {
        faceCanvases[face] = generateFace(panoData, img.width, img.height, size, face);
      }

      // Stitching
      const crossCanvas = document.createElement("canvas");
      crossCanvas.width = size * 4;
      crossCanvas.height = size * 3;
      const ctx = crossCanvas.getContext("2d");

      ctx.drawImage(faceCanvases["posy"], size, 0);
      ctx.drawImage(faceCanvases["negx"], 0, size);
      ctx.drawImage(faceCanvases["posz"], size, size);
      ctx.drawImage(faceCanvases["posx"], size * 2, size);
      ctx.drawImage(faceCanvases["negz"], size * 3, size);
      ctx.drawImage(faceCanvases["negy"], size, size * 2);

      resolve(crossCanvas.toDataURL("image/png"));
    };
    img.src = URL.createObjectURL(file);
  });
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
      else if (face === "negx") [dx, dy, dz] = [-1, -b, a];
      else if (face === "posy") [dx, dy, dz] = [a, 1, b];
      else if (face === "negy") [dx, dy, dz] = [a, -1, -b];
      else if (face === "posz") [dx, dy, dz] = [a, -b, 1];
      else if (face === "negz") [dx, dy, dz] = [-a, -b, -1];

      const len = Math.hypot(dx, dy, dz);
      const [u, v] = directionToUV(dx/len, dy/len, dz/len);

      const px = Math.max(0, Math.min(pw - 1, Math.floor(u * (pw - 1))));
      const py = Math.max(0, Math.min(ph - 1, Math.floor(v * (ph - 1))));
      const panoIndex = (py * pw + px) * 4;

      const i = (y * size + x) * 4;
      img.data[i] = panoData[panoIndex];
      img.data[i+1] = panoData[panoIndex+1];
      img.data[i+2] = panoData[panoIndex+2];
      img.data[i+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

// UI Handling
document.getElementById("generateBtn").onclick = async () => {
  const files = document.getElementById("panoInput").files;
  const size = parseInt(document.getElementById("resInput").value);
  const resultsList = document.getElementById("results-list");

  if (files.length === 0) return alert("Please select images first.");

  for (let file of files) {
    const dataUrl = await processFile(file, size);
    
    const item = document.createElement("div");
    item.className = "batch-item";
    item.innerHTML = `
      <span>${file.name}</span>
      <a href="${dataUrl}" download="cubemap_${file.name}" class="download-btn">Download PNG</a>
    `;
    resultsList.appendChild(item);
  }
};
