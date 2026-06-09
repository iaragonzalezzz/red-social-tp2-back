import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

import {
  Usuario,
  UsuarioDocument,
} from './schemas/usuario.schema';

import {
  VisitaPerfil,
  VisitaPerfilDocument,
} from '../auth/schemas/visita-perfil.schema';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name)
    private usuarioModel: Model<UsuarioDocument>,

    @InjectModel(VisitaPerfil.name)
    private visitaPerfilModel: Model<VisitaPerfilDocument>,
  ) {}

  async crear(data: any) {
    const existeCorreo = await this.usuarioModel.findOne({
      correo: data.correo,
    });

    if (existeCorreo) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const existeUsuario = await this.usuarioModel.findOne({
      nombreUsuario: data.nombreUsuario,
    });

    if (existeUsuario) {
      throw new BadRequestException('El nombre de usuario ya está registrado');
    }

    if (data.password !== data.repetirPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(data.password)) {
      throw new BadRequestException(
        'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número',
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const nuevoUsuario = new this.usuarioModel({
      ...data,
      password: passwordHash,
      perfil: data.perfil || 'usuario',
      activo: true,
    });

    return nuevoUsuario.save();
  }

  async buscarPorUsuarioOCorreo(usuarioOCorreo: string) {
    return this.usuarioModel.findOne({
      $or: [
        { correo: usuarioOCorreo },
        { nombreUsuario: usuarioOCorreo },
      ],
    });
  }

  async buscarPorId(id: string) {
    return this.usuarioModel.findById(id);
  }

  async validarLogin(usuarioOCorreo: string, password: string) {
    const usuario = await this.buscarPorUsuarioOCorreo(usuarioOCorreo);

    if (!usuario) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    if (!usuario.activo) {
      throw new UnauthorizedException('El usuario se encuentra deshabilitado');
    }

    const passwordValida = await bcrypt.compare(
      password,
      usuario.password,
    );

    if (!passwordValida) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    return usuario;
  }

  async listarUsuarios() {
    return this.usuarioModel.find().select('-password');
  }

  async deshabilitar(id: string) {
    return this.usuarioModel.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true },
    );
  }

  async habilitar(id: string) {
    return this.usuarioModel.findByIdAndUpdate(
      id,
      { activo: true },
      { new: true },
    );
  }

  async perfilPublico(
    perfilVisitadoId: string,
    visitanteId: string,
  ) {
    const usuario = await this.usuarioModel
      .findById(perfilVisitadoId)
      .select('-password');

    if (usuario && perfilVisitadoId !== visitanteId) {
      await this.visitaPerfilModel.create({
        perfilVisitado: new Types.ObjectId(perfilVisitadoId),
        visitante: new Types.ObjectId(visitanteId),
      });
    }

    return usuario;
  }

  async visitasPorPerfil(desde: string, hasta: string) {
    return this.visitaPerfilModel.aggregate([
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
          _id: '$perfilVisitado',
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
      { $unwind: '$usuario' },
      {
        $project: {
          _id: 0,
          usuario: '$usuario.nombreUsuario',
          cantidad: 1,
        },
      },
    ]);
  }
  async listarActivos() {
    return this.usuarioModel
      .find({ activo: true })
      .select('nombre apellido nombreUsuario fotoPerfil perfil');
  }
}