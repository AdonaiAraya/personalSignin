export class DayLog {
    constructor(
        public date: Date,
        public weekDay: number,
        public configurationStartTime: Date,
        public configurationEndTime: Date,
        public startTime?: Date,
        public endTime?: Date
    ){

    }

}