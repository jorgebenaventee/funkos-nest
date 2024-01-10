import { CacheInterceptor } from '@nestjs/cache-manager'
import type { ExecutionContext } from '@nestjs/common'
import { Injectable } from '@nestjs/common'

@Injectable()
export class CustomCacheInterceptor extends CacheInterceptor {
  protected isRequestCacheable(context: ExecutionContext): boolean {
    const ignoreCaching = this.reflector.get<boolean>(
      'ignoreCaching',
      context.getHandler(),
    )
    const request = context.switchToHttp().getRequest()
    return !ignoreCaching && request.method === 'GET'
  }
}
