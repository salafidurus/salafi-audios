import { Controller, Get } from "@nestjs/common";
import { HealthCheck, HealthCheckResult, HealthCheckService } from "@nestjs/terminus";
import { PrismaHealthIndicator } from "./prisma-health.indicator";

@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  getHealth(): Promise<HealthCheckResult> {
    return this.health.check([() => this.prismaHealth.pingCheck("database", { timeout: 300 })]);
  }

  @Get("live")
  @HealthCheck()
  getLive(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }

  @Get("ready")
  @HealthCheck()
  getReady(): Promise<HealthCheckResult> {
    return this.health.check([() => this.prismaHealth.pingCheck("database", { timeout: 300 })]);
  }
}
