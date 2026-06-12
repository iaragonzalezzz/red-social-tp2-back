import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Publicacion,
  PublicacionDocument,
} from './schemas/publicacion.schema';

import {
  Comentario,
  ComentarioDocument,
} from './schemas/comentario.schema';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name)
    private publicacionModel: Model<PublicacionDocument>,

    @InjectModel(Comentario.name)
    private comentarioModel: Model<ComentarioDocument>,
  ) {}

  crear(data: any) {
    const nuevaPublicacion = new this.publicacionModel(data);
    return nuevaPublicacion.save();
  }

  listar(orden = 'fecha', offset = 0, limit = 5, usuarioId?: string) {
    const filtro: any = { activo: true };

    if (usuarioId) {
      filtro.usuario = usuarioId;
    }

    if (orden === 'likes') {
      return this.publicacionModel.aggregate([
        { $match: filtro },
        { $addFields: { cantidadLikes: { $size: '$likes' } } },
        { $sort: { cantidadLikes: -1 } },
        { $skip: Number(offset) },
        { $limit: Number(limit) },
      ]);
    }

    return this.publicacionModel
      .find(filtro)
      .populate('usuario', 'nombre apellido nombreUsuario fotoPerfil perfil')
      .sort({ createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit));
  }

  buscarPorId(id: string) {
    return this.publicacionModel
      .findOne({
        _id: id,
        activo: true,
      })
      .populate('usuario', 'nombre apellido nombreUsuario fotoPerfil perfil');
  }

  ultimasTresPorUsuario(usuarioId: string) {
  return this.publicacionModel
    .find({
      usuario: new Types.ObjectId(usuarioId),
      activo: true,
    })
    .populate('usuario', 'nombre apellido nombreUsuario fotoPerfil perfil')
    .sort({ createdAt: -1 })
    .limit(3);
  }

  async eliminar(id: string, usuarioToken: any) {
    const publicacion = await this.publicacionModel.findById(id);

    if (!publicacion || !publicacion.activo) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const esAutor = publicacion.usuario.toString() === usuarioToken.sub;
    const esAdmin = usuarioToken.perfil === 'administrador';

    if (!esAutor && !esAdmin) {
      throw new UnauthorizedException('No podés eliminar esta publicación');
    }

    publicacion.activo = false;

    return publicacion.save();
  }

  async darLike(id: string, usuarioId: string) {
  const publicacion = await this.publicacionModel.findById(id);

  if (!publicacion || !publicacion.activo) {
    throw new NotFoundException('Publicación no encontrada');
  }

  const yaDioLike = publicacion.likes.some(
    (like: any) => like.usuario?.toString() === usuarioId,
  );

  if (!yaDioLike) {
    publicacion.likes.push({
      usuario: new Types.ObjectId(usuarioId),
      fecha: new Date(),
    } as any);
    }

    return publicacion.save();
  }

  async quitarLike(id: string, usuarioId: string) {
  const publicacion = await this.publicacionModel.findById(id);

  if (!publicacion || !publicacion.activo) {
    throw new NotFoundException('Publicación no encontrada');
  }

  publicacion.likes = publicacion.likes.filter(
    (like: any) => like.usuario?.toString() !== usuarioId,
  ) as any;

    return publicacion.save();
  }

  async crearComentario(data: any) {
    const nuevoComentario = new this.comentarioModel(data);
    return nuevoComentario.save();
  }

  listarComentarios(publicacionId: string, offset = 0, limit = 5) {
    return this.comentarioModel
      .find({ publicacion: publicacionId })
      .populate('usuario', 'nombre apellido nombreUsuario fotoPerfil')
      .sort({ createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit));
  }

  async editarComentario(
    comentarioId: string,
    usuarioId: string,
    mensaje: string,
  ) {
    const comentario = await this.comentarioModel.findById(comentarioId);

    if (!comentario) {
      throw new NotFoundException('Comentario no encontrado');
    }

    if (comentario.usuario.toString() !== usuarioId) {
      throw new UnauthorizedException('No podés editar este comentario');
    }

    comentario.mensaje = mensaje;
    comentario.modificado = true;

    return comentario.save();
  }
  
  async estadisticaPublicacionesPorUsuario(desde: string, hasta: string) {
  const publicaciones = await this.publicacionModel
    .find({
      activo: true,
      createdAt: {
        $gte: new Date(desde),
        $lte: new Date(hasta),
      },
    })
    .populate('usuario', 'nombreUsuario');

  const resultado: any[] = [];

  publicaciones.forEach((publicacion: any) => {
    const nombreUsuario =
      publicacion.usuario?.nombreUsuario ||
      'usuario';

    const existente = resultado.find(
      item => item.usuario === nombreUsuario,
    );

    if (existente) {
      existente.cantidad++;
    } else {
      resultado.push({
        usuario: nombreUsuario,
        cantidad: 1,
      });
    }
  });

  return resultado;
}
estadisticaComentariosTotal(desde: string, hasta: string) {
  return this.comentarioModel.aggregate([
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
        _id: null,
        cantidad: { $sum: 1 },
      },
    },
  ]);
}

