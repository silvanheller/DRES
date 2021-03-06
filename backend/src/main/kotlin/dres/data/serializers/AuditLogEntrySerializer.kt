package dres.data.serializers

import dres.data.model.run.SubmissionStatus
import dres.run.audit.*
import org.mapdb.DataInput2
import org.mapdb.DataOutput2
import org.mapdb.Serializer

object AuditLogEntrySerializer: Serializer<AuditLogEntry> {

    override fun serialize(out: DataOutput2, value: AuditLogEntry) {
        out.packLong(value.id)
        out.packLong(value.timestamp)
        out.packInt(value.type.ordinal)
        when(value.type){
            AuditLogEntryType.COMPETITION_START -> {
                val competitionStart = value as CompetitionStartAuditLogEntry
                out.writeUTF(competitionStart.competition)
                out.packInt(competitionStart.api.ordinal)
                out.writeUTF(competitionStart.user ?: "")
            }
            AuditLogEntryType.COMPETITION_END -> {
                val competitionEnd = value as CompetitionEndAuditLogEntry
                out.writeUTF(competitionEnd.competition)
                out.packInt(competitionEnd.api.ordinal)
                out.writeUTF(competitionEnd.user ?: "")
            }
            AuditLogEntryType.TASK_START -> {
                val taskStart = value as TaskStartAuditLogEntry
                out.writeUTF(taskStart.competition)
                out.writeUTF(taskStart.taskName)
                out.packInt(taskStart.api.ordinal)
                out.writeUTF(taskStart.user ?: "")
            }
            AuditLogEntryType.TASK_MODIFIED -> {
                val taskmod = value as TaskModifiedAuditLogEntry
                out.writeUTF(taskmod.competition)
                out.writeUTF(taskmod.taskName)
                out.writeUTF(taskmod.modification)
                out.packInt(taskmod.api.ordinal)
                out.writeUTF(taskmod.user ?: "")
            }
            AuditLogEntryType.TASK_END -> {
                val taskend = value as TaskEndAuditLogEntry
                out.writeUTF(taskend.competition)
                out.writeUTF(taskend.taskName)
                out.packInt(taskend.api.ordinal)
                out.writeUTF(taskend.user ?: "")
            }
            AuditLogEntryType.SUBMISSION -> {
                val submission = value as SubmissionAuditLogEntry
                out.writeUTF(submission.competition)
                out.writeUTF(submission.taskName)
                out.writeUTF(submission.submissionSummary)
                out.packInt(submission.api.ordinal)
                out.writeUTF(submission.user ?: "")
            }
            AuditLogEntryType.JUDGEMENT -> {
                val judgement = value as JudgementAuditLogEntry
                out.writeUTF(judgement.competition)
                out.writeUTF(judgement.validator)
                out.writeUTF(judgement.token)
                out.packInt(judgement.verdict.ordinal)
                out.packInt(judgement.api.ordinal)
                out.writeUTF(judgement.user ?: "")
            }
            AuditLogEntryType.LOGIN -> {
                val login = value as LoginAuditLogEntry
                out.writeUTF(login.user)
                out.writeUTF(login.session)
                out.packInt(login.api.ordinal)
            }
            AuditLogEntryType.LOGOUT -> {
                val logout = value as LogoutAuditLogEntry
                out.writeUTF(logout.session)
                out.packInt(logout.api.ordinal)
            }
        }
    }

    override fun deserialize(input: DataInput2, available: Int): AuditLogEntry {
        val id = input.unpackLong()
        val timestamp = input.unpackLong()//out.packLong(value.timestamp)
        return when(AuditLogEntryType.values()[input.unpackInt()]){
            AuditLogEntryType.COMPETITION_START -> CompetitionStartAuditLogEntry(id, input.readUTF(), LogEventSource.values()[input.unpackInt()], input.readUTF()).also { it.timestamp = timestamp }
            AuditLogEntryType.COMPETITION_END -> CompetitionEndAuditLogEntry(id, input.readUTF(), LogEventSource.values()[input.unpackInt()], input.readUTF()).also { it.timestamp = timestamp }
            AuditLogEntryType.TASK_START -> TaskStartAuditLogEntry(id, input.readUTF(), input.readUTF(), LogEventSource.values()[input.unpackInt()], input.readUTF()).also { it.timestamp = timestamp }
            AuditLogEntryType.TASK_MODIFIED -> TaskModifiedAuditLogEntry(id, input.readUTF(), input.readUTF(), input.readUTF(), LogEventSource.values()[input.unpackInt()], input.readUTF()).also { it.timestamp = timestamp }
            AuditLogEntryType.TASK_END -> TaskEndAuditLogEntry(id, input.readUTF(), input.readUTF(), LogEventSource.values()[input.unpackInt()], input.readUTF()).also { it.timestamp = timestamp }
            AuditLogEntryType.SUBMISSION -> SubmissionAuditLogEntry(id, input.readUTF(), input.readUTF(), input.readUTF(), LogEventSource.values()[input.unpackInt()], input.readUTF()).also { it.timestamp = timestamp }
            AuditLogEntryType.JUDGEMENT -> JudgementAuditLogEntry(id, input.readUTF(), input.readUTF(), input.readUTF(), SubmissionStatus.values()[input.unpackInt()], LogEventSource.values()[input.unpackInt()], input.readUTF()).also { it.timestamp = timestamp }
            AuditLogEntryType.LOGIN -> LoginAuditLogEntry(id, input.readUTF(), input.readUTF(), LogEventSource.values()[input.unpackInt()]).also { it.timestamp = timestamp }
            AuditLogEntryType.LOGOUT -> LogoutAuditLogEntry(id, input.readUTF(), LogEventSource.values()[input.unpackInt()]).also { it.timestamp = timestamp }
        }
    }
}