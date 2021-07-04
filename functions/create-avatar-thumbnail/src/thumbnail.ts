import aws, { S3 } from 'aws-sdk'
import sharp from 'sharp'

export default class Thumbnail {
  private s3Client: S3

  constructor() {
    this.s3Client = new aws.S3()
  }

  async getImage(key: string, bucket: string): Promise<Buffer> {
    const image = await this.s3Client.getObject({
      Bucket: bucket,
      Key: key
    }).promise()

    if (image.Body) {
      const body = image.Body as Buffer
      return body
    } else {
      throw new Error()
    }
  }

  async uploadImage(body: Buffer, contentType: string, key: string, acl: string, bucket: string): Promise<void> {
    await this.s3Client.putObject({
      Body: body,
      Bucket: bucket,
      ContentType: contentType,
      Key: key,
      ACL: acl
    }).promise()
  }

  async resizeImage(input: Buffer, width: number, height: number): Promise<Buffer> {
    return await sharp(input)
      .resize(width, height, { fit: "cover", withoutEnlargement: false })
      .webp({ lossless: true })
      .toBuffer();
  }
}