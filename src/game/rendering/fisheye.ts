type FrameOptions = {
  bufferCanvas: HTMLCanvasElement
  bufferContext: CanvasRenderingContext2D
  image: HTMLImageElement
  map: Int32Array
  pan: number
  targetContext: CanvasRenderingContext2D
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function createFisheyeMap(width: number, height: number, strength: number) {
  const map = new Int32Array(width * height)
  const centerX = (width - 1) / 2
  const centerY = (height - 1) / 2

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const normalizedX = (x - centerX) / centerX
      const normalizedY = (y - centerY) / centerY
      const radius = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY)
      const distortion = 1 + strength * radius * radius
      const sourceX = clamp(Math.round(centerX + (x - centerX) / distortion), 0, width - 1)
      const sourceY = clamp(Math.round(centerY + (y - centerY) / distortion), 0, height - 1)
      map[y * width + x] = (sourceY * width + sourceX) * 4
    }
  }

  return map
}

export function renderFisheyeFrame({
  bufferCanvas,
  bufferContext,
  image,
  map,
  pan,
  targetContext,
}: FrameOptions) {
  const width = targetContext.canvas.width
  const height = targetContext.canvas.height
  const targetAspectRatio = width / height
  const imageAspectRatio = image.naturalWidth / image.naturalHeight

  let sourceX = 0
  let sourceY = 0
  let sourceWidth = image.naturalWidth
  let sourceHeight = image.naturalHeight

  if (imageAspectRatio > targetAspectRatio) {
    sourceWidth = image.naturalHeight * targetAspectRatio
    sourceX = ((pan + 1) / 2) * (image.naturalWidth - sourceWidth)
  } else {
    sourceHeight = image.naturalWidth / targetAspectRatio
    sourceY = (image.naturalHeight - sourceHeight) / 2
  }

  bufferCanvas.width = width
  bufferCanvas.height = height
  bufferContext.clearRect(0, 0, width, height)
  bufferContext.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    width,
    height,
  )

  const sourceFrame = bufferContext.getImageData(0, 0, width, height)
  const outputFrame = targetContext.createImageData(width, height)

  for (let pixel = 0; pixel < map.length; pixel += 1) {
    const targetIndex = pixel * 4
    const sourceIndex = map[pixel]

    outputFrame.data[targetIndex] = sourceFrame.data[sourceIndex]
    outputFrame.data[targetIndex + 1] = sourceFrame.data[sourceIndex + 1]
    outputFrame.data[targetIndex + 2] = sourceFrame.data[sourceIndex + 2]
    outputFrame.data[targetIndex + 3] = sourceFrame.data[sourceIndex + 3]
  }

  targetContext.putImageData(outputFrame, 0, 0)
}
