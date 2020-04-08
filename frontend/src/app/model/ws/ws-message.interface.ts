/**
 * Structure of a message as generated by the DRES client.
 */
import {ServerMessageType} from './server-message-type.enum';
import ServerMessageTypeEnum = ServerMessageType.ServerMessageTypeEnum;
import {ClientMessageType} from './client-message-type.enum';
import ClientMessageTypeEnum = ClientMessageType.ClientMessageTypeEnum;

export interface IWsMessage {
    runId: number;
    type: (ClientMessageTypeEnum | ServerMessageTypeEnum);
}
