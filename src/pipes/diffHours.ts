import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "diffHours"
})
export class DiffHours implements PipeTransform {
    transform(value: any, from: string, to: string): string{
        if(value && from && to){
            let fromHours: number = parseInt(from.split(":")[0]);
            let fromMinutes: number = parseInt(from.split(":")[1]);
            let toHours: number = parseInt(to.split(":")[0]);
            let toMinutes: number = parseInt(to.split(":")[1]);

            if(fromHours > toHours) toHours += 24;
            let fromSeconds: number = fromHours * 3600 + fromMinutes * 60;
            let toSeconds: number = toHours * 3600 + toMinutes * 60;
            let diff: number = toSeconds - fromSeconds;

            let diffHours: number = Math.floor(diff / 3600);
            let diffMinutes: number = Math.floor((diff % 3600) / 60);

            let diffHoursFormatted: string = diffHours < 10 ? "0" + diffHours: "" + diffHours;
            let diffMinutesFormatted: string = diffMinutes < 10 ? "0" + diffMinutes: "" + diffMinutes;

            return diffHoursFormatted + ":" + diffMinutesFormatted;
        }

        return "0";
    }
}