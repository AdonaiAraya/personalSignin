import {Component} from "@angular/core";
import {NavController, ToastController, Platform} from "ionic-angular";
import {LocalNotifications} from "ionic-native";

import {Configuration} from "../../models/Configuration";
import {DayLog} from "../../models/DayLog";

import {DBService} from "../../providers/db";
import {Utils} from "../../providers/utils";

@Component({
    selector: "page-today",
    templateUrl: "today.html"
})
export class TodayPage{
    pageLoaded: boolean = false;
    configurations: Configuration[];
    dayLogs: DayLog[];
    currentConfiguration: Configuration;
    currentDate: Date;
    currentDayLog: DayLog;

    constructor(
        public navCtrl: NavController,
        public toastCtrl: ToastController,
        public platform: Platform,
        public db: DBService
    ){
    }

    ionViewWillEnter(){
        this.currentDate = new Date();
        this.currentDate.setUTCHours(0, 0, 0, 0);

        this.db.getConfiguration().subscribe(
            (configurations: Configuration[]) => {
                this.configurations = configurations;

                let currentDay: Date = new Date();
                let currentWeekday: number = currentDay.getDay() === 0 ? 7 : currentDay.getDay();
                for(let configuration of this.configurations){
                    if(configuration.active && configuration.weekDay == currentWeekday){
                        this.currentConfiguration = configuration;
                        break;
                    }
                }

                this.pageLoaded = true;
            }
        );

        this.db.getDayLogs().subscribe(
            (dayLogs: DayLog[]) => {
                this.dayLogs = dayLogs;
                this.currentDayLog = null;

                for(let dayLog of dayLogs){
                    if(dayLog.date.getTime() == this.currentDate.getTime()){
                        this.currentDayLog = dayLog;
                        break;
                    }
                }
            }
        );
    }

    ionViewDidLeave(){
        this.currentConfiguration = null;
        this.pageLoaded = false;
    }

    goToConfiguration(){
        this.navCtrl.parent.select(1);
    }

    changeTime(event){
        if(event && this.currentDayLog){
            if(event.type == "start") this.currentDayLog.startTime = event.time;
            if(event.type == "end") this.currentDayLog.endTime = event.time;

            this.db.setDayLogs(this.dayLogs);

            let toast = this.toastCtrl.create({
                message: "Se ha editado correctamente",
                duration: 3000,
                position: "bottom"
            });
            toast.present();

            if(event.type == "start") this.setLocalNotification(this.currentDayLog);
        }
    }

    startDayLog(){
        if(this.currentConfiguration){
            let now = new Date();
            let dayLog = new DayLog(
                this.currentDate,
                this.currentConfiguration.weekDay,
                this.currentConfiguration.startTime,
                this.currentConfiguration.endTime,
                new Date(1970, 0, 1, now.getHours(), now.getMinutes())
            );

            this.currentDayLog = dayLog;
            this.dayLogs.unshift(dayLog);

            this.db.setDayLogs(this.dayLogs);

            this.setLocalNotification(dayLog);
        }
    }

    endDayLog(){
        if(this.currentConfiguration && this.currentDayLog){
            let now: Date = new Date();
            this.currentDayLog.endTime = new Date(1970, 0, 1, now.getHours(), now.getMinutes());

            this.db.setDayLogs(this.dayLogs);
        }
    }

    resetEndDayLog(){
        if(this.currentConfiguration && this.currentDayLog){
            this.currentDayLog.endTime = null;
            this.db.setDayLogs(this.dayLogs);
        }
    }

    private setLocalNotification(dayLog: DayLog){
        if(this.platform.is("cordova")){
            this.db.getSettings().subscribe((settings) => {
                if(settings.notifyEndTimeShift){
                    let diff: number = Utils.getDiffBetweenDates(dayLog.configurationEndTime, dayLog.configurationStartTime);
                    let hours: number = Math.floor(diff / 3600);
                    let minutes: number = (diff % 3600) / 60;
                    let notificationDate: Date = new Date(dayLog.date);
                    notificationDate.setHours(dayLog.startTime.getHours() + hours, dayLog.startTime.getMinutes() + minutes);

                    LocalNotifications.hasPermission().then(function () {
                        return LocalNotifications.cancelAll();
                    }).then(
                        function () {
                            LocalNotifications.schedule({
                                id: Utils.getDateFingerprint(dayLog.date),
                                title: "Personal Signin",
                                text: settings.notifyEndTimeText,
                                at: notificationDate
                            });
                        }
                    );
                }
            });
        }
    }
}