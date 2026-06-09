import {
  Body,
  Controller,
  Headers,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';

import { extname } from 'path';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService
  ) {}

  @Post('registro')

  @UseInterceptors(
    FileInterceptor('fotoPerfil', {

      storage: diskStorage({

        destination: './uploads',

        filename: (req, file, callback) => {

          const nombre =
            Date.now() + extname(file.originalname);

          callback(null, nombre);
        },
      }),
    }),
  )

  registro(
    @UploadedFile() archivo: Express.Multer.File,
    @Body() body: any,
  ) {

    if (archivo) {

      body.fotoPerfil =
        `http://localhost:3000/uploads/${archivo.filename}`;
    }

    return this.authService.registro(body);
  }

  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body);
  }

  @Post('autorizar')
  autorizar(
    @Headers('authorization') authorization: string
  ) {

    const token =
      authorization?.replace('Bearer ', '');

    return this.authService.autorizar(token);
  }

  @Post('refrescar')
  refrescar(
    @Headers('authorization') authorization: string
  ) {

    const token =
      authorization?.replace('Bearer ', '');

    return this.authService.refrescar(token);
  }
}