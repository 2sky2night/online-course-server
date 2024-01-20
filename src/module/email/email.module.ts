import { Module } from "@nestjs/common";
import { emailProvider } from "./email.provider";
import { EmailService } from "./email.service";

@Module({
  providers: [...emailProvider, EmailService],
  exports: [EmailService],
})
export class EmailModule {}
