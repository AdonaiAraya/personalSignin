import { Component } from "@angular/core";
import { ViewController, NavParams } from "ionic-angular";

@Component({
    selector: "change-date-modal",
    templateUrl: "change-date-modal.html"
})
export class ChangeDateModal {
    time: string;

    constructor(public viewCtrl: ViewController, public navParams: NavParams){
        let time: Date = navParams.get("time");
        let hoursParsed: string = time.getHours() > 10 ? "" + time.getHours() : "0" + time.getHours();
        let minutesParsed: string = time.getMinutes() > 10 ? "" + time.getMinutes() : "0" + time.getMinutes();
        this.time = hoursParsed + ":" + minutesParsed;
    }

    closeModal(){
        this.viewCtrl.dismiss();
    }

    save(){
        let time: Date = new Date(1970, 0, 1, parseInt(this.time.split(":")[0]), parseInt(this.time.split(":")[1]));

        this.viewCtrl.dismiss({
            time: time
        });
    }
}