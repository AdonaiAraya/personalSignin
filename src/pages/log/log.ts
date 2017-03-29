import {Component} from "@angular/core";
import {NavController} from "ionic-angular";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/zip";

import { Configuration } from "../../models/Configuration";
import { Settings } from "../../models/Settings";
import { DayLog } from "../../models/DayLog";
import { AdminLogsPage } from "./admin/admin";

import { DBService } from "../../providers/db";
import { Utils } from "../../providers/utils";

@Component({
    selector: "page-log",
    templateUrl: "log.html"
})
export class LogPage{
    configurations: Configuration[];
    settings: Settings;
    dayLogs: DayLog[];

    log: any = {
        global: {
            hours: "0h",
            timeToLunch: "0m"
        },
        weekly: {
            days: 0,
            hours: "0h",
            balance: "+0h",
            balancePositive: true
        },
        historic: {
            days: 0,
            hours: "0h",
            balance: "+0h",
            balancePositive: true
        }
    };

    constructor(
        public navCtrl: NavController,
        public db: DBService
    ){

    }

    ionViewWillEnter(){
        Observable.zip(
            this.db.getSettings(),
            this.db.getDayLogs(),
            this.db.getConfiguration(),
            (settings: Settings, daylogs: DayLog[], configurations: Configuration[]) => ({
                settings, daylogs, configurations
            })
        ).subscribe((rs) => {
            this.configurations = rs.configurations;
            this.settings = rs.settings;
            this.dayLogs = rs.daylogs;

            this.setLogs();
        });
    }

    goToAdminLogs(){
        this.navCtrl.push(AdminLogsPage);
    }

    private setLogs(): void{
        //Global
        let timeToLunchSeconds: number = 0;
        let configuredSeconds: number = 0;

        let timeToLunchMinutes: number = this.settings.timeToLunch.getMinutes();
        let timeToLunchHours: number = this.settings.timeToLunch.getHours();

        timeToLunchSeconds = ( timeToLunchMinutes * 60 ) + (timeToLunchHours * 3600);

        for(let configuration of this.configurations){
            if(configuration.active){
                configuredSeconds += Utils.getDiffBetweenDates(configuration.endTime, configuration.startTime);
                if(configuration.lunchDay) configuredSeconds -= timeToLunchSeconds;
            }
        }

        this.log.global.hours = (configuredSeconds / 3600).toFixed(1) + "h";
        this.log.global.timeToLunch = (timeToLunchSeconds / 60) + "m";

        //Weekly
        let currentDay: Date = new Date();
        let currentDayFingerprint: number = Utils.getDateFingerprint(currentDay);
        let currentWeekday: number = currentDay.getDay() === 0 ? 7 : currentDay.getDay();
        let startWeekFingerprint: number = currentDayFingerprint - currentWeekday + 1;
        let totalDaysThisWeek: number = 0;
        let totalSecondsThisWeek: number = 0;
        let totalSecondsConfThisWeek: number = 0;

        for(let c = 0; c < this.dayLogs.length; c++){
            let dayLog: DayLog = this.dayLogs[c];
            let dayLogFingerprint: number = Utils.getDateFingerprint(dayLog.date);

            if(dayLogFingerprint >= startWeekFingerprint){
                totalDaysThisWeek++;
                let today: Date = new Date();
                today.setFullYear(1970, 0, 1);

                let end: Date;
                if(currentDayFingerprint == dayLogFingerprint){
                    end = dayLog.endTime ? dayLog.endTime : today;
                }
                else {
                    end = dayLog.endTime ? dayLog.endTime : dayLog.configurationEndTime;
                }

                totalSecondsThisWeek += Utils.getDiffBetweenDates(end, dayLog.startTime);
                totalSecondsConfThisWeek += Utils.getDiffBetweenDates(dayLog.configurationEndTime, dayLog.configurationStartTime);
            }
            else {
                break;
            }
        }

        this.log.weekly.days = totalDaysThisWeek;
        this.log.weekly.hours = (totalSecondsThisWeek / 3600).toFixed(1) + "h";
        this.log.weekly.balance = ((totalSecondsThisWeek - totalSecondsConfThisWeek) / 3600).toFixed(1) + "h";
        this.log.weekly.balancePositive = totalSecondsThisWeek - totalSecondsConfThisWeek >= 0;

        //historic
        let totalDaysHistoric: number = 0;
        let totalSecondsHistoric: number = 0;
        let totalSecondsConfHistoric: number = 0;

        for(let c = 0; c < this.dayLogs.length; c++){
            let dayLog: DayLog = this.dayLogs[c];
            let dayLogFingerprint: number = Utils.getDateFingerprint(dayLog.date);

            totalDaysHistoric++;
            let today: Date = new Date();
            today.setFullYear(1970, 0, 1);

            let end: Date;
            if(currentDayFingerprint == dayLogFingerprint){
                end = dayLog.endTime ? dayLog.endTime : today;
            }
            else {
                end = dayLog.endTime ? dayLog.endTime : dayLog.configurationEndTime;
            }

            totalSecondsHistoric += Utils.getDiffBetweenDates(end, dayLog.startTime);
            totalSecondsConfHistoric += Utils.getDiffBetweenDates(dayLog.configurationEndTime, dayLog.configurationStartTime);
        }

        this.log.historic.days = totalDaysHistoric;
        this.log.historic.hours = (totalSecondsHistoric / 3600).toFixed(1) + "h";
        this.log.historic.balance = ((totalSecondsHistoric - totalSecondsConfHistoric) / 3600).toFixed(1) + "h";
        this.log.historic.balancePositive = totalSecondsHistoric - totalSecondsConfHistoric >= 0;
    }
}