import {Component} from "@angular/core";

import {TodayPage} from "../today/today";
import {ConfigurationPage} from "../configuration/configuration";
import {LogPage} from "../log/log";
import {SettingsPage} from "../settings/settings";

@Component({
    templateUrl: "tabs.html"
})
export class TabsPage {

    tabs: {page: any, icon: String, title: String}[] = [];

    constructor() {
        this.tabs.push({ page: TodayPage, icon: "time", title: "Hoy" });
        this.tabs.push({ page: ConfigurationPage, icon: "calendar", title: "Configuración" });
        this.tabs.push({ page: LogPage, icon: "stats", title: "Archivo" });
        this.tabs.push({ page: SettingsPage, icon: "settings", title: "Opciones" });
    }
}
