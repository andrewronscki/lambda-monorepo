import { Handler, S3Event } from 'aws-lambda'

import Thumbnail from './thumbnail'

export const handler: Handler = async ({ Records: records }: S3Event) => {
  const thumbnail = new Thumbnail()

  try {
    await Promise.all(
      records.map(async record => {
        const { key } = record.s3.object;

        let input = await thumbnail.getImage(key, record.s3.bucket.name)
        const newKey = key.split('original/').pop()
        
        const sizes = [24, 48, 150]
        await Promise.all(sizes.map(async (size) => {
          try {
            const buffer = await thumbnail.resizeImage(input, size, size)
            await thumbnail.uploadImage(buffer, 'image/webp', `thumbs/${newKey}/${size}`, 'public-read', record.s3.bucket.name)
            console.log(`[DONE] Resizing to ${size}px - ${key}`)
          } catch {
            console.error(`[ERROR] Resizing to ${size}px - ${key}`)
          }
        }))
    }))
  } catch (err) {
    console.error(`[ERROR] Unexpected error`, err)
    return err
  }
}
