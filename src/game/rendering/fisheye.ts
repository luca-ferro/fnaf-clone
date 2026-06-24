type FrameOptions = {
  bufferCanvas: HTMLCanvasElement
  bufferContext: CanvasRenderingContext2D
  image: HTMLImageElement
  map: Int32Array
  pan: number
  targetContext: CanvasRenderingContext2D
  tvStaticFrame?: number
  tvStaticSignal?: number
  tvStaticStrength?: number
}

type CompositeFrameOptions = Omit<FrameOptions, 'image'> & {
  images: HTMLImageElement[]
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getTvStaticNoise(pixel: number, frame: number) {
  let value = (pixel + 1) ^ ((frame + 1) * 0x45d9f3b)
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b)
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b)

  return ((value ^ (value >>> 16)) >>> 0) / 0xffffffff
}

function getCoverSourceRect(
  image: HTMLImageElement,
  pan: number,
  targetAspectRatio: number,
) {
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

  return { sourceHeight, sourceWidth, sourceX, sourceY }
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
  tvStaticFrame,
  tvStaticSignal,
  tvStaticStrength,
}: FrameOptions) {
  renderFisheyeCompositeFrame({
    bufferCanvas,
    bufferContext,
    images: [image],
    map,
    pan,
    targetContext,
    tvStaticFrame,
    tvStaticSignal,
    tvStaticStrength,
  })
}

export function renderFisheyeCompositeFrame({
  bufferCanvas,
  bufferContext,
  images,
  map,
  pan,
  targetContext,
  tvStaticFrame = 0,
  tvStaticSignal = 0,
  tvStaticStrength = 0,
}: CompositeFrameOptions) {
  if (images.length === 0) {
    return
  }

  const width = targetContext.canvas.width
  const height = targetContext.canvas.height
  const activeStaticStrength =
    clamp(tvStaticStrength, 0, 1) * clamp(tvStaticSignal, 0, 1)
  const targetAspectRatio = width / height
  const { sourceHeight, sourceWidth, sourceX, sourceY } = getCoverSourceRect(
    images[0],
    pan,
    targetAspectRatio,
  )

  bufferCanvas.width = width
  bufferCanvas.height = height
  bufferContext.imageSmoothingEnabled = false
  targetContext.imageSmoothingEnabled = false
  bufferContext.clearRect(0, 0, width, height)
  images.forEach((image) => {
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
  })

  const sourceFrame = bufferContext.getImageData(0, 0, width, height)
  const outputFrame = targetContext.createImageData(width, height)

  for (let pixel = 0; pixel < map.length; pixel += 1) {
    const targetIndex = pixel * 4
    const sourceIndex = map[pixel]
    let red = sourceFrame.data[sourceIndex]
    let green = sourceFrame.data[sourceIndex + 1]
    let blue = sourceFrame.data[sourceIndex + 2]

    if (activeStaticStrength > 0) {
      const noise = getTvStaticNoise(pixel, tvStaticFrame)
      const row = Math.floor(pixel / width)
      const scanline = (row % 2 === 0 ? 1 : -1) * 18 * activeStaticStrength
      const grain = (noise - 0.5) * 255 * activeStaticStrength
      const whiteSpark =
        noise > 0.992 - activeStaticStrength * 0.06
          ? 185 * activeStaticStrength
          : 0
      const blackDrop =
        noise < activeStaticStrength * 0.025 ? -90 * activeStaticStrength : 0
      const staticOffset = grain + scanline + whiteSpark + blackDrop

      red = clamp(Math.round(red + staticOffset), 0, 255)
      green = clamp(Math.round(green + staticOffset), 0, 255)
      blue = clamp(Math.round(blue + staticOffset), 0, 255)
    }

    outputFrame.data[targetIndex] = red
    outputFrame.data[targetIndex + 1] = green
    outputFrame.data[targetIndex + 2] = blue
    outputFrame.data[targetIndex + 3] = sourceFrame.data[sourceIndex + 3]
  }

  targetContext.putImageData(outputFrame, 0, 0)
}
