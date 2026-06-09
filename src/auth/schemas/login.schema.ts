import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LoginRegistroDocument = LoginRegistro & Document;

@Schema({ timestamps: true })
export class LoginRegistro {
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  usuario!: Types.ObjectId;
}

export const LoginRegistroSchema =
  SchemaFactory.createForClass(LoginRegistro);