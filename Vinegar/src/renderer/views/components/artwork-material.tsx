export const Component = ({url, size, images}: {url: string, size: (string | number) = "32", images: (string | number) = "2"}) => {
  let src = '';
  mounted() {
    src = app.getMediaItemArtwork(url, size);
  };
  return (
    <div id="artwork-material">
      <div className="artworkMaterial">
        <mediaitem-artwork
          url={src}
          size="500"
          v-for={image in images}
        />
      </div>
    </div>
  );
};
