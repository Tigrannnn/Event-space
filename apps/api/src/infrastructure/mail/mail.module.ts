import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';
import { MailTemplateService } from './mail-template.service';

@Global()
@Module({
	imports: [ConfigModule, MailerModule],
	providers: [MailService, MailTemplateService],
	exports: [MailService, MailTemplateService],
})
export class MailModule {}
