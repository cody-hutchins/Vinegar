import { useEffect } from "react";
import MediaItemArtwork from "./mediaitem-artwork.jsx";

const ArtworkMaterial = ({ url, size = "32", images = "2" }: { url: string; size: string | number; images: string | number }) => {
  let src = "";
  function mounted() {
  }
  useEffect(() => {
    src = app.getMediaItemArtwork(url, size);
  }, []);
  return (
    <div id="artwork-material">
      <div className="artworkMaterial">
        <MediaItemArtwork
          url={src}
          size="500"
          v-for={image in images}
        />
      </div>
    </div>
  );
};

export default ArtworkMaterial;
