import {AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild} from '@angular/core';
import {
    CompetitionRunService,
    ImageQueryDescription,
    RunState,
    TaskDescription,
    TextQueryDescription,
    VideoQueryDescription
} from '../../../openapi';
import {combineLatest, interval, merge, Observable, of, Subscription, timer, zip} from 'rxjs';
import {catchError, filter, finalize, flatMap, map, share, shareReplay, switchMap, take, tap} from 'rxjs/operators';
import {IWsMessage} from '../model/ws/ws-message.interface';
import {IWsClientMessage} from '../model/ws/ws-client-message.interface';
import {WebSocketSubject} from 'rxjs/webSocket';
import {IWsServerMessage} from '../model/ws/ws-server-message.interface';
import {AppConfig} from '../app.config';

@Component({
    selector: 'app-task-viewer',
    templateUrl: './task-viewer.component.html',
    styleUrls: ['./task-viewer.component.scss']
})
export class TaskViewerComponent implements AfterViewInit, OnDestroy {
    @Input() runId: Observable<number>;
    @Input() state: Observable<RunState>;
    @Input() taskStarted: Observable<TaskDescription>;
    @Input() taskChanged: Observable<TaskDescription>;
    @Input() taskEnded: Observable<TaskDescription>;
    @Input() webSocket: Observable<IWsMessage>;
    @Input() webSocketSubject: WebSocketSubject<IWsMessage>;

    /** Time that is still left (only when a task is running). */
    timeLeft: Observable<number>;

    /** Time that has elapsed (only when a task is running). */
    timeElapsed: Observable<number>;

    /** Observable that returns true if task has ended and the currently active task is the same! */
    justEnded: Observable<boolean>;

    /** Observable that returns true if solution video should be displayed right after a task has ended! */
    showSolution: Observable<boolean>;

    /** Observable that returns and caches the current query object. */
    currentQueryObject: Observable<VideoQueryDescription | TextQueryDescription | ImageQueryDescription>;

    /** Value of the task count down. */
    taskCountdown = '';

    /** Reference to the audio element used during countdown. */
    @ViewChild('audio') audio: ElementRef<HTMLAudioElement>;

    /** Subscriptions */
    taskPrepareSubscription: Subscription;

    constructor(protected runService: CompetitionRunService, public config: AppConfig) {}

    /**
     * Create a subscription for task changes.
     */
    ngAfterViewInit(): void {
        /* Observable that returns true if task has ended and hasn't changed in the meanwhile! */
        this.justEnded = combineLatest([this.state, this.taskEnded]).pipe(
            map(([t1, t2]) => t1.currentTask.name === t2.name)
        );

        /* Observable that returns true if solution video should be displayed right after a task has ended! */
        this.showSolution = merge(
            this.taskStarted.pipe(map(p => false)),
            this.taskChanged.pipe(map(p => false)),
            this.taskEnded.pipe(map(p => true)),
        );

        /* Subscription for the current query object. */
        this.currentQueryObject = this.taskChanged.pipe(
            flatMap(task => this.runId),
            switchMap(id => this.runService.getApiRunWithRunidQuery(id).pipe(
                catchError(e => {
                    console.error('[TaskViewerComponent] Could not load current query object due to an error.', e);
                    return of(null);
                }),
                filter(q => q != null)
            )),
            shareReplay({bufferSize: 1, refCount: true})
        );

        /* Subscription reacting to TASK_PREPARE message. */
        this.taskPrepareSubscription = zip(
            this.webSocket.pipe(filter(m => m.type === 'TASK_PREPARE')),
            this.currentQueryObject,
        ).pipe(
            switchMap(([m, q]) => timer(0, 1000).pipe(
                take(6),
                map((v) => 5 - v),
                tap(count => {
                    try {
                        this.taskCountdown = String(count);
                        if (count > 0) {
                            this.audio.nativeElement.src = 'assets/audio/beep_1.ogg';
                            this.audio.nativeElement.play().then(r => {});
                        } else {
                            this.audio.nativeElement.src = 'assets/audio/beep_2.ogg';
                            this.audio.nativeElement.play().then(r => {});
                        }
                    } catch (e) {
                        console.error('[TaskViewerComponent] Failed to play sound effect.', e);
                    }
                }),
                finalize(() => this.webSocketSubject.next({runId: (m as IWsServerMessage).runId, type: 'ACK'} as IWsClientMessage))
            ))
        ).subscribe(() => {});

        /* Observable for the time left and time elapsed (for running tasks only). */
        const polledState = this.state.pipe(
            filter(s => s.status === 'RUNNING_TASK'),
            flatMap(s => interval(1000).pipe(
                switchMap(t => this.runService.getApiRunStateWithRunid(s.id)),
                catchError((err, o) => {
                    console.log(`[TaskViewerComponent] Error occurred while polling state: ${err?.message}`);
                    return of(null);
                }),
                filter(p => p != null)
            )),
            share()
        );

        /* */
        this.timeLeft = polledState.pipe(map(s => s.timeLeft));
        this.timeElapsed = polledState.pipe(map(s => s.currentTask?.duration - s.timeLeft));
    }

    /**
     * Cleanup all subscriptions.
     */
    ngOnDestroy(): void {
        this.taskPrepareSubscription.unsubscribe();
        this.taskPrepareSubscription = null;
    }

    public toFormattedTime(sec: number): string {
        const hours   = Math.floor(sec / 3600);
        const minutes = Math.floor(sec / 60) % 60;
        const seconds = sec % 60;

        return [hours, minutes, seconds]
            .map(v => v < 10 ? '0' + v : v)
            .filter((v, i) => v !== '00' || i > 0)
            .join(':');
    }
}
