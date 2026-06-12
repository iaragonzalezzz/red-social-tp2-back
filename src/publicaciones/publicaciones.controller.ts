import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { FileInterceptor } from '@nestjs/platform-express';

import { PublicacionesService } from './publicaciones.service';

import { storage } from '../cloudinary.config';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(
    private publicacionesService: PublicacionesService,
    private jwtService: JwtService,
  ) {}

  obtenerUsuario(authorization: string) {
    const token = authorization
      ?.replace('Bearer ', '')
      ?.trim();

    return this.jwtService.verify(token);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage,
    }),
  )
  crear(
    @Headers('authorization') authorization: string,
    @UploadedFile() archivo: Express.Multer.File,
    @Body() body: any,
  ) {
    const usuario = this.obtenerUsuario(authorization);

    const data = {
      titulo: body.titulo,
      mensaje: body.mensaje,
      usuario: usuario.sub,
      imagen: archivo ? archivo.path : '',
    };

    return this.publicacionesService.crear(data);
  }

  @Get()
  listar(
    @Query('orden') orden: string,
    @Query('offset') offset: number,
    @Query('limit') limit: number,
    @Query('usuarioId') usuarioId: string,
  ) {
    return this.publicacionesService.listar(
      orden || 'fecha',
      offset || 0,
      limit || 5,
      usuarioId,
    );
  }

  @Get('mis-ultimas')
  misUltimas(
    @Headers('authorization') authorization: string,
  ) {
    const usuario = this.obtenerUsuario(authorization);

    return this.publicacionesService.ultimasTresPorUsuario(
      usuario.sub,
    );
  }

  @Get('mis-guardados/listar')
  misGuardados(
    @Headers('authorization') authorization: string,
  ) {
    const usuario = this.obtenerUsuario(authorization);

    return this.publicacionesService.listarGuardados(
      usuario.sub,
    );
  }

  @Get('compartidos/conmigo')
  compartidosConmigo(
    @Headers('authorization') authorization: string,
  ) {
    const usuario = this.obtenerUsuario(authorization);

    return this.publicacionesService.listarCompartidosConmigo(
      usuario.sub,
    );
  }

  @Get(':id')
  buscarPorId(
    @Param('id') id: string,
  ) {
    return this.publicacionesService.buscarPorId(id);
  }

  @Post(':id/guardar')
  guardar(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    const usuario = this.obtenerUsuario(authorization);

    return this.publicacionesService.guardarPublicacion(
      id,
      usuario.sub,
    );
  }

  @Post(':id/quitar-guardado')
  quitarGuardado(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    const usuario = this.obtenerUsuario(authorization);

    return this.publicacionesService.quitarGuardado(
      id,
      usuario.sub,
    );
  }

  @Post(':id/compartir')
  compartir(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
    @Body() body: any,
  ) {
    const usuario = this.obtenerUsuario(authorization);

    return this.publicacionesService.compartirPublicacion(
      id,
      usuario.sub,
      body.usuarioDestino,
    );
  }

  @Delete(':id')
  eliminar(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    const usuario = this.obtenerUsuario(authorization);

    return this.publicacionesService.eliminar(
      id,
      usuario,
    );
  }

  @Post(':id/like')
  darLike(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    const usuario = this.obtenerUsuario(authorization);

    return this.publicacionesService.darLike(
      id,
      usuario.sub,
    );
  }

  @Delete(':id/like')
  quitarLike(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    const usuario = this.obtenerUsuario(authorization);

    return this.publicacionesService.quitarLike(
      id,
      usuario.sub,
    );
  }
}