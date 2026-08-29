import { Module } from '@nestjs/common';

import { LinkLoader } from './link.loader';
import { LinkRepository } from './link.repository';
import { LinkService } from './link.service';

@Module({
  providers: [LinkRepository, LinkService, LinkLoader],
  exports: [LinkLoader, LinkService],
})
export class LinkModule {}
