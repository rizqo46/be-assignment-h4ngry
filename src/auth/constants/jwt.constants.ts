import { ConfigModule } from "@nestjs/config"

ConfigModule.forRoot()

export const JWT_SECRET = process.env.JWT_SECRET