async estadisticaComentariosPorPublicacion(desde: string, hasta: string) {
  const comentarios = await this.comentarioModel
    .find({
      createdAt: {
        $gte: new Date(desde),
        $lte: new Date(hasta),
      },
    })
    .populate('publicacion', 'titulo');

  const resultado: any[] = [];

  comentarios.forEach((comentario: any) => {
    const tituloPublicacion =
      comentario.publicacion?.titulo ||
      'Publicación';

    const existente = resultado.find(
      item => item.publicacion === tituloPublicacion,
    );

    if (existente) {
      existente.cantidad++;
    } else {
      resultado.push({
        publicacion: tituloPublicacion,
        cantidad: 1,
      });
    }
  });

  return resultado;
}

estadisticaLikesPorDia(desde: string, hasta: string) {
  return this.publicacionModel.aggregate([
    { $unwind: '$likes' },
    {
      $match: {
        'likes.fecha': {
          $gte: new Date(desde),
          $lte: new Date(hasta),
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$likes.fecha',
          },
        },
        cantidad: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        dia: '$_id',
        cantidad: 1,
      },
    },
    { $sort: { dia: 1 } },
  ]);
}

async guardarPublicacion(id: string, usuarioId: string) {
  const publicacion = await this.publicacionModel.findById(id);

  if (!publicacion || !publicacion.activo) {
    throw new NotFoundException('Publicación no encontrada');
  }

  const yaGuardada = publicacion.guardados.some(
    (u: any) => u.toString() === usuarioId,
  );

  if (!yaGuardada) {
    publicacion.guardados.push(new Types.ObjectId(usuarioId));
  }

  return publicacion.save();
}

async quitarGuardado(id: string, usuarioId: string) {
  const publicacion = await this.publicacionModel.findById(id);

  if (!publicacion || !publicacion.activo) {
    throw new NotFoundException('Publicación no encontrada');
  }

  publicacion.guardados = publicacion.guardados.filter(
    (u: any) => u.toString() !== usuarioId,
  ) as any;

  return publicacion.save();
}

async compartirPublicacion(
  id: string,
  usuarioQueComparte: string,
  usuarioDestino: string,
) {
  const publicacion = await this.publicacionModel.findById(id);

  if (!publicacion || !publicacion.activo) {
    throw new NotFoundException('Publicación no encontrada');
  }

  publicacion.compartidos.push({
    usuarioQueComparte: new Types.ObjectId(usuarioQueComparte),
    usuarioDestino: new Types.ObjectId(usuarioDestino),
    fecha: new Date(),
  });

  return publicacion.save();
}

listarGuardados(usuarioId: string) {
  return this.publicacionModel
    .find({
      activo: true,
      guardados: {
        $in: [new Types.ObjectId(usuarioId)],
      },
    })
    .populate('usuario', 'nombre apellido nombreUsuario fotoPerfil perfil')
    .sort({ createdAt: -1 });
}

listarCompartidosConmigo(usuarioId: string) {
  return this.publicacionModel
    .find({
      activo: true,
      'compartidos.usuarioDestino': new Types.ObjectId(usuarioId),
    })
    .populate('usuario', 'nombre apellido nombreUsuario fotoPerfil perfil')
    .populate(
      'compartidos.usuarioQueComparte',
      'nombre apellido nombreUsuario fotoPerfil',
    )
    .sort({ createdAt: -1 });
}

}