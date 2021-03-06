package dres.api.rest.handler

import dres.api.rest.AccessManager
import dres.api.rest.types.status.ErrorStatus
import dres.api.rest.types.status.SuccessStatus
import dres.data.dbo.DAO
import dres.run.audit.AuditLogEntry
import dres.run.audit.AuditLogManager
import dres.run.audit.LogEventSource
import dres.utilities.extensions.sessionId
import io.javalin.http.Context
import io.javalin.plugin.openapi.annotations.OpenApi
import io.javalin.plugin.openapi.annotations.OpenApiContent
import io.javalin.plugin.openapi.annotations.OpenApiResponse

class LogoutHandler(private val audit: DAO<AuditLogEntry>) : RestHandler, GetRestHandler<SuccessStatus> {

    @OpenApi(summary = "Clears all user roles of the current session.", path = "/api/logout",
            tags = ["User"],
            responses = [
                OpenApiResponse("200", [OpenApiContent(SuccessStatus::class)]),
                OpenApiResponse("400", [OpenApiContent(ErrorStatus::class)])
            ])
    override fun doGet(ctx: Context): SuccessStatus {
        AccessManager.clearUserSession(ctx.sessionId())
        AuditLogManager.getAuditLogger("GLOBAL", audit).logout(ctx.sessionId(), LogEventSource.REST)
        return SuccessStatus("Logged out")

    }

    override val route = "logout"
}