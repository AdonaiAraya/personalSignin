import {Injectable} from "@angular/core";

@Injectable()
export class Utils{
    constructor(){}

    public static getISOHours(date: Date){
        let hours: number = date.getHours();
        let minutes: number = date.getMinutes();
        let hoursFormatted: string = hours > 10 ? "" + hours : "0" + hours;
        let minutesFormatted: string = minutes > 10 ? "" + minutes : "0" + minutes;

        return hoursFormatted + ":" + minutesFormatted;
    }

    public static getDateFingerprint(date: Date): number{
        let year = date.getFullYear();
        let month = date.getMonth() < 10 ? "0" + date.getMonth() : date.getMonth();
        let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();

        return parseInt(year + "" + month + "" + day);
    }

    public static getDiffBetweenDates(endDate: Date, startDate: Date): number {
        let startTime: number = startDate.getTime();
        let endTime: number = endDate.getTime();
        if(endTime < startTime) endTime += 24 * 60 * 60 * 1000;
        return (endTime - startTime) / 1000;
    }
}