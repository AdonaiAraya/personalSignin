import {Component} from "@angular/core";
import {Platform, NavController, ToastController} from "ionic-angular";
import {AppVersion} from "ionic-native";

import {DBService} from "../../providers/db";
import {Utils} from "../../providers/utils";

import {Settings} from "../../models/Settings";

@Component({
    selector: "page-settings",
    templateUrl: "settings.html"
})
export class SettingsPage{
    settings: any = {};
    dbSettings: Settings;
    appVersionNumber: string = "0.0.0";

    constructor(
        public navCtrl: NavController,
        public toastCtrl: ToastController,
        public platform: Platform,
        public db: DBService){

    }

    ionViewWillEnter(){
        this.db.getSettings().subscribe(
            (settings) => {
                this.dbSettings = settings;

                this.settings.notifyEndTimeShift = settings.notifyEndTimeShift;
                this.settings.notifyEndTimeText = settings.notifyEndTimeText;
                this.settings.timeToLunch = Utils.getISOHours(settings.timeToLunch);
            }
        );

        if(this.platform.is("cordova")){
            AppVersion.getVersionNumber().then(
                (versionNumber) => {
                    console.log("versionNumber", versionNumber);
                    this.appVersionNumber = versionNumber;
                }
            );
        }
    }

    save(){
        setTimeout(() => {
            this.dbSettings.notifyEndTimeShift = this.settings.notifyEndTimeShift;
            this.dbSettings.notifyEndTimeText = this.settings.notifyEndTimeText;
            this.dbSettings.timeToLunch = new Date(1970, 0, 1, this.settings.timeToLunch.split(":")[0], this.settings.timeToLunch.split(":")[1]);

            this.db.setSettings(this.dbSettings);

            let toast = this.toastCtrl.create({
                message: "Se han guardado las opciones correctamente",
                duration: 3000,
                position: "bottom"
            });
            toast.present();
        });
    }
}