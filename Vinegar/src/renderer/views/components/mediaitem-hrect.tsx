import MediaItemArtwork from "./mediaitem-artwork.jsx";
type Item = { id: string; attributes: { trackNumber: string; genreNames: string[]; durationInMillis: number; playCount: string; url: string; artistName: string; contentRating: string; releaseDate: string; albumName: string; name: string; artwork: { url: string }; playParams: { id: string; kind: string; isLibrary: boolean } }; type: string };
const MediaItemHrect = ({ item }: { item: Item }) => {
  const app = this.$root;
  return (
    <div id={"mediaitem-hrect"}>
      <div
        onClick={() => app.playMediaItemById(item.attributes.playParams.id ?? item.id, item.attributes.playParams.kind ?? item.type, item.attributes.playParams.isLibrary ?? false, item.attributes.url)}
        className={"cd-mediaitem-hrect"}>
        <div className={"artwork"}>
          <MediaItemArtwork
            url={item.attributes.artwork ? item.attributes.artwork.url : ""}
            size={"70"}
            type={item.type}
          />
        </div>
        <div className={"info-rect"}>
          <div className={"title text-overflow-elipsis"}>{item.attributes.name}</div>
          <div className={"subtitle text-overflow-elipsis"}>
            {item.type}
            {item.attributes.artistName && <template>∙ {item.attributes.artistName}</template>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaItemHrect;
