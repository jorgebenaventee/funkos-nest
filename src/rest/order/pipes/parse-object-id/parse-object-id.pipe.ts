import {
  type ArgumentMetadata,
  BadRequestException,
  Injectable,
  type PipeTransform,
} from '@nestjs/common'
import { ObjectId } from 'mongodb'

@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
  transform(value: any, _: ArgumentMetadata) {
    if (!ObjectId.isValid(value)) {
      throw new BadRequestException(`"${value}" is not an ObjectId.`)
    }
    return ObjectId.createFromHexString(value)
  }
}
