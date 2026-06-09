import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';

import {
  LoginRegistro,
  LoginRegistroSchema,
} from './schemas/login.schema';

@Module({
  imports: [
    UsuariosModule,

    MongooseModule.forFeature([
      {
        name: LoginRegistro.name,
        schema: LoginRegistroSchema,
      },
    ]),

    JwtModule.register({
      secret: 'superSecret123',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}