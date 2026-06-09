import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { PublicacionesController } from './publicaciones.controller';
import { PublicacionesService } from './publicaciones.service';
import { ComentariosController } from './comentarios.controller';
import { EstadisticasController } from './estadisticas.controller';

import {
  Publicacion,
  PublicacionSchema,
} from './schemas/publicacion.schema';

import {
  Comentario,
  ComentarioSchema,
} from './schemas/comentario.schema';

import { UsuariosModule } from '../usuarios/usuarios.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Publicacion.name,
        schema: PublicacionSchema,
      },
      {
        name: Comentario.name,
        schema: ComentarioSchema,
      },
    ]),

    UsuariosModule,
    AuthModule,

    JwtModule.register({
      secret: 'superSecret123',
      signOptions: { expiresIn: '15m' },
    }),
  ],

  controllers: [
    PublicacionesController,
    ComentariosController,
    EstadisticasController,
  ],

  providers: [
    PublicacionesService,
  ],
})
export class PublicacionesModule {}