import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { UsuariosService } from './usuarios.service';
import { CrearUsuarioAdminDto } from './dto/crear-usuario-admin.dto';

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
  ) {}

  obtenerUsuario(req: any) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token requerido');
    }

    return this.jwtService.verify(token);
  }

  validarAdmin(usuario: any) {
    if (usuario.perfil !== 'administrador') {
      throw new UnauthorizedException('Solo administradores');
    }
  }

  @Get()
  async listar(@Req() req: any) {
    const usuario = this.obtenerUsuario(req);

    this.validarAdmin(usuario);

    return this.usuariosService.listarUsuarios();
  }

  @Post()
  async crear(
    @Body() data: CrearUsuarioAdminDto,
    @Req() req: any,
  ) {
    const usuario = this.obtenerUsuario(req);

    this.validarAdmin(usuario);

    return this.usuariosService.crear(data);
  }

  @Get('activos/listar')
  async listarActivos(@Req() req: any) {
    this.obtenerUsuario(req);

    return this.usuariosService.listarActivos();
  }

  @Get(':id/perfil')
  perfilPublico(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const usuario = this.obtenerUsuario(req);

    return this.usuariosService.perfilPublico(
      id,
      usuario.sub,
    );
  }

  @Delete(':id')
  async deshabilitar(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const usuario = this.obtenerUsuario(req);

    this.validarAdmin(usuario);

    return this.usuariosService.deshabilitar(id);
  }

  @Post(':id/habilitar')
  async habilitar(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const usuario = this.obtenerUsuario(req);

    this.validarAdmin(usuario);

    return this.usuariosService.habilitar(id);
  }
}