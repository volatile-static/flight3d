export interface FlightInfo {
  depart: [lat: number, lon: number]; // 起点经纬度
  arrive: [lat: number, lon: number]; // 终点经纬度
  departTime: string; // ISO 8601，带起飞地时区偏移
  arriveTime: string; // ISO 8601，带到达地时区偏移
}

export const FLIGHTS: Record<string, FlightInfo> = {
  // San Francisco SFO -> Taipei Taoyuan TPE
  UA853: {
    depart: [37.6, -122.4],
    arrive: [25.1, 121.2],
    departTime: '2025-12-06T23:45:00-08:00',
    arriveTime: '2025-12-08T04:45:00+08:00',
  },
  // Beijing Capital PEK -> San Francisco SFO
  UA889: {
    depart: [40.1, 116.6],
    arrive: [37.6, -122.4],
    departTime: '2027-01-07T19:20:00+08:00',
    arriveTime: '2027-01-07T14:50:00-08:00',
  },
};

export const DEFAULT_FLIGHT = 'UA853';

// 通过 URL 参数选择航班，例如 ?flight=UA889
const requested = new URLSearchParams(location.search).get('flight')?.toUpperCase();
export const FLIGHT_NO = requested && requested in FLIGHTS ? requested : DEFAULT_FLIGHT;
export const FLIGHT = FLIGHTS[FLIGHT_NO];
