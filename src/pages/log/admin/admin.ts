import {Component} from "@angular/core";
import { DatePipe } from "@angular/common";
import { ActionSheetController, ToastController, AlertController, Platform } from "ionic-angular";
import { Vibration } from "ionic-native";

import { DayLog } from "../../../models/DayLog";

import { DBService } from "../../../providers/db";
import { Utils } from "../../../providers/utils";

@Component({
    selector: "page-admin-logs",
    templateUrl: "admin.html"
})
export class AdminLogsPage{
    logs: DayLog[];
    weeklyHeaderShowed: boolean;
    olderHeaderShowed: boolean;

    constructor(
        private db: DBService,
        private actionSheetCtrl: ActionSheetController,
        private datePipe: DatePipe,
        private toastCtrl: ToastController,
        private alertCtrl: AlertController,
        private platform: Platform
    ){

        this.weeklyHeaderShowed = false;
        this.olderHeaderShowed = false;
    }

    ionViewWillEnter(){
        this.weeklyHeaderShowed = false;
        this.olderHeaderShowed = false;

        this.db.getDayLogs().subscribe((dayLogs) => {
            this.logs = dayLogs;
        });
    }

    ionViewDidLeave(){
        this.weeklyHeaderShowed = false;
        this.olderHeaderShowed = false;
    }

    checkHeaderSeparator(log, index, logs){
        let _self: any;

        _self = this;

        if(log){
            if(!_self._component.weeklyHeaderShowed){
                let currentDay: Date = new Date();
                let currentDayFingerprint: number = Utils.getDateFingerprint(currentDay);
                let currentWeekday: number = currentDay.getDay() === 0 ? 7 : currentDay.getDay();
                let startWeekFingerprint: number = currentDayFingerprint - currentWeekday + 1;

                let dayLogFingerprint: number = Utils.getDateFingerprint(log.date);

                if(dayLogFingerprint >= startWeekFingerprint){
                    _self._component.weeklyHeaderShowed = true;
                    return "Esta Semana";
                }
            }

            if(!_self._component.olderHeaderShowed){
                let currentDay: Date = new Date();
                let currentDayFingerprint: number = Utils.getDateFingerprint(currentDay);
                let currentWeekday: number = currentDay.getDay() === 0 ? 7 : currentDay.getDay();
                let startWeekFingerprint: number = currentDayFingerprint - currentWeekday + 1;

                let dayLogFingerprint: number = Utils.getDateFingerprint(log.date);

                if(dayLogFingerprint < startWeekFingerprint){
                    _self._component.olderHeaderShowed = true;
                    return "Registro antiguos";
                }
            }
        }

        return null;
    }

    deleteLogDay(log: DayLog){
        let index: number = this.logs.indexOf(log);

        if(index > -1){
            let _self = this;

            let alert = this.alertCtrl.create({
                title: "¿Deseas borrar el registro?",
                subTitle: "Se borrará permanentemente y no se podrá recuperar",
                buttons: [
                    {
                        text: "Cancelar",
                        role: "cancel"
                    },
                    {
                        text: "Borrar",
                        handler: () => {
                            _self.weeklyHeaderShowed = false;
                            _self.olderHeaderShowed = false;

                            this.logs.splice(index, 1);
                            this.db.setDayLogs(this.logs);

                            let toast = this.toastCtrl.create({
                                message: "Se ha borrado el registro correctamente",
                                duration: 3000,
                                position: "bottom"
                            });
                            toast.present();
                        }
                    }
                ]
            });
            alert.present();
        }
        else {
            let toast = this.toastCtrl.create({
                message: "No se ha podido borrar el registro",
                duration: 3000,
                position: "bottom"
            });
            toast.present();
        }
    }

    openOptions(event, log){
        if(this.platform.is("cordova")){
            Vibration.vibrate(25);
        }

        let actionSheet = this.actionSheetCtrl.create({
            title: "Administrar registro",
            subTitle: this.datePipe.transform(log.date, "EEEE dd, MMMM"),
            buttons: [
                {
                    text: "Borrar",
                    icon: "md-trash",
                    role: "destructive",
                    handler: () => {
                        this.deleteLogDay(log);
                    }
                },
                {
                    text: "Cancelar",
                    icon: "md-close",
                    role: "cancel"
                }
            ]
        });

        actionSheet.present();

    }

    rippleEffect(): void{}
}