import { Module } from '@nestjs/common';
import { AngularUniversalModule, applyDomino } from '@nestjs/ng-universal';
import { join } from 'path';

const BROWSER_DIR = join(process.cwd(), '<%= getBrowserDistDirectory() %>');
applyDomino(global, join(BROWSER_DIR, 'index.html'));

@Module({
  imports: [
    AngularUniversalModule.forRoot({
      viewsPath: BROWSER_DIR,
      bundle: require('../<%= getServerDistDirectory() %>/main')
    })
  ]
})
export class ApplicationModule {}
