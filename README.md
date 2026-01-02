# Tools
tools I have made over the years

https://ethanewl.github.io/Tools/


**Pano to cubemap converter**

Browser-based utility for converting 2:1 Equirectangular Panoramas into Unity-ready Cubemap Horizontal Crosses or individual face sets.

### Key Features

* **Power-of-Two Snapping:** Automatically snaps inputs to the nearest GPU-optimized resolution (e.g., 512, 1024, 2048).
* **Dual-Resolution Logic:** Toggle between defining the **Face Size** or the total **Stitch Width**.
* **Batch Processing:** Process multiple panoramas simultaneously in a non-blocking queue.
* **Local Processing:** 100% client-side. No images are uploaded to a server; your data stays in your browser.
* **Two Export Modes:**
    * **Stitched Cross:** A single `.png` in a 4x3 horizontal cross layout.
    * **Individual Faces:** A `.zip` containing 6 named textures (`posx`, `negx`, `posy`, `negy`, `posz`, `negz`).



### License

This project is open-source and available under the MIT License.
