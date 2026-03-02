export const Component = ({ item }: { item: object }) => {
  const app = this.$root;
  return (
    <div id="mediaitem-hrect">
      <template>
        <div
          click="app.playMediaItemById(item.attributes.playParams.id ?? item.id, item.attributes.playParams.kind ?? item.type, item.attributes.playParams.isLibrary ?? false, item.attributes.url)"
          className="cd-mediaitem-hrect">
          <div className="artwork">
            <mediaitem-artwork
              url="item.attributes.artwork ? item.attributes.artwork.url : ''"
              size="70"
              type="item.type"></mediaitem-artwork>
          </div>
          <div className="info-rect">
            <div className="title text-overflow-elipsis">{item.attributes.name}</div>
            <div className="subtitle text-overflow-elipsis">
              {item.type}
              <template v-if="item.attributes.artistName">∙ {item.attributes.artistName}</template>
            </div>
          </div>
        </div>
      </template>
    </div>
  );
};
