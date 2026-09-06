import { Global, Module } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';

/** Global Nest module that owns optional API operational telemetry lifecycle. */
@Global()
@Module({
  providers: [TelemetryService],
  exports: [TelemetryService],
})
/** NestJS telemetry module service or controller coordinating the API boundary for this responsibility. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class TelemetryModule {}
