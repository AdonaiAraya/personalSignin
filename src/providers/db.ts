import {Injectable} from "@angular/core";
import {Storage} from "@ionic/storage";
import {Observable} from "rxjs/Observable";
import "rxjs/add/operator/map";
import { Configuration } from "../models/Configuration";
import { DayLog } from "../models/DayLog";
import { Settings } from "../models/Settings";

@Injectable()
export class DBService{
    private readonly KEY_CONFIGURATION: string = "configuration";
    private readonly KEY_DAY_LOG: string = "daylog";
    private readonly KEY_SETTINGS: string = "settings";

    constructor(public storage: Storage){

    }

    getConfiguration(): Observable<Configuration[]> {
        return new Observable( (observer) => {
            this.storage.ready().then(() => {
                this.storage.get(this.KEY_CONFIGURATION).then((value) => {
                    let configurations: Configuration[] = [];

                    if(value){
                        for(let val of value){
                            configurations.push(
                                new Configuration(
                                    val.weekDay,
                                    new Date(val.startTime),
                                    new Date(val.endTime),
                                    typeof val.lunchDay == "undefined" ? true : val.lunchDay,
                                    val.active
                                )
                            );
                        }
                    }

                    observer.next(configurations);
                    observer.complete();
                });
            });
        } );
    }

    setConfiguration(configurations: Configuration[]){
        this.storage.set(this.KEY_CONFIGURATION, configurations);
    }

    deleteConfiguration(){
        this.storage.remove(this.KEY_CONFIGURATION);
    }

    getDayLogs(): Observable<DayLog[]>{
        return new Observable( (observer) => {
            this.storage.ready().then(() => {
                this.storage.get(this.KEY_DAY_LOG).then((value) => {
                    let daylogs: DayLog[] = [];

                    if(value){
                        for(let val of value){
                            daylogs.push(
                                new DayLog(
                                    new Date(val.date),
                                    val.weekday,
                                    new Date(val.configurationStartTime),
                                    new Date(val.configurationEndTime),
                                    val.startTime ? new Date(val.startTime) : null,
                                    val.endTime ? new Date(val.endTime) : null
                                )
                            );
                        }
                    }

                    observer.next(daylogs);
                    observer.complete();
                });
            });
        } );
    }

    setDayLogs(daylogs: DayLog[]){
        this.storage.set(this.KEY_DAY_LOG, daylogs);
    }

    deleteDayLogs(){
        this.storage.remove(this.KEY_DAY_LOG);
    }

    getSettings(): Observable<Settings> {
        return new Observable( (observer) => {
            this.storage.ready().then(() => {
                this.storage.get(this.KEY_SETTINGS).then((value) => {
                    let settings = new Settings(
                        true,
                        "¡Hora de salida!",
                        new Date(1970, 0, 1, 0, 20)
                    );

                    if(value){
                        settings.notifyEndTimeShift = value.notifyEndTimeShift;
                        settings.notifyEndTimeText = value.notifyEndTimeText;
                        settings.timeToLunch = new Date(value.timeToLunch);
                    }

                    observer.next(settings);
                    observer.complete();
                });
            });
        } );
    }

    setSettings(settings: Settings){
        this.storage.set(this.KEY_SETTINGS, settings);
    }

    deleteSettings(){
        this.storage.remove(this.KEY_SETTINGS);
    }
}