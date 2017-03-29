export class Configuration {
    constructor(
        public weekDay: number, //1 Monday - 7 Sunday
        public startTime: Date,
        public endTime: Date,
        public lunchDay: boolean,
        public active: boolean
    ){

    }
}