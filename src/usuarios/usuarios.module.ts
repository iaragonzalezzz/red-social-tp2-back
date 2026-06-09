import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';

import {
  Usuario,
  UsuarioSchema,
} from './schemas/usuario.schema';

import {
  VisitaPerfil,
  VisitaPerfilSchema,
} from 'src/auth/schemas/visita-perfil.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Usuario.name,
        schema: UsuarioSchema,
      },
      {
        name: VisitaPerfil.name,
        schema: VisitaPerfilSchema,
      },
    ]),

    JwtModule.register({
      secret: 'superSecret123',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}