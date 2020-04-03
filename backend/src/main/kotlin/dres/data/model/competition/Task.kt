package dres.data.model.competition

import kotlinx.serialization.Serializable

@Serializable
data class Task(val name: String, val taskGroup: String, val description: TaskDescription, val duration: Long = TaskType.KIS_TEXTUAL.defaultDuration) //TODO maybe normalise taskGroup into its own entity?