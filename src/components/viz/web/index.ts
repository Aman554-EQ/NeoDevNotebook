/**
 * Visuals shared by the backend modules (Django, FastAPI, Flask). Recording-driven visuals
 * (HttpExchange, OrmToSql, SqlPlayground) live in ../_shared/web because they need the page's
 * module; these take their data from props or are self-contained.
 */
import {
  CommandMapViz,
  DocVsTableViz,
  FrameworkCompareViz,
  SessionVsTokenViz,
  TestPyramidViz,
} from "./concepts"
import { JwtAnatomyViz } from "./jwt/jwt-anatomy-viz"
import {
  CacheHitViz,
  DatabaseUrlViz,
  IdempotencyReplayViz,
  MigrationTimelineViz,
  MvtFlowViz,
  UrlResolverViz,
  ValidationFlowViz,
  WebRequestViz,
} from "./pipeline/flows"
import { RequestLifecycleViz } from "./request-lifecycle/request-lifecycle-viz"

export const viz = {
  RequestLifecycleViz,
  JwtAnatomyViz,
  WebRequestViz,
  UrlResolverViz,
  MvtFlowViz,
  ValidationFlowViz,
  CacheHitViz,
  IdempotencyReplayViz,
  DatabaseUrlViz,
  MigrationTimelineViz,
  CommandMapViz,
  SessionVsTokenViz,
  DocVsTableViz,
  TestPyramidViz,
  FrameworkCompareViz,
}
