import {
  Controller,
  Get,
  Headers,
  Query,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { PublicacionesService } from './publicaciones.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { AuthService } from '../auth/auth.service';

@Controller('estadisticas')
export class EstadisticasController {
  constructor(
    private publicacionesService: PublicacionesService,
    private usuariosService: UsuariosService,
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  validarAdmin(authorization: string) {
    const token = authorization?.replace('Bearer ', '');
    const usuario = this.jwtService.verify(token);

    if (usuario.perfil !== 'administrador') {
      throw new UnauthorizedException('Solo administradores');
    }
  }

  @Get('publicaciones-por-usuario')
  publicacionesPorUsuario(
    @Headers('authorization') authorization: string,
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    this.validarAdmin(authorization);

    return this.publicacionesService.estadisticaPublicacionesPorUsuario(
      desde,
      hasta,
    );
  }

  @Get('comentarios-total')
  comentariosTotal(
    @Headers('authorization') authorization: string,
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    this.validarAdmin(authorization);

    return this.publicacionesService.estadisticaComentariosTotal(
      desde,
      hasta,
    );
  }

  @Get('comentarios-por-publicacion')
  comentariosPorPublicacion(
    @Headers('authorization') authorization: string,
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    this.validarAdmin(authorization);

    return this.publicacionesService.estadisticaComentariosPorPublicacion(
      desde,
      hasta,
    );
  }

  @Get('likes-por-dia')
  likesPorDia(
    @Headers('authorization') authorization: string,
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    this.validarAdmin(authorization);

    return this.publicacionesService.estadisticaLikesPorDia(
      desde,
      hasta,
    );
  }

  @Get('visitas-perfil')
  visitasPerfil(
    @Headers('authorization') authorization: string,
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    this.validarAdmin(authorization);

    return this.usuariosService.visitasPorPerfil(
      desde,
      hasta,
    );
  }

  @Get('logins-por-usuario')
  loginsPorUsuario(
    @Headers('authorization') authorization: string,
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    this.validarAdmin(authorization);

    return this.authService.loginsPorUsuario(
      desde,
      hasta,
    );
  }
}