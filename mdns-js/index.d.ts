// Path: node_modules/mdns-js/index.d.ts
declare module 'mdns-js'

declare class MdnsJs {
  constructor();
  version: string;
  name: string;
  Browser: any;
  Advertisement: any;
  createBrowser(serviceType: string): any;
  createAdvertisement(serviceType: string, port: number, txtRecord: any): any;
  ServiceType: any;
  makeServiceType(): any;
  tcp: any;
  udp: any;
}
