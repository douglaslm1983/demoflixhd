export function readImageFile(file, size = 256) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = size
          canvas.height = size
          const ctx = canvas.getContext('2d')
          const scale = Math.max(size / img.width, size / img.height)
          const w = img.width * scale
          const h = img.height * scale
          ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)
          resolve(canvas.toDataURL('image/jpeg', 0.85))
        } catch (err) {
          reject(err)
        }
      }
      img.onerror = reject
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}