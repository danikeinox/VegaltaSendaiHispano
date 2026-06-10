function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function inlineSvgImages(svg: SVGSVGElement): Promise<void> {
  const images = svg.querySelectorAll("image");

  await Promise.all(
    Array.from(images).map(async (image) => {
      const href =
        image.getAttribute("href") ??
        image.getAttributeNS("http://www.w3.org/1999/xlink", "href");

      if (!href || href.startsWith("data:")) return;

      const assetUrl = href.startsWith("/")
        ? `${window.location.origin}${href}`
        : href;

      const response = await fetch(assetUrl);
      if (!response.ok) return;

      const dataUrl = await blobToDataUrl(await response.blob());
      image.setAttribute("href", dataUrl);
      image.removeAttributeNS("http://www.w3.org/1999/xlink", "href");
    })
  );
}

export async function exportCardSvgToPng(
  container: HTMLElement,
  scale = 2
): Promise<Blob> {
  const svg = container.querySelector("svg");
  if (!svg) {
    throw new Error("Card SVG not found");
  }

  const clone = svg.cloneNode(true) as SVGSVGElement;
  await inlineSvgImages(clone);

  const svgString = new XMLSerializer().serializeToString(clone);
  const objectUrl = URL.createObjectURL(
    new Blob([svgString], { type: "image/svg+xml;charset=utf-8" })
  );

  try {
    return await new Promise<Blob>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const width = 520 * scale;
        const height = 325 * scale;
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Canvas not supported"));
          return;
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to export PNG"));
        }, "image/png");
      };

      image.onerror = () => reject(new Error("Failed to render card image"));
      image.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
