import {Component} from '@angular/core';
import {AbstractRunListComponent} from './abstract-run-list.component';
import {CompetitionRunAdminService, CompetitionRunService} from '../../../openapi';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';

@Component({
    selector: 'app-admin-run-list',
    templateUrl: './admin-run-list.component.html'
})
export class AdminRunListComponent extends AbstractRunListComponent{
    constructor(runService: CompetitionRunService,
                runAdminService: CompetitionRunAdminService,
                router: Router,
                private snackBar: MatSnackBar) {
        super(runService, runAdminService, router);
    }

    public start(runId: number) {
        this.runAdminService.postApiRunAdminWithRunidStart(runId).subscribe(
            (r) => {
                this.update.next();
                this.snackBar.open(`Success: ${r.description}`, null, { duration: 5000});
            }, (r) => {
                this.snackBar.open(`Error: ${r.error.description}`, null, { duration: 5000});
            }
        );
    }

    public terminate(runId: number) {
        this.runAdminService.postApiRunAdminWithRunidTerminate(runId).subscribe(
            (r) => {
                this.update.next();
                this.snackBar.open(`Success: ${r.description}`, null, { duration: 5000});
            }, (r) => {
                this.snackBar.open(`Error: ${r.error.description}`, null, { duration: 5000});
            }
        );
    }

    public nextTask(runId: number) {
        this.runAdminService.postApiRunAdminWithRunidTaskNext(runId).subscribe(
            (r) => {
                this.update.next();
                this.snackBar.open(`Success: ${r.description}`, null, { duration: 5000});
            }, (r) => {
                this.snackBar.open(`Error: ${r.error.description}`, null, { duration: 5000});
            }
        );
    }

    public previousTask(runId: number) {
        this.runAdminService.postApiRunAdminWithRunidTaskPrevious(runId).subscribe(
            (r) => {
                this.update.next();
                this.snackBar.open(`Success: ${r.description}`, null, { duration: 5000});
            }, (r) => {
                this.snackBar.open(`Error: ${r.error.description}`, null, { duration: 5000});
            }
        );
    }

    public startTask(runId: number) {
        this.runAdminService.postApiRunAdminWithRunidTaskStart(runId).subscribe(
            (r) => {
                this.update.next();
                this.snackBar.open(`Success: ${r.description}`, null, { duration: 5000});
            }, (r) => {
                this.snackBar.open(`Error: ${r.error.description}`, null, { duration: 5000});
            }
        );
    }

    public abortTask(runId: number) {
        this.runAdminService.postApiRunAdminWithRunidTaskAbort(runId).subscribe(
            (r) => {
                this.update.next();
                this.snackBar.open(`Success: ${r.description}`, null, { duration: 5000});
            }, (r) => {
                this.snackBar.open(`Error: ${r.error.description}`, null, { duration: 5000});
            }
        );
    }
}
