import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { PublicacionesService } from './publicaciones.service';

@Controller('publicaciones/:publicacionId/comentarios')
export class ComentariosController {

  constructor(
    private publicacionesService: PublicacionesService,
    private jwtService: JwtService,
  ) {}

  obtenerUsuario(authorization: string) {
    const token = authorization?.replace('Bearer ', '');
    return this.jwtService.verify(token);
  }

  @Post()
  crear(
    @Param('publicacionId') publicacionId: string,
    @Headers('authorization') authorization: string,
    @Body() body: any,
  ) {
    const usuario = this.obtenerUsuario(authorization);

    return this.publicacionesService.crearComentario({
      mensaje: body.mensaje,
      usuario: usuario.sub,
      publicacion: publicacionId,
    });
  }

  @Get()
  listar(
    @Param('publicacionId') publicacionId: string,
    @Query('offset') offset: number,
    @Query('limit') limit: number,
  ) {
    return this.publicacionesService.listarComentarios(
      publicacionId,
      offset || 0,
      limit || 5,
    );
  }

  @Put(':comentarioId')
  editar(
    @Param('comentarioId') comentarioId: string,
    @Headers('authorization') authorization: string,
    @Body() body: any,
  ) {
    const usuario = this.obtenerUsuario(authorization);

    return this.publicacionesService.editarComentario(
      comentarioId,
      usuario.sub,
      body.mensaje,
    );
  }
}