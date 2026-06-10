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
      if (!response.ok) {
        throw new Error(`Failed to inline card asset: ${assetUrl}`);
      }

      const dataUrl = await blobToDataUrl(await response.blob());
      image.setAttribute("href", dataUrl);
      image.removeAttributeNS("http://www.w3.org/1999/xlink", "href");
    })
  );
}

function parseSvgMarkup(svgMarkup: string): SVGSVGElement {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgMarkup, "image/svg+xml");
  const parseError = doc.querySelector("parsererror");

  if (parseError) {
    throw new Error("Invalid card SVG markup");
  }

  const svg = doc.documentElement;
  if (!(svg instanceof SVGSVGElement)) {
    throw new Error("Card SVG root not found");
  }

  return svg;
}

export async function exportSvgStringToPng(
  svgMarkup: string,
  scale = 2
): Promise<Blob> {
  const svg = parseSvgMarkup(svgMarkup);
  await inlineSvgImages(svg);

  const width = 520 * scale;
  const height = 325 * scale;
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));

  const svgString = new XMLSerializer().serializeToString(svg);
  const objectUrl = URL.createObjectURL(
    new Blob([svgString], { type: "image/svg+xml;charset=utf-8" })
  );

  return new Promise<Blob>((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);

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

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to render card image"));
    };

    image.src = objectUrl;
  });
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
