import { useEffect } from "react";
import MediaItemArtwork from "./mediaitem-artwork.jsx";

export const ArtistChip = ({ item }: { item: object }) => {
  let image = false;
  let artist = {
    id: null,
  };

  function mounted() {
    let artistId = item.id;
    if (typeof item.relationships === "object") {
      artistId = item.relationships.catalog.data[0].id;
    }
    app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/artists/${artistId}`).then((response) => {
      artist = response.data.data[0];
      image = true;
    });
  }

  useEffect(() => {
    mounted();
  });

  function route() {
    app.appRoute(`artist/${artist.id}`);
  }

  return (
    <div id={"artist-chip"}>
      <div
        className={"artist-chip"}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            route();
          }
        }}
        tabIndex={0}>
        {image ? (
          <div
            className={"artist-chip__image"}
            style={{ backgroundColor: "#" + (artist.attributes.artwork?.bgColor ?? "000") }}>
            {artist.id !== null && (
              <MediaItemArtwork
                url={artist.attributes.artwork.url}
                imagesize={"80"}
              />
            )}
          </div>
        ) : (
          <div className={"artist-chip__image"} />
        )}
        <div className={"artist-chip__name"}>
          <span>{item.attributes.name}</span>
        </div>
        {!$root.followingArtist(artist.id) ? (
          <button
            onClick={() => $root.setArtistFavorite(artist.id, true)}
            title={"Follow"}
            className={"artist-chip__follow codicon codicon-add"}
          />
        ) : (
          <button
            onClick={() => $root.setArtistFavorite(artist.id, false)}
            title={"Following"}
            className={"artist-chip__follow codicon codicon-check"}
          />
        )}
      </div>
    </div>
  );
};

export default ArtistChip;
