package dres.api.rest.types.run

import kotlinx.serialization.Serializable

/**
 * Message send by the DRES client via WebSocket to communicate with the DRES server.
 *
 * @author Ralph Gasser
 * @version 1.0
 */
@Serializable
data class ClientMessage(val type: ClientMessageType)

enum class ClientMessageType {
    ACK     /** Acknowledgement of the last message received. */
}