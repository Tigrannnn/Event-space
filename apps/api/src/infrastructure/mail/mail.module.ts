import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { MailTemplateService } from './mail-template.service';

@Global()
@Module({
	imports: [MailerModule],
	providers: [MailService, MailTemplateService],
	exports: [MailService, MailTemplateService],
})
export class MailModule {}
