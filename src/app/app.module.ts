import {NgModule, ErrorHandler, LOCALE_ID} from '@angular/core';
import {DatePipe} from "@angular/common";
import {IonicApp, IonicModule, IonicErrorHandler} from 'ionic-angular';
import {Storage} from "@ionic/storage";
import {MyApp} from './app.component';

import {TodayPage} from "../pages/today/today";
import {ConfigurationPage} from "../pages/configuration/configuration";
import {LogPage} from "../pages/log/log";
import {AdminLogsPage} from "../pages/log/admin/admin";
import {SettingsPage} from "../pages/settings/settings";
import {TabsPage} from '../pages/tabs/tabs';

import {Chronometer} from "../components/chronometer/chronometer";
import {ChangeDateModal} from "../components/change-date-modal/change-date-modal";

import {DBService} from "../providers/db";
import {Utils} from "../providers/utils";

import {DiffHours} from "../pipes/diffHours";

export function provideStorage() {
    return new Storage(["sqlite", "websql", "indexeddb"], { name: "personalSigninDB" });
}

@NgModule({
    declarations: [
        MyApp,
        TodayPage,
        ConfigurationPage,
        LogPage,
        AdminLogsPage,
        SettingsPage,
        TabsPage,
        DiffHours,
        Chronometer,
        ChangeDateModal
    ],
    imports: [
        IonicModule.forRoot(MyApp, {
            platforms: {
                android: {
                    tabsPlacement: "top",
                    tabsLayout: "title-hide"
                }
            }
        })
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        TodayPage,
        ConfigurationPage,
        LogPage,
        AdminLogsPage,
        SettingsPage,
        TabsPage,
        Chronometer,
        ChangeDateModal
    ],
    providers: [
        {provide: ErrorHandler, useClass: IonicErrorHandler},
        { provide: Storage, useFactory: provideStorage },
        { provide: LOCALE_ID, useValue: "es-ES" },
        DBService,
        Utils,
        DatePipe
    ]
})
export class AppModule {
}
