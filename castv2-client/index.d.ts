declare module 'castv2-client' {
    export = Cast;
  }
  
  
  declare namespace Cast {
    type ClientEvents = 'error' | 'close' | 'status';
  
    interface ClientOptions {
      autoplay?: boolean;
      currentTime?: number;
      activeTrackIds?: number[];
      customData?: any;
      media: {
        contentId: string;
        contentType: string;
        streamType: string;
        metadata: {
          metadataType: number;
          title: string;
          images: Array<{ url: string }>;
        };
      };
    }
  
    class Client {
        volume: number;
        stepInterval: number;
        muted: boolean;
  
        connect(host: string, callback: Function): void;
  
        on(event: ClientEvents, callback: Function): void;
  
        load(media: string, options: ClientOptions, callback: (error: string, status: unknown) => void): void;
  
        launch(media: DefaultMediaReceiver, callback: (error: string, player: DefaultMediaReceiver) => void): void;
  
        close(): void;
    }
  
    class DefaultMediaReceiver {}
  
  }
  