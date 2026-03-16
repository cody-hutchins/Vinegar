// @ts-nocheck
import castv2Cli from "castv2-client";
const RequestResponseController = castv2Cli.RequestResponseController;

export class CiderCastController extends RequestResponseController {
  constructor(client: string, sourceId: string, destinationId: string) {
    super(client, sourceId, destinationId, "urn:x-cast:com.ciderapp.customdata");
    this.once("close", onclose);
    const self = this;
    function onclose() {
      self.stop();
    }
  }

  sendIp(ip: string) {
    // TODO: Implement Callback
    const data = {
      ip: ip,
    };
    this.request(data);
  }

  kill() {
    // TODO: Implement Callback
    const data = {
      action: "stop",
    };
    this.request(data);
  }
}
