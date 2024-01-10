import { defaultImage } from '@/rest/funko/entities/funko.entity'
import { Injectable, type OnModuleInit } from '@nestjs/common'
import * as fs from 'fs'
import { join } from 'node:path'

@Injectable()
export class StorageService implements OnModuleInit {
  private uploadDir = join(process.cwd(), process.env.UPLOAD_DIR ?? 'uploads')

  onModuleInit() {
    const uploadDirExists = fs.existsSync(this.uploadDir)
    if (!uploadDirExists) {
      fs.mkdirSync(this.uploadDir)
    }
  }

  async findImage({ image }: { image: string }) {
    if (image === defaultImage) {
      return await fetch(image).then((res) => res.text())
    } else {
      return join(this.uploadDir, image)
    }
  }

  async removeImage({ image }: { image: string }) {
    if (image !== defaultImage) {
      fs.unlinkSync(join(this.uploadDir, image))
    }
  }
}
