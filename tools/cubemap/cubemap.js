const facesOrder = ["posx", "negx", "posy", "negy", "posz", "negz"];

function directionToUV(x, y, z) {
  const theta = Math.atan2(z, x);
  const phi = Math.asin(y);
  return [
    theta / (2 * Math.PI) + 0.5,
    0.5 - phi / Math.PI
  ];
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

      const l = Math.hypot(dx, dy, dz);
      dx /= l; dy /= l; dz /= l;

      const [u, v] = directionToUV(dx, dy, dz);
      const px = Math.floor(u * (pw - 1));
      const py = Math.floor(v * (ph - 1));
      const pi = (py * pw + px) * 4;

      const i = (y * size + x) * 4;
      img.data[i]     = panoData[pi];
      img.data[i + 1] = panoData[pi + 1];
      img.data[i + 2] = panoData[pi + 2];
      img.data[i + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  return canvas;
}

document.getElementById("generateBtn").onclick = () => {
  const file = document.getElementById("panoInput").files[0];
  if (!file) return alert("Select a panorama");

  const size = parseInt(document.getElementById("resInput").value);
  const facesDiv = document.getElementById("faces");
  facesDiv.innerHTML = "";

  const img = new Image();
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const data = ctx.getImageData(0, 0, img.width, img.height).data;

    for (const face of facesOrder) {
      const faceCanvas = generateFace(data, img.width, img.height, size, face);
      const label = document.createElement("div");
      label.style.textAlign = "center";
      label.innerHTML = `<strong>${face}</strong>`;
      label.appendChild(faceCanvas);
      facesDiv.appendChild(label);
    }
  };

  img.src = URL.createObjectURL(file);
};
