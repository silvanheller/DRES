package dres.run.score.scorer

import dres.data.model.run.CompetitionRun
import dres.data.model.run.SubmissionStatus
import dres.run.score.interfaces.RecalculatingTaskRunScorer
import java.util.concurrent.locks.ReentrantReadWriteLock
import kotlin.concurrent.read
import kotlin.concurrent.write
import kotlin.math.max

class KisTaskScorer : RecalculatingTaskRunScorer {

    private val maxPointsPerTask = 100.0
    private val maxPointsAtTaskEnd = 50.0
    private val penaltyPerWrongSubmission = 10.0

    private var lastScores: Map<Int, Double> = emptyMap()
    private val lastScoresLock = ReentrantReadWriteLock()

    override fun analyze(task: CompetitionRun.TaskRun): Map<Int, Double> = this.lastScoresLock.write {

        val taskStart = task.started ?: return emptyMap()
        val taskDuration = max(task.task.duration * 1000L, (task.ended ?: 0) - taskStart ).toDouble() //actual duration of task, in case it was extended during competition

        this.lastScores = task.competition.competitionDescription.teams.indices.map { teamId ->
            val submissions =  task.data.submissions.filter { it.team == teamId && (it.status == SubmissionStatus.CORRECT || it.status == SubmissionStatus.WRONG) }.sortedBy { it.timestamp }
            val firstCorrect = submissions.indexOfFirst { it.status == SubmissionStatus.CORRECT }
            val score = if (firstCorrect > -1) {
                val timeFraction = 1.0 - (submissions[firstCorrect].timestamp - taskStart) / taskDuration

                max(0.0,
                        maxPointsAtTaskEnd +
                                ((maxPointsPerTask - maxPointsAtTaskEnd) * timeFraction) -
                                (firstCorrect * penaltyPerWrongSubmission) //index of first correct submission is the same as number of not correct submissions
                )
            } else {
                0.0
            }
            teamId to score
        }.toMap()

        return this.lastScores
    }

    override fun scores(): Map<Int, Double> = this.lastScoresLock.read { this.lastScores }
}