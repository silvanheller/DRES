import {AfterViewInit, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {CompetitionRunService, RunInfo, RunState} from '../../../openapi';
import {interval, Observable, of, pipe, Subscription} from 'rxjs';
import {filter, flatMap, map, switchMap} from 'rxjs/operators';
import {IWsMessage} from '../model/ws/ws-message.interface';
import {IWsClientMessage} from '../model/ws/ws-client-message.interface';
import {WebSocketSubject} from 'rxjs/webSocket';
import {IWsServerMessage} from '../model/ws/ws-server-message.interface';

@Component({
    selector: 'app-task-viewer',
    templateUrl: './task-viewer.component.html',
    styleUrls: ['./task-viewer.component.scss']
})
export class TaskViewerComponent implements OnInit, OnDestroy {
    @Input() info: Observable<RunInfo>;
    @Input() state: Observable<RunState>;
    @Input() webSocket: WebSocketSubject<IWsMessage>;

    polledState: Observable<RunState>;

    /** Internal subscription to the WebSocket messages to handle Task Preparation. */
    private prepareSubscription: Subscription;

    constructor(protected runService: CompetitionRunService) {}

    ngOnInit(): void {
        this.prepareSubscription = this.webSocket.pipe(
            filter(m => (m as IWsServerMessage).type === 'TASK_PREPARE')
        ).subscribe(m => {

            /* TODO: Download, cache and play query object, wait for playback to complete, then ACK. */
            this.webSocket.next({runId: m.runId, type: 'ACK'} as IWsClientMessage);
        });

        this.polledState = this.state.pipe(
            switchMap(s => {
                if (s.status === 'RUNNING_TASK') {
                    return interval(1000).pipe(
                        switchMap(t => this.runService.getApiRunStateWithRunid(s.id)),
                    );
                } else {
                    return of(s);
                }
            })
        );
    }

    /**
     * Cleanup subscription.
     */
    ngOnDestroy(): void {
        this.prepareSubscription.unsubscribe();
        this.prepareSubscription = null;
    }

    public toHHMMSS(milliseconds: number): string {
        const sec_num = Math.round(milliseconds / 1000);
        const hours   = Math.floor(sec_num / 3600);
        const minutes = Math.floor(sec_num / 60) % 60;
        const seconds = sec_num % 60;

        return [hours, minutes, seconds]
            .map(v => v < 10 ? '0' + v : v)
            .filter((v, i) => v !== '00' || i > 0)
            .join(':');
    }


}
