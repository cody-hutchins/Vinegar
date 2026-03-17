import MediaItemArtwork from "./mediaitem-artwork.jsx";

const MediaItemHrect = ({ item }: { item: MusicKit.MediaItem }) => {
  const app = this.$root;
  return (
    <div id={"mediaitem-hrect"}>
      <div
        onClick={() => app.playMediaItemById(item.attributes.playParams.id ?? item.id, item.attributes.playParams.kind ?? item.type, item.attributes.playParams.isLibrary ?? false, item.attributes.url)}
        className={"cd-mediaitem-hrect"}>
        <div className={"artwork"}>
          <MediaItemArtwork
            url={item.attributes.artwork ? item.attributes.artwork.url : ""}
            imagesize={"70"}
            type={item.type}
          />
        </div>
        <div className={"info-rect"}>
          <div className={"title text-overflow-elipsis"}>{item.attributes.name}</div>
          <div className={"subtitle text-overflow-elipsis"}>
            {item.type}
            {item.attributes.artistName && <>∙ {item.attributes.artistName}</>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaItemHrect;
