declare module "*.less" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.ttf" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.ogg" {
  const src: string;
  export default src;
}

declare module "*.wav" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

export {};
