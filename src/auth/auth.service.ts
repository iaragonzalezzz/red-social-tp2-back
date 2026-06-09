import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UsuariosService } from '../usuarios/usuarios.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';

import {
  LoginRegistro,
  LoginRegistroDocument,
} from './schemas/login.schema';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,

    @InjectModel(LoginRegistro.name)
    private loginRegistroModel: Model<LoginRegistroDocument>,
  ) {}

  async registro(registroDto: RegistroDto) {
    const usuario = await this.usuariosService.crear(registroDto);

    const payload = {
      sub: usuario._id,
      correo: usuario.correo,
      nombreUsuario: usuario.nombreUsuario,
      perfil: usuario.perfil,
    };

    const token = this.jwtService.sign(payload);

    const usuarioLimpio = usuario.toObject() as any;
    delete usuarioLimpio.password;

    return {
      mensaje: 'Usuario registrado correctamente',
      usuario: usuarioLimpio,
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const usuario = await this.usuariosService.validarLogin(
      loginDto.usuarioOCorreo,
      loginDto.password,
    );

    await this.loginRegistroModel.create({
      usuario: usuario._id,
    });

    const payload = {
      sub: usuario._id,
      correo: usuario.correo,
      nombreUsuario: usuario.nombreUsuario,
      perfil: usuario.perfil,
    };

    const token = this.jwtService.sign(payload);

    const usuarioLimpio = usuario.toObject() as any;
    delete usuarioLimpio.password;

    return {
      mensaje: 'Login correcto',
      usuario: usuarioLimpio,
      token,
    };
  }

  async autorizar(token: string) {
    try {
      const payload = this.jwtService.verify(token);

      const usuario = await this.usuariosService.buscarPorId(payload.sub);

      if (!usuario || !usuario.activo) {
        throw new UnauthorizedException('Token inválido');
      }

      const usuarioLimpio: any = usuario.toObject();
      delete usuarioLimpio.password;

      return {
        usuario: usuarioLimpio,
      };
    } catch {
      throw new UnauthorizedException('Token inválido o vencido');
    }
  }

  async refrescar(token: string) {
    try {
      const payload = this.jwtService.verify(token);

      const nuevoPayload = {
        sub: payload.sub,
        correo: payload.correo,
        nombreUsuario: payload.nombreUsuario,
        perfil: payload.perfil,
      };

      const nuevoToken = this.jwtService.sign(nuevoPayload);

      return {
        token: nuevoToken,
      };
    } catch {
      throw new UnauthorizedException('Token inválido o vencido');
    }
  }

  async loginsPorUsuario(desde: string, hasta: string) {
  return this.loginRegistroModel.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(desde),
          $lte: new Date(hasta),
        },
      },
    },
    {
      $group: {
        _id: '$usuario',
        cantidad: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'usuarios',
        localField: '_id',
        foreignField: '_id',
        as: 'usuario',
      },
    },
    {
      $unwind: '$usuario',
    },
    {
      $project: {
        _id: 0,
        usuario: '$usuario.nombreUsuario',
        cantidad: 1,
      },
    },
  ]);
  }
}