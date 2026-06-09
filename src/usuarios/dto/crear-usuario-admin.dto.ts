import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CrearUsuarioAdminDto {

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  apellido!: string;

  @IsEmail()
  correo!: string;

  @IsString()
  @IsNotEmpty()
  nombreUsuario!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsOptional()
  fechaNacimiento?: string;

  @IsOptional()
  descripcion?: string;

  @IsOptional()
  perfil?: string;
}