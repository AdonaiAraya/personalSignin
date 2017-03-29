import {Component} from "@angular/core";
import {NavController, AlertController, ToastController} from "ionic-angular";

import {Configuration} from "../../models/Configuration";

import {DBService} from "../../providers/db";

@Component({
    selector: "page-configuration",
    templateUrl: "configuration.html"
})
export class ConfigurationPage{
    readonly DAYS_OF_THE_WEEK = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
    configurations: Configuration[];
    selectedConfiguration: any = {};
    selected: boolean = false;

    constructor(public navCtrl: NavController, public alertCtrl: AlertController, public toastCtrl: ToastController, public db: DBService){

    }

    ionViewWillEnter(){
        this.db.getConfiguration().subscribe(
            (configurations) => {
                this.configurations = configurations;
            }
        );
    }

    ionViewDidLeave(){
        this.selected = false;
    }

    isConfigurationDayActive(dayOfWeek: number){
        if(this.configurations && this.configurations.length){
            for(let configuration of this.configurations){
                if(configuration.weekDay == dayOfWeek && configuration.active){
                    return true;
                }
            }
        }

        return false;
    }

    select(dayOfWeek: number){
        this.selected = true;
        let finded: boolean = false;

        if(this.configurations){
            for(let configuration of this.configurations){
                if(configuration.weekDay == dayOfWeek){
                    let startTimeHours: string = configuration.startTime.getHours() < 10 ? "0" + configuration.startTime.getHours() : "" + configuration.startTime.getHours();
                    let startTimeMinutes: string = configuration.startTime.getMinutes() < 10 ? "0" + configuration.startTime.getMinutes() : "" + configuration.startTime.getMinutes();
                    let endTimeHours: string = configuration.endTime.getHours() < 10 ? "0" + configuration.endTime.getHours() : "" + configuration.endTime.getHours();
                    let endTimeMinutes: string = configuration.endTime.getMinutes() < 10 ? "0" + configuration.endTime.getMinutes() : "" + configuration.endTime.getMinutes();

                    let startTime: string = startTimeHours + ":" + startTimeMinutes;
                    let endTime: string = endTimeHours + ":" + endTimeMinutes;

                    this.selectedConfiguration = {
                        weekDay: configuration.weekDay,
                        startTime: startTime,
                        endTime: endTime,
                        lunchDay: configuration.lunchDay,
                        active: configuration.active
                    };

                    finded = true;
                    break;
                }
            }
        }

        if(!finded){
            let startTime: string = "08:30";
            let endTime: string = "16:30";

            this.selectedConfiguration = {
                weekDay: dayOfWeek,
                startTime: startTime,
                endTime: endTime,
                lunchDay: true,
                active: false
            };
        }

        this.selectedConfiguration.dayName = this.DAYS_OF_THE_WEEK[this.selectedConfiguration.weekDay - 1];
    }

    submit(){
        if(this.selectedConfiguration){
            if(this.configurations == null) this.configurations = [];

            let upsertConfiguration: Configuration = null;

            let weekDay: number = this.selectedConfiguration.weekDay;
            let startTime: Date = new Date(1970, 0, 1, this.selectedConfiguration.startTime.split(":")[0], this.selectedConfiguration.startTime.split(":")[1]);
            let endTime: Date = new Date(1970, 0, 1, this.selectedConfiguration.endTime.split(":")[0], this.selectedConfiguration.endTime.split(":")[1]);
            let lunchDay: boolean = this.selectedConfiguration.lunchDay;
            let active: boolean = this.selectedConfiguration.active;

            for(let configuration of this.configurations){
                if(configuration.weekDay == this.selectedConfiguration.weekDay){
                    upsertConfiguration = configuration;
                    break;
                }
            }

            if(upsertConfiguration == null){
                upsertConfiguration = new Configuration(weekDay, startTime, endTime, lunchDay, active);
                this.configurations.push(upsertConfiguration);
            }
            else {
                upsertConfiguration.weekDay = weekDay;
                upsertConfiguration.startTime = startTime;
                upsertConfiguration.endTime = endTime;
                upsertConfiguration.lunchDay = lunchDay;
                upsertConfiguration.active = active;
            }

            this.db.setConfiguration(this.configurations);

            let toast = this.toastCtrl.create({
                message: "Se ha guardado la configuración correctamente",
                duration: 3000,
                position: "bottom"
            });
            toast.present();

            this.selected = false;
        }
        else {
            let alert = this.alertCtrl.create({
                title: "Ha ocurrido un error",
                subTitle: "No se ha podido guardar la configuración",
                buttons: ["Ok"]
            });
            alert.present();
        }
    }
}