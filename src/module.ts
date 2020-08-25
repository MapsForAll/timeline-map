import {Marker} from './marker/marker';
import {MetaData} from './marker/metaData';
import {fetch} from './marker/fetch';
import * as domHelper from './dom/dom';
import Slider from './slider/slider';
import {TheMap} from './map/map';
import {Google, fetchGoogle} from './map/google';

export interface MapsCallBack {
    (data: object): void;
}

export default class TimeLineMap {
    private google: Google;
    private map: TheMap;
    private mapId: string;
    private markers: Marker[];
    private slider: Slider;
    private mapControlId: string;
    private dateControlId: string;
    private listeners: Map<string, MapsCallBack>;
    private metaData: MetaData;

    public constructor() {
        this.mapId = '';
        this.mapControlId = 'timeLineMapControl';
        this.dateControlId = 'timeLineDateControl';
        this.listeners = new Map<string, MapsCallBack>();

        this.processArguments(arguments);
    }

    public async create(incrementViewCount = false): Promise<void> {
        this.google = await fetchGoogle();
        await this.getMapData(incrementViewCount);
        this.createMap();
        this.createSlider();
    }

    public addListener(type: string, cb: MapsCallBack): void {
        this.listeners.set(type, cb);
    }

    public select(marker: Marker): void {
        this.map.panTo(marker);
    }

    private processArguments(passedArguments: IArguments): void {
        this.mapId = passedArguments[0];
        if (passedArguments.length === 3) {
            this.mapControlId = passedArguments[1];
            this.dateControlId = passedArguments[2];
            domHelper.addClasses(this.mapControlId, this.dateControlId);
        } else {
            const parentDivId = passedArguments[1];
            domHelper.createControlDivs(parentDivId, this.mapControlId, this.dateControlId);
        }

        domHelper.ensureMapHeight(this.mapControlId);
    }

    private async getMapData(incrementViewCount: boolean): Promise<void> {
        ({markers: this.markers, metaData: this.metaData} = await fetch(this.mapId, incrementViewCount));
        this.sendMetaData(this.metaData);
        this.update(this.markers);
    }

    private async createMap(): Promise<void> {
        this.map = new TheMap();
        await this.map.createMap(this.google, this.mapControlId, this.metaData.icon, this.metaData.pin);
        this.map.createClusterer(this.markers);
    }

    private async createSlider(): Promise<void> {
        if (this.metaData.hasDates) {
            this.slider = new Slider(this.dateControlId, this.metaData, ([yearStart, yearEnd]: number[]) => {
                const markers = this.markers.filter(marker => marker.isInRange(yearStart, yearEnd, this.metaData));
                this.map.updateClusterer(markers);
                this.update(markers);
            });
        }
    }

    private update(markers: object): void {
        if (this.listeners.has('update')) {
            const fn = this.listeners.get('update') as MapsCallBack;
            fn(markers);
        }
    }

    private sendMetaData(metaData: MetaData): void {
        if (this.listeners.has('metaData')) {
            const fn = this.listeners.get('metaData') as MapsCallBack;
            fn(metaData);
        }
    }
}
