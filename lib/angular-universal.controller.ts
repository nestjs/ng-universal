import { Controller, Get, Inject, Req, Res } from '@nestjs/common';
import { ANGULAR_UNIVERSAL_OPTIONS } from './angular-universal.constants';
import { AngularUniversalOptions } from './interfaces/angular-universal-options.interface';

@Controller()
export class AngularUniversalController {
  constructor(
    @Inject(ANGULAR_UNIVERSAL_OPTIONS)
    private readonly ngOptions: AngularUniversalOptions
  ) {}

  @Get('*')
  render(@Res() res, @Req() req) {
    res.render(this.ngOptions.templatePath, { req, res });
  }
}
