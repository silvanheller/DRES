import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup} from '@angular/forms';


export interface CompetitionCreateDialogResult {
    name: string;
    description: string;
}

@Component({
    selector: 'app-competition-create-dialog',
    templateUrl: 'competition-create-dialog.component.html',
})
export class CompetitionCreateDialogComponent {
    form: FormGroup = new FormGroup({name: new FormControl(''), description: new FormControl('')});

    constructor(public dialogRef: MatDialogRef<CompetitionCreateDialogComponent>) {}

    public create(): void {
        if (this.form.valid) {
            this.dialogRef.close({
                name: this.form.get('name').value,
                description: this.form.get('description').value} as CompetitionCreateDialogResult);
        }
    }

    public close(): void {
        this.dialogRef.close(null);
    }
}
