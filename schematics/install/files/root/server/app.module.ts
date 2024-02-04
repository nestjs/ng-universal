import { Module } from '@nestjs/common';
import { AngularUniversalModule } from '@nestjs/ng-universal';
import { join } from 'path';
import <% if (isStandalone) { %>bootstrap<% } else { %>AppServerModule<% } %> from '../src/main.server';

@Module({
  imports: [
    AngularUniversalModule.forRoot({
      bootstrap<% if (!isStandalone) { %>: AppServerModule<% } %>,
      viewsPath: join(process.cwd(), '<%= browserDistDir %>')
    })
  ]
})
export class AppModule {}
