export const ArtistChip = ({item}: {item: object}) => {
  let image = false;
  let artist: {
    id: null,
  }

  async function mounted() {
    let artistId = this.item.id;
    if (typeof this.item.relationships == "object") {
      artistId = this.item.relationships.catalog.data[0].id;
    }
    app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/artists/${artistId}`).then((response) => {
      this.artist = response.data.data[0];
      this.image = true;
    });
  }
  function route() {
    app.appRoute(`artist/${this.artist.id}`);
  }

  return (
    <div id="artist-chip">
      <div
        className="artist-chip"
        clickself="route"
        tabindex="0">
        <div
          className="artist-chip__image"
          v-if="image"
          style={{ backgroundColor: "#" + (artist.attributes.artwork?.bgColor ?? "000") }}>
          <mediaitem-artwork
            v-if="artist.id != null"
            url="artist.attributes.artwork.url"
            size="80"></mediaitem-artwork>
        </div>
        <div
          className="artist-chip__image"
          v-else></div>
        <div className="artist-chip__name">
          <span>{item.attributes.name}</span>
        </div>
        <button
          click="$root.setArtistFavorite(artist.id, true)"
          title="Follow"
          v-if="!$root.followingArtist(artist.id)"
          className="artist-chip__follow codicon codicon-add"></button>
        <button
          click="$root.setArtistFavorite(artist.id, false)"
          title="Following"
          v-else
          className="artist-chip__follow codicon codicon-check"></button>
      </div>
    </div>
  );
};

export default ArtistChip;
