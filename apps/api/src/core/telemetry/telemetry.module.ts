import { Global, Module } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';

/** Global Nest module that owns optional API operational telemetry lifecycle. */
@Global()
@Module({
  providers: [TelemetryService],
  exports: [TelemetryService],
})
/** Registers the optional telemetry lifecycle globally so exporters cannot affect API availability. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class TelemetryModule {}
