import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VisitaPerfilDocument = VisitaPerfil & Document;

@Schema({ timestamps: true })
export class VisitaPerfil {
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  perfilVisitado!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  visitante!: Types.ObjectId;
}

export const VisitaPerfilSchema =
  SchemaFactory.createForClass(VisitaPerfil);