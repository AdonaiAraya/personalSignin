import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnChanges,
    DoCheck,
    OnDestroy,
    SimpleChanges,
    KeyValueDiffers
} from "@angular/core";
import { ModalController } from "ionic-angular";

import { ChangeDateModal } from "../change-date-modal/change-date-modal";
import { DayLog } from "../../models/DayLog";

@Component({
    selector: "ps-chronometer",
    templateUrl: "chronometer.html"
})
export class Chronometer implements OnChanges, OnDestroy, DoCheck{
    @Input() dayLog: DayLog;
    @Output() changeTime: EventEmitter<{time: Date, type: string}> = new EventEmitter();

    interval: any;
    timeFormatted: string;
    start: Date;
    end: Date;
    userEnd: Date;
    progress: number;
    differ: any;

    constructor(public modalCtrl: ModalController, public differs: KeyValueDiffers){
        this.differ = differs.find({}).create(null);
    }

    ngOnChanges(changes: SimpleChanges){
        if(changes && changes["dayLog"] && changes["dayLog"]["previousValue"] && this.dayLog) {
            this.initChronometer(this.dayLog);
        }
    }

    ngOnDestroy(){
        if(this.interval) clearInterval(this.interval);
    }

    ngDoCheck(){
        let changes = this.differ.diff(this.dayLog);

        if(changes) {
            changes.forEachChangedItem((c) => {
                if(c.key == "endTime"){
                    this.dayLog.endTime = c.currentValue;
                    this.initChronometer(this.dayLog);
                }
            });
        }
    }

    changeDate(type: string): void{
        if((type == "start" && !this.dayLog.endTime) || (type == "end" && this.dayLog.endTime)){
            let modal = this.modalCtrl.create(ChangeDateModal, {
                time: type == "start" ? this.dayLog.startTime : this.dayLog.endTime
            });

            modal.present();

            modal.onDidDismiss((data) => {
                if(data && data.time){
                    if(type == "start") this.dayLog.startTime = data.time;
                    if(type == "end") this.dayLog.endTime = data.time;

                    this.initChronometer(this.dayLog);

                    this.changeTime.emit({
                        time: data.time,
                        type: type
                    });
                }
            });
        }
    }

    private initChronometer(dayLog: DayLog): void{
        if(this.interval) clearInterval(this.interval);
        let start = new Date();
        start.setHours(dayLog.startTime.getHours(), dayLog.startTime.getMinutes(), 0, 0);
        this.start = start;

        let unixStart: number = dayLog.configurationStartTime.getTime();
        let unixEnd: number = dayLog.configurationEndTime.getTime();

        if(unixStart > unixEnd) unixEnd += 1000 * 60 * 60 * 24; //24 hours
        let unixDiff: number = unixEnd - unixStart;

        this.end = new Date( this.start.getTime() + unixDiff );

        if(dayLog.endTime) {
            this.userEnd = new Date();
            this.userEnd.setHours(dayLog.endTime.getHours(), dayLog.endTime.getMinutes(), 0, 0);
        }
        else {
            this.userEnd = null;
        }

        this.startTimer();
    }

    private startTimer(): void {
        let _self: any = this;
        let start: Date = this.start;
        let end: Date = this.end;

        if(this.dayLog.endTime) {
            let endDate = new Date();
            endDate.setHours(this.dayLog.endTime.getHours(), this.dayLog.endTime.getMinutes());
            tick(endDate);
        }
        else {
            tick(new Date());
        }

        this.interval = setInterval(() => {
            if(this.dayLog.endTime) {
                clearInterval(this.interval);
            }
            else {
                tick(new Date());
            }
        }, 1000);

        function tick(now: Date){
            let diff: number = end.getTime() - now.getTime();

            let hoursUnparsed = diff / (1000 * 60 * 60);
            let minutesUnparsed = (diff % (1000 * 60 * 60)) / (60 * 1000);

            let hours: number = diff >= 0 ? Math.abs(Math.floor(hoursUnparsed)) : Math.abs(Math.ceil(hoursUnparsed));
            let minutes: number = diff >= 0 ? Math.abs(Math.floor(minutesUnparsed)) : Math.abs(Math.ceil(minutesUnparsed));

            let hoursFormatted: string = hours < 10 ? "0" + hours : "" + hours;
            let minutesFormatted: string = minutes < 10 ? "0" + minutes : "" + minutes;

            _self.timeFormatted = (diff < 0 ? "- " : "") + hoursFormatted + ":" + minutesFormatted;
            let progress: number = (now.getTime() - start.getTime()) * 100 / (end.getTime() - start.getTime());
            if(progress > 100) progress = 100;
            _self.progress = progress;
        }
    }
}