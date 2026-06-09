import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PublicacionDocument = Publicacion & Document;

@Schema()
export class Like {
  @Prop({ type: Types.ObjectId, ref: 'Usuario' })
  usuario!: Types.ObjectId;

  @Prop({ default: Date.now })
  fecha!: Date;
}

const LikeSchema = SchemaFactory.createForClass(Like);

@Schema({ timestamps: true })
export class Publicacion {
  @Prop({ required: true })
  titulo!: string;

  @Prop({ required: true })
  mensaje!: string;

  @Prop({ default: '' })
  imagen!: string;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  usuario!: Types.ObjectId;

  @Prop({ type: [LikeSchema], default: [] })
  likes!: Like[];

  @Prop({ default: true })
  activo!: boolean;

  @Prop({ type: [Types.ObjectId], ref: 'Usuario', default: [] })
  guardados!: Types.ObjectId[];

  @Prop({
    type: [
      {
        usuarioQueComparte: {
          type: Types.ObjectId,
          ref: 'Usuario',
        },
        usuarioDestino: {
          type: Types.ObjectId,
          ref: 'Usuario',
        },
        fecha: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    default: [],
  })
  compartidos!: any[];

}

export const PublicacionSchema =
  SchemaFactory.createForClass(Publicacion);