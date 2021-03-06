package dres.run.validation.interfaces

import dres.data.model.run.Submission
import dres.data.model.run.SubmissionStatus

/**
 * A [SubmissionValidator] that bases validation on human (manual) verdicts. This kind of [SubmissionValidator]
 * is inherently asynchronous.
 *
 * @author Luca Rossetto & Ralph Gasser
 * @version 1.0
 */
interface JudgementValidator : SubmissionValidator {
    /** unique id to identify the [JudgementValidator]*/
    val id: String

    /** The number of [Submission]s that are currently pending a judgement. */
    val pending: Int

    /** The number of [Submission]s which have not yet been presented to a judge */
    val open: Int

    val hasOpen: Boolean
        get() = open > 0

    /**
     * Enqueues a [Submission] with the internal judgment queue and updates its [SubmissionStatus]
     * to [SubmissionStatus.INDETERMINATE].
     *
     * @param submission The [Submission] to validate.
     */
    override fun validate(submission: Submission)

    /**
     * Retrieves and returns the next element that requires a verdict from this [JudgementValidator]'
     * internal queue. If such an element exists, then the [Submission] is returned alongside a
     * unique token, that can be used to update the [Submission]'s [SubmissionStatus].
     *
     * @return Optional [Pair] containing a string token and the [Submission] that should be judged.
     */
    fun next(queue: String): Pair<String, Submission>?

    /**
     * Places a verdict for the [Submission] identified by the given token.
     *
     * @param token The token used to identify the [Submission].
     * @param verdict The verdict of the judge.
     */
    fun judge(token: String, verdict: SubmissionStatus)
}

