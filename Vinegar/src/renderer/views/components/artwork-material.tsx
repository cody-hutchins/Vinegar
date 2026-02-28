export const Component = () => {
  Vue.component("artwork-material", {
    template: "#artwork-material",
    data: function () {
      return {
        src: "",
      };
    },
    mounted() {
      this.src = app.getMediaItemArtwork(this.url, this.size);
    },
    props: {
      url: {
        type: String,
        required: true,
      },
      size: {
        type: [String, Number],
        required: false,
        default: "32",
      },
      images: {
        type: [String, Number],
        required: false,
        default: "2",
      },
    },
    methods: {},
  });
  return (
    <div id="artwork-material">
      <div className="artworkMaterial">
        <mediaitem-artwork
          url="src"
          size="500"
          v-for="image in images"
        />
      </div>
    </div>
  );
};
