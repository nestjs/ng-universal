import { Module } from '@nestjs/common';
import { AngularUniversalModule } from '@nestjs/ng-universal';
import { join } from 'path';

@Module({
  imports: [
    AngularUniversalModule.forRoot({
      viewsPath: join(process.cwd(), '<%= getBrowserDistDirectory() %>'),
      bundle: require(join(
        process.cwd(),
        '<%= getServerDistDirectory() %>/main'
      )),
      liveReload: true
    })
  ]
})
export class ApplicationModule {}
