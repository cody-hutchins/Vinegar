import { StateCreator } from "zustand";
import { asyncForEach, notyf } from "../main/helpers.js";
import { CiderCache } from "../main/cidercache.js";
import { MusicKitTools } from "../main/musickittools.js";
import { GeneralState, LibraryState } from "./store.js";

type LibraryStateCreator = StateCreator<GeneralState, [["zustand/immer", never], never], [], { library: LibraryState }>;

export const createLibrarySlice: LibraryStateCreator = (set, get) => ({
  library: {
    selectedMediaItems: [],
    backgroundNotification: {
      show: false,
      message: "",
      total: 0,
      progress: 0,
    },
    songs: {
      sortingOptions: {
        albumName: "0",
        artistName: "0",
        name: "0",
        genre: "0",
        releaseDate: "0",
        durationInMillis: "0",
        dateAdded: "0",
      },
      sorting: "name",
      sortOrder: "asc",
      listing: [],
      meta: { total: 0, progress: 0 },
      search: "",
      displayListing: [],
      downloadState: 0, // 0 = not started, 1 = in progress, 2 = complete, 3 = empty library
    },
    albums: {
      sortingOptions: {
        artistName: "0",
        name: "0",
        genre: "0",
        releaseDate: "0",
      },
      viewAs: "covers",
      sorting: "dateAdded", // [0] = recentlyadded page, [1] = albums page
      sortOrder: "desc", // [0] = recentlyadded page, [1] = albums page
      listing: [],
      meta: { total: 0, progress: 0 },
      search: "",
      displayListing: [],
      downloadState: 0, // 0 = not started, 1 = in progress, 2 = complete, 3 = empty library
    },
    artists: {
      sortingOptions: {
        artistName: "0",
        name: "0",
        genre: "0",
        releaseDate: "0",
      },
      viewAs: "covers",
      sorting: "dateAdded", // [0] = recentlyadded page, [1] = albums page
      sortOrder: "desc", // [0] = recentlyadded page, [1] = albums page
      listing: [],
      meta: { total: 0, progress: 0 },
      search: "",
      displayListing: [],
      downloadState: 0, // 0 = not started, 1 = in progress, 2 = complete, 3 = empty library
    },
    playlists: {
      listing: [],
      details: {},
      loadingState: 0, // 0 loading, 1 loaded, 2 error
      id: "",
      trackMapping: {},
    },
    socialBadges: {
      badgeMap: {},
      version: "",
      mediaItems: [],
      mediaItemDLState: 0, // 0 = not started, 1 = in progress, 2 = complete
    },
    localsongs: [],
    // Actually fills the store doesn't return
    getLibrarySongs: () =>
      set((state) => {
        state.app.mkapi("songs", true, "", { limit: 100, l: state.app.mklang, includeResponseMeta: !0 }).then((response) => {
          state.library.songs.listing = response.data.data;
          state.library.songs.meta = response.data.meta;
        });
      }),
    getLibraryGenres: () => {
      const genres: string[] = [];
      get().library.songs.listing.forEach((item) => {
        item.attributes.genreNames.forEach((genre) => {
          if (!genres.includes(genre)) {
            genres.push(genre);
          }
        });
      });
      return genres;
    },
    // Actually fills the store doesn't return
    getLibraryAlbums: () =>
      set(async (state) => {
        state.app.mk.api("albums", true, "", { limit: 100, l: state.app.mklang }, { includeResponseMeta: !0 }).then((response) => {
          state.library.albums.listing = response.data.data;
          state.library.albums.meta = response.data.meta;
        });
      }),
    isInLibrary(playParams?: { isLibrary: boolean; catalogId: string; id: string }) {
      let id = "";
      // ugly code to check if current playback item is in library
      if (typeof playParams === "undefined") {
        return true;
      }
      if (playParams["isLibrary"]) {
        return true;
      } else if (playParams["catalogId"]) {
        id = playParams["catalogId"];
      } else if (playParams["id"]) {
        id = playParams["id"];
      }
      const found = get().library.songs.listing.filter((item) => {
        if (item["attributes"]) {
          if (item["attributes"]["playParams"] && item["attributes"]["playParams"]["catalogId"] === id) {
            return item;
          }
        }
      });
      if (found.length !== 0) {
        return true;
      } else {
        return false;
      }
    },
    searchLibrarySongs: () =>
      set((state) => {
        const prefs = get().cfg.libraryPrefs.songs;

        function sortSongs() {
          // sort get().songs.displayListing by song.attributes[get().songs.sorting] in descending or ascending order based on alphabetical order and numeric order
          // check if song.attributes[get().songs.sorting] is a number and if so, sort by number if not, sort by alphabetical order ignoring case
          state.library.songs.displayListing.sort((a, b) => {
            if (!a.attributes && !b.attributes) return 0;
            else if (!a.attributes) return -1;
            else if (!b.attributes) return 1;
            let aa = a.attributes[prefs.sort];
            let bb = b.attributes[prefs.sort];
            if (prefs.sort === "genre") {
              aa = a.attributes!.genreNames[0];
              bb = b.attributes!.genreNames[0];
            } else if (prefs.sort === "dateAdded") {
              aa = a.relationships?.albums?.data[0]?.attributes?.dateAdded;
              bb = b.relationships?.albums?.data[0]?.attributes?.dateAdded;
              // if dateAdded is equal, an entire album was added at once, so sorting by track number (in reverse order because lower track number should be above in descending mode)
              if (aa === bb) {
                aa = b.attributes.trackNumber;
                bb = a.attributes.trackNumber;
              }
            } else if (prefs.sort === "artistName") {
              if (a.relationships?.artists?.data[0]?.id === b.relationships?.artists?.data[0]?.id) {
                aa = a.attributes.albumName;
                bb = b.attributes.albumName;
              }
              if (a.relationships?.albums?.data[0]?.id === b.relationships?.albums?.data[0]?.id) {
                aa = a.attributes.trackNumber;
                bb = b.attributes.trackNumber;
              }
            } else if (prefs.sort === "albumName") {
              if (a.relationships?.albums?.data[0]?.id === b.relationships?.albums?.data[0]?.id) {
                aa = a.attributes.trackNumber;
                bb = b.attributes.trackNumber;
              }
            }
            if (aa === null) {
              aa = "";
            }
            if (bb === null) {
              bb = "";
            }
            if (prefs.sortOrder === "asc") {
              if (aa.toString().match(/^\d+$/) && bb.toString().match(/^\d+$/)) {
                return aa - bb;
              } else {
                return aa.toString().toLowerCase().localeCompare(bb.toString().toLowerCase());
              }
            } else if (prefs.sortOrder === "desc") {
              if (aa.toString().match(/^\d+$/) && bb.toString().match(/^\d+$/)) {
                return bb - aa;
              } else {
                return bb.toString().toLowerCase().localeCompare(aa.toString().toLowerCase());
              }
            }
          });
        }

        if (get().library.songs.search === "") {
          state.library.songs.displayListing = get().library.songs.listing;
          sortSongs();
        } else {
          state.library.songs.displayListing = get().library.songs.listing.filter((item) => {
            let itemName = item.attributes!.name.toLowerCase();
            let searchTerm = get().library.songs.search.toLowerCase();
            let artistName = "";
            let albumName = "";
            if (item.attributes!.artistName !== null) {
              artistName = item.attributes!.artistName.toLowerCase();
            }
            if (item.attributes!.albumName !== null) {
              albumName = item.attributes!.albumName.toLowerCase();
            }

            // remove any non-alphanumeric characters and spaces from search term and item name
            searchTerm = searchTerm.replace(/[^\p{L}\p{N} ]/gu, "");
            itemName = itemName.replace(/[^\p{L}\p{N} ]/gu, "");
            artistName = artistName.replace(/[^\p{L}\p{N} ]/gu, "");
            albumName = albumName.replace(/[^\p{L}\p{N} ]/gu, "");

            if (itemName.includes(searchTerm) || artistName.includes(searchTerm) || albumName.includes(searchTerm)) {
              return item;
            }
          });
          sortSongs();
        }
      }),
    // Actually sets the album sorting from the config
    getAlbumSort: () =>
      set((state) => {
        state.library.albums.sortOrder = state.cfg.libraryPrefs.albums.sortOrder;
        state.library.albums.sorting = state.cfg.libraryPrefs.albums.sort;
      }),
    // make a copy of searchLibrarySongs except use Albums instead of Songs
    searchLibraryAlbums: (index: number) =>
      set((state) => {
        function sortAlbums() {
          // sort get().library.albums.displayListing by album.attributes[get().library.albums.sorting[index]] in descending or ascending order based on alphabetical order and numeric order
          // check if album.attributes[get().library.albums.sorting[index]] is a number and if so, sort by number if not, sort by alphabetical order ignoring case
          state.library.albums.displayListing.sort((a, b) => {
            let aa = a.attributes[state.library.albums.sorting[index]];
            let bb = b.attributes[state.library.albums.sorting[index]];
            if (state.library.albums.sorting[index] === "genre") {
              aa = a.attributes.genreNames[0];
              bb = b.attributes.genreNames[0];
            } else if (state.library.albums.sorting[index] === "dateAdded") {
              aa = a.attributes?.dateAdded;
              bb = b.attributes?.dateAdded;
            }
            if (aa === null) {
              aa = "";
            }
            if (bb === null) {
              bb = "";
            }
            if (state.library.albums.sortOrder[index] === "asc") {
              if (aa.toString().match(/^\d+$/) && bb.toString().match(/^\d+$/)) {
                return aa - bb;
              } else {
                return aa.toString().toLowerCase().localeCompare(bb.toString().toLowerCase());
              }
            } else if (state.library.albums.sortOrder[index] === "desc") {
              if (aa.toString().match(/^\d+$/) && bb.toString().match(/^\d+$/)) {
                return bb - aa;
              } else {
                return bb.toString().toLowerCase().localeCompare(aa.toString().toLowerCase());
              }
            }
          });
        }

        if (state.library.albums.search === "") {
          state.library.albums.displayListing = state.library.albums.listing;
          sortAlbums();
        } else {
          state.library.albums.displayListing = state.library.albums.listing.filter((item) => {
            let itemName = item.attributes.name.toLowerCase();
            let searchTerm = state.library.albums.search.toLowerCase();
            let artistName = "";
            let albumName = "";
            if (item.attributes.artistName !== null) {
              artistName = item.attributes.artistName.toLowerCase();
            }
            if (item.attributes.albumName !== null) {
              albumName = item.attributes.albumName.toLowerCase();
            }

            // remove any non-alphanumeric characters and spaces from search term and item name
            searchTerm = searchTerm.replace(/[^\p{L}\p{N} ]/gu, "");
            itemName = itemName.replace(/[^\p{L}\p{N} ]/gu, "");
            artistName = artistName.replace(/[^\p{L}\p{N} ]/gu, "");
            albumName = albumName.replace(/[^\p{L}\p{N} ]/gu, "");

            if (itemName.includes(searchTerm) || artistName.includes(searchTerm) || albumName.includes(searchTerm)) {
              return item;
            }
          });
          sortAlbums();
        }
      }),
    // make a copy of searchLibrarySongs except use Albums instead of Songs
    searchLibraryArtists: (index) =>
      set((state) => {
        function sortArtists() {
          // sort get().albums.displayListing by album.attributes[get().albums.sorting[index]] in descending or ascending order based on alphabetical order and numeric order
          // check if album.attributes[get().albums.sorting[index]] is a number and if so, sort by number if not, sort by alphabetical order ignoring case
          state.library.artists.displayListing.sort((a, b) => {
            let aa = a.attributes[state.library.artists.sorting[index]];
            let bb = b.attributes[state.library.artists.sorting[index]];
            if (state.library.artists.sorting[index] === "genre") {
              aa = a.attributes.genreNames[0];
              bb = b.attributes.genreNames[0];
            }
            if (aa === null) {
              aa = "";
            }
            if (bb === null) {
              bb = "";
            }
            if (state.library.artists.sortOrder[index] === "asc") {
              if (aa.toString().match(/^\d+$/) && bb.toString().match(/^\d+$/)) {
                return aa - bb;
              } else {
                return aa.toString().toLowerCase().localeCompare(bb.toString().toLowerCase());
              }
            } else if (state.library.artists.sortOrder[index] === "desc") {
              if (aa.toString().match(/^\d+$/) && bb.toString().match(/^\d+$/)) {
                return bb - aa;
              } else {
                return bb.toString().toLowerCase().localeCompare(aa.toString().toLowerCase());
              }
            }
          });
        }

        if (state.library.artists.search === "") {
          state.library.artists.displayListing = state.library.artists.listing;
          sortArtists();
        } else {
          state.library.artists.displayListing = state.library.artists.listing.filter((item) => {
            let itemName = item.attributes!.name.toLowerCase();
            let searchTerm = state.library.artists.search.toLowerCase();
            const artistName = "";
            const albumName = "";
            // if (item.attributes.artistName !== null) {
            //     artistName = item.attributes.artistName.toLowerCase()
            // }
            // if (item.attributes.albumName !== null) {
            //     albumName = item.attributes.albumName.toLowerCase()
            // }

            // remove any non-alphanumeric characters and spaces from search term and item name
            searchTerm = searchTerm.replace(/[^\p{L}\p{N} ]/gu, "");
            itemName = itemName.replace(/[^\p{L}\p{N} ]/gu, "");

            if (itemName.includes(searchTerm) || artistName.includes(searchTerm) || albumName.includes(searchTerm)) {
              return item;
            }
          });
          sortArtists();
        }
      }),
    getLibrarySongsFull: async (force = false) =>
      set((state) => {
        let library = [];
        const cacheId = "library-songs";
        const downloaded = null;
        state.ui.resetRecentlyAdded();
        if (state.library.songs.downloadState === 2 && !force) {
          return;
        }
        if (state.library.songs.downloadState === 1) {
          return;
        }
        const librarySongs = await CiderCache.getCache(cacheId);
        if (librarySongs) {
          state.library.songs.listing.data = librarySongs;
          state.library.searchLibrarySongs();
        }
        if (state.app.songstest) {
          return;
        }
        state.library.songs.downloadState = 1;
        state.library.backgroundNotification.show = true;
        state.library.backgroundNotification.message = this.getLz("notification.updatingLibrarySongs");

        library = await MusicKitTools.v3Continuous({
          href: `/v1/me/library/songs/`,
          options: {
            "include[library-songs]": "catalog,artists,albums",
            "fields[artists]": "name,url,id",
            "fields[albums]": "name,url,id",
            platform: "web",
            "fields[catalog]": "artistUrl,albumUrl",
            "fields[songs]": "artistName,artistUrl,artwork,contentRating,editorialArtwork,name,playParams,releaseDate,url",
            limit: 100,
            l: state.app.mklang,
          },
          onProgress: (data) => {
            console.debug(`${data.total}/${data.response.data.meta.total}`);
            state.library.backgroundNotification.show = true;
            state.library.backgroundNotification.message = this.getLz("notification.updatingLibrarySongs");
            state.library.backgroundNotification.total = data.response.data.meta.total;
            state.library.backgroundNotification.progress = data.total;
          },
          onSuccess: () => {},
        });

        state.library.songs.listing = library;
        state.library.songs.downloadState = 2;
        state.library.backgroundNotification.show = false;
        state.library.searchLibrarySongs();
        CiderCache.putCache(cacheId, library);
        console.debug("Done!");

        return;
      }),
    // copy the getLibrarySongsFull function except change Songs to Albums
    getLibraryAlbumsFull: async (force = false, index) =>
      set((state) => {
        let library = [];
        const cacheId = "library-albums";
        let downloaded = null;
        if ((state.library.albums.downloadState === 2 || state.library.albums.downloadState === 1) && !force) {
          return;
        }
        const libraryAlbums = await CiderCache.getCache(cacheId);
        if (libraryAlbums) {
          state.library.albums.listing = libraryAlbums;
          state.library.searchLibraryAlbums(index);
        }
        if (state.app.songstest) {
          return;
        }
        state.library.albums.downloadState = 1;
        state.library.backgroundNotification.show = true;
        state.library.backgroundNotification.message = this.getLz("notification.updatingLibraryAlbums");

        function downloadChunk() {
          state.library.albums.downloadState = 1;
          const params = {
            "include[library-albums]": "catalog,artists,albums",
            "fields[artists]": "name,url,id",
            // "fields[albums]": "name,url,id",
            platform: "web",
            "fields[catalog]": "artistUrl,albumUrl",
            "fields[albums]": "artistName,artistUrl,artwork,contentRating,editorialArtwork,name,playParams,releaseDate,url",
            limit: 100,
            l: state.app.mklang,
          };
          const safeparams = {
            platform: "web",
            limit: "60",
            "include[library-albums]": "artists",
            "include[library-artists]": "catalog",
            "include[albums]": "artists",
            "fields[artists]": "name,url",
            "fields[albums]": "artistName,artistUrl,artwork,contentRating,editorialArtwork,name,playParams,releaseDate,url",
            includeOnly: "catalog,artists",
          };
          if (downloaded === null) {
            state.app.mk.api
              .music(`/v1/me/library/albums/`, params)
              .then((response) => {
                processChunk(response.data);
              })
              .catch((error) => {
                console.debug("safe loading");
                state.app.mk.api
                  .music(`/v1/me/library/albums/`, safeparams)
                  .then((response) => {
                    processChunk(response.data);
                  })
                  .catch((error) => {
                    console.log("safe loading failed", error);
                    state.library.albums.downloadState = 2;
                    state.library.backgroundNotification.show = false;
                  });
              });
          } else {
            if (downloaded.next !== null) {
              state.app.mk.api
                .music(downloaded.next, params)
                .then((response) => {
                  processChunk(response.data);
                })
                .catch((error) => {
                  console.debug("safe loading");
                  state.app.mk.api
                    .music(downloaded.next, safeparams)
                    .then((response) => {
                      processChunk(response.data);
                    })
                    .catch((error) => {
                      console.log("safe loading failed", error);
                      state.library.albums.downloadState = 2;
                      state.library.backgroundNotification.show = false;
                    });
                });
            } else {
              console.debug("Download next", downloaded.next);
            }
          }
        }

        function processChunk(response) {
          downloaded = response;
          library = library.concat(downloaded.data);
          state.library.backgroundNotification.show = true;
          state.library.backgroundNotification.message = this.getLz("notification.updatingLibraryAlbums");
          state.library.backgroundNotification.total = downloaded.meta.total;
          state.library.backgroundNotification.progress = library.length;
          if (downloaded.meta.total === 0) {
            state.library.albums.downloadState = 3;
            return;
          }
          if (typeof downloaded.next === "undefined") {
            console.debug("downloaded.next is undefined");
            state.library.albums.listing = library;
            state.library.albums.downloadState = 2;
            state.library.backgroundNotification.show = false;
            CiderCache.putCache(cacheId, library);
            state.library.searchLibraryAlbums(index);
          }
          if (downloaded.meta.total > library.length || typeof downloaded.meta.next !== "undefined") {
            console.debug(`downloading next chunk - ${library.length} albums so far`);
            downloadChunk();
          } else {
            state.library.albums.listing = library;
            state.library.albums.downloadState = 2;
            state.library.backgroundNotification.show = false;
            CiderCache.putCache(cacheId, library);
            state.library.searchLibraryAlbums(index);
            // console.log(library)
          }
        }

        downloadChunk();
      }),
    // copy the getLibrarySongsFull function except change Songs to Albums
    getLibraryArtistsFull: (force = false, index) =>
      set((state) => {
        let library = [];
        const cacheId = "library-artists";
        let downloaded = null;
        if ((state.library.artists.downloadState === 2 || state.library.artists.downloadState === 1) && !force) {
          return;
        }
        const libraryArtists = await CiderCache.getCache(cacheId);
        if (libraryArtists) {
          state.library.artists.listing = libraryArtists;
          state.library.searchLibraryArtists(index);
        }
        if (state.app.songstest) {
          return;
        }
        state.library.artists.downloadState = 1;
        state.library.backgroundNotification.show = true;
        state.library.backgroundNotification.message = this.getLz("notification.updatingLibraryArtists");

        function downloadChunk() {
          state.library.artists.downloadState = 1;
          const params = {
            include: "catalog",
            // "include[library-artists]": "catalog,artists,albums",
            // "fields[artists]": "name,url,id",
            // "fields[albums]": "name,url,id",
            platform: "web",
            // "fields[catalog]": "artistUrl,albumUrl",
            // "fields[artists]": "artistName,artistUrl,artwork,contentRating,editorialArtwork,name,playParams,releaseDate,url",
            limit: 100,
            l: state.app.mklang,
          };
          const safeparams = {
            include: "catalog",
            platform: "web",
            limit: 50,
          };
          if (downloaded === null) {
            state.app.mk.api
              .music(`/v1/me/library/artists/`, params)
              .then((response) => {
                processChunk(response.data);
              })
              .catch((error) => {
                console.debug("safe loading");
                state.app.mk.api
                  .music(`/v1/me/library/artists/`, safeparams)
                  .then((response) => {
                    processChunk(response.data);
                  })
                  .catch((error) => {
                    console.log("safe loading failed", error);
                    state.library.artists.downloadState = 2;
                    state.library.backgroundNotification.show = false;
                  });
              });
          } else {
            if (downloaded.next !== null) {
              state.app.mk.api
                .music(downloaded.next, params)
                .then((response) => {
                  processChunk(response.data);
                })
                .catch((error) => {
                  console.log("safe loading");
                  state.app.mk.api
                    .music(downloaded.next, safeparams)
                    .then((response) => {
                      processChunk(response.data);
                    })
                    .catch((error) => {
                      console.log("safe loading failed", error);
                      state.library.artists.downloadState = 2;
                      state.library.backgroundNotification.show = false;
                    });
                });
            } else {
              console.log("Download next", downloaded.next);
            }
          }
        }

        function processChunk(response) {
          downloaded = response;
          library = library.concat(downloaded.data);
          state.library.backgroundNotification.show = true;
          state.library.backgroundNotification.message = this.getLz("notification.updatingLibraryArtists");
          state.library.backgroundNotification.total = downloaded.meta.total;
          state.library.backgroundNotification.progress = library.length;
          if (downloaded.meta.total === 0) {
            state.library.albums.downloadState = 3;
            return;
          }
          if (typeof downloaded.next === "undefined") {
            console.log("downloaded.next is undefined");
            state.library.artists.listing = library;
            state.library.artists.downloadState = 2;
            state.library.artists.show = false;
            CiderCache.putCache(cacheId, library);
            state.library.searchLibraryArtists(index);
          }
          if (downloaded.meta.total > library.length || typeof downloaded.meta.next !== "undefined") {
            console.log(`downloading next chunk - ${library.length} artists so far`);
            downloadChunk();
          } else {
            state.library.artists.listing = library;
            state.library.artists.downloadState = 2;
            state.library.backgroundNotification.show = false;
            CiderCache.putCache(cacheId, library);
            state.library.searchLibraryArtists(index);
            // console.log(library)
          }
        }

        downloadChunk();
      }),
    addToLibrary: (id) =>
      set((state) => {
        state.app.mk.addToLibrary(id).then((data) => {
          state.library.getLibrarySongsFull(true);
        });
        notyf.success(this.getLz("action.addToLibrary.success"));
      }),
    removeFromLibrary: (kind: string, id: string) =>
      set((state) => {
        const truekind = !kind.endsWith("s") ? kind + "s" : kind;
        state.app.mk.api
          .music(`v1/me/library/${truekind}/${id.toString()}`, {
            fetchOptions: {
              method: "DELETE",
            },
          })
          .then(() => {
            state.library.getLibrarySongsFull(true);
          });
        notyf.success(this.getLz("action.removeFromLibrary.success"));
      }),
    async inLibrary(items: MusicKit.MediaItem[] = []) {
      const types = [];

      for (const item of items) {
        let type = item.type;
        if (type.slice(-1) !== "s") {
          type += "s";
        }
        type = type.replace("library-", "");
        const id = item.attributes.playParams?.catalogId ?? item.attributes.playParams.id ?? item.id;

        const index = types.findIndex(function (_type) {
          return type.type === _type;
        }, type);
        if (index === -1) {
          types.push({ type: type, id: [id] });
        } else {
          types[index].id.push(id);
        }
      }
      let types2 = types.map(function (item) {
        return {
          [`ids[${item.type}]`]: [item.id],
        };
      });
      types2 = types2.reduce(function (result, item) {
        const key = Object.keys(item)[0]; //first property: a, b, c
        result[key] = item[key];
        return result;
      }, {});
      return (
        await get().app.mk.api.music(`/v1/catalog/${state.app.mk.storefrontId}`, {
          ...{
            "omit[resource]": "autos",
            relate: "library",
            fields: "inLibrary",
          },
          ...types2,
        })
      ).data.data;
    },

    addSelectedToNewPlaylist: () =>
      set(async (state) => {
        let pl_items: { id: string; type: string }[] = [];
        for (let i = 0; i < state.library.selectedMediaItems.length; i++) {
          if (state.library.selectedMediaItems[i].kind === "song" || state.library.selectedMediaItems[i].kind === "songs") {
            state.library.selectedMediaItems[i].kind = "songs";
            pl_items.push({
              id: state.library.selectedMediaItems[i].id,
              type: state.library.selectedMediaItems[i].kind,
            });
          } else if (
            (state.library.selectedMediaItems[i].kind === "album" || state.library.selectedMediaItems[i].kind === "albums") &&
            !state.library.selectedMediaItems[i].isLibrary
          ) {
            state.library.selectedMediaItems[i].kind = "albums";
            const res = await state.app.mk.api.music(
              `/v1/catalog/${state.app.mk.storefrontId}/albums/${state.library.selectedMediaItems[i].id}/tracks`,
            );
            const ids = res.data.data.map(function (i) {
              return { id: i.id, type: i.type };
            });
            pl_items = pl_items.concat(ids);
          } else if (
            state.library.selectedMediaItems[i].kind === "library-song" ||
            state.library.selectedMediaItems[i].kind === "library-songs"
          ) {
            state.library.selectedMediaItems[i].kind = "library-songs";
            pl_items.push({
              id: state.library.selectedMediaItems[i].id,
              type: state.library.selectedMediaItems[i].kind,
            });
          } else if (
            state.library.selectedMediaItems[i].kind === "library-album" ||
            state.library.selectedMediaItems[i].kind === "library-albums" ||
            (state.library.selectedMediaItems[i].kind === "album" && state.library.selectedMediaItems[i].isLibrary)
          ) {
            state.library.selectedMediaItems[i].kind = "library-albums";
            const res = await state.app.mk.api.music(`/v1/me/library/albums/${state.library.selectedMediaItems[i].id}/tracks`);
            const ids = res.data.data.map(function (i) {
              return { id: i.id, type: i.type };
            });
            pl_items = pl_items.concat(ids);
          } else {
            pl_items.push({
              id: state.library.selectedMediaItems[i].id,
              type: state.library.selectedMediaItems[i].kind,
            });
          }
        }
        state.ui.modals.addToPlaylist = false;
        state.library.newPlaylist(this.getLz("term.newPlaylist"), pl_items);
      }),
    addSelectedToPlaylist: async (playlist_id) =>
      set((state) => {
        let pl_items: { id: string; type: string }[] = [];
        const song_ids = [];
        for (let i = 0; i < state.library.selectedMediaItems.length; i++) {
          if (state.library.selectedMediaItems[i].kind === "song" || state.library.selectedMediaItems[i].kind === "songs") {
            state.library.selectedMediaItems[i].kind = "songs";
            pl_items.push({
              id: state.library.selectedMediaItems[i].id,
              type: state.library.selectedMediaItems[i].kind,
            });
            song_ids.push(state.library.selectedMediaItems[i].id);
          } else if (
            (state.library.selectedMediaItems[i].kind === "album" || state.library.selectedMediaItems[i].kind === "albums") &&
            !state.library.selectedMediaItems[i].isLibrary
          ) {
            state.library.selectedMediaItems[i].kind = "albums";
            const res = await state.app.mk.api.music(
              `/v1/catalog/${state.app.mk.storefrontId}/albums/${state.library.selectedMediaItems[i].id}/tracks`,
            );
            const ids = res.data.data.map(function (i) {
              return { id: i.id, type: i.type };
            });
            pl_items = pl_items.concat(ids);
            song_ids.push(...ids.map((id) => id.id));
          } else if (
            state.library.selectedMediaItems[i].kind === "library-song" ||
            state.library.selectedMediaItems[i].kind === "library-songs"
          ) {
            state.library.selectedMediaItems[i].kind = "library-songs";
            pl_items.push({
              id: state.library.selectedMediaItems[i].id,
              type: state.library.selectedMediaItems[i].kind,
            });
            song_ids.push(state.library.selectedMediaItems[i].id);
          } else if (
            state.library.selectedMediaItems[i].kind === "library-album" ||
            state.library.selectedMediaItems[i].kind === "library-albums" ||
            (state.library.selectedMediaItems[i].kind === "album" && state.library.selectedMediaItems[i].isLibrary)
          ) {
            state.library.selectedMediaItems[i].kind = "library-albums";
            const res = await state.app.mk.api.music(`/v1/me/library/albums/${state.library.selectedMediaItems[i].id}/tracks`);
            const ids = res.data.data.map(function (i) {
              return { id: i.id, type: i.type };
            });
            pl_items = pl_items.concat(ids);
            song_ids.push(...ids.map((id) => id.id));
          } else {
            pl_items.push({
              id: state.library.selectedMediaItems[i].id,
              type: state.library.selectedMediaItems[i].kind,
            });
            song_ids.push(state.library.selectedMediaItems[i].id);
          }
        }
        state.ui.modals.addToPlaylist = false;

        if (await state.app.isSongInPlaylist(song_ids, playlist_id)) {
          state.app.confirm(state.app.getLz("action.addToPlaylist.duplicate"), (result) => {
            if (result) {
              state.library.addToPlaylist(playlist_id, pl_items);
            }
          });
        } else {
          state.library.addToPlaylist(playlist_id, pl_items);
        }
      }),
    async isSongInPlaylist(song_ids: number[], playlist_id: string) {
      const playlistTracks = (
        await get().app.mk.api.music(`/v1/me/library/playlists/${playlist_id}/tracks`, {
          platform: "web",
          l: get().app.mklang,
        })
      ).data?.data;

      return playlistTracks.some((track) => song_ids.includes(track.id));
    },
    addToPlaylist(pid, pitems) {
      get()
        .app.mk.api.music(`/v1/me/library/playlists/${pid}/tracks`, {
          fetchOptions: {
            method: "POST",
            body: JSON.stringify({
              data: pitems,
            }),
          },
        })
        .then(() => {
          if (get().ui.page === "playlist_" + pid) {
            get().library.getPlaylistFromID(get().ui.showingPlaylist.id, true);
          }
        });
    },
    select_removeMediaItem(id) {
      get()
        .library.selectedMediaItems.filter((item) => item.guid === id)
        .forEach((item) => {
          get().library.selectedMediaItems.splice(get().library.selectedMediaItems.indexOf(item), 1);
        });
    },
    select_hasMediaItem(id) {
      const found = get().library.selectedMediaItems.find((item) => item.guid === id);
      if (found) {
        return true;
      } else {
        return false;
      }
    },
    select_selectMediaItem: (id, kind, index, guid, library) =>
      set((state) => {
        if (!get().library.select_hasMediaItem(guid)) {
          state.library.selectedMediaItems.push({
            id: id,
            kind: kind,
            index: index,
            guid: guid,
            isLibrary: library,
          });
        }
      }),
    getPlaylistFolderChildren(id) {
      return get().library.playlists.listing.filter((playlist) => {
        if (playlist.parent === id) {
          return playlist;
        }
      });
    },
    async getPlaylistFromID(id, transient = false) {
      const params = {
        include: "tracks",
        platform: "web",
        "include[library-playlists]": "catalog,tracks",
        "fields[playlists]": "curatorName,playlistType,name,artwork,url,playParams",
        "include[library-songs]": "catalog,artists,albums,playParams,name,artwork,url",
        "fields[catalog]": "artistUrl,albumUrl,url",
        "fields[songs]": "artistUrl,albumUrl,playParams,name,artwork,url,artistName,albumName,durationInMillis",
        l: get().app.mklang,
      };
      if (!transient) {
        get().library.playlists.loadingState = 0;
      }
      get()
        .app.mk.api.music(`/v1/me/library/playlists/${id}`, params)
        .then((res) => {
          get().library.getPlaylistContinuous(res, transient);
        })
        .catch((e) => {
          console.debug(e);
          try {
            get()
              .app.mk.api.music(`/v1/catalog/${get().app.mk.storefrontId}/playlists/${id}`, params)
              .then((res) => {
                get().library.getPlaylistContinuous(res, transient);
              });
          } catch (err) {
            console.debug(err);
          }
        });
    },
    async getArtistFromID(id) {
      const artistData = await get().app.mkapi("artists", false, id, {
        views:
          "featured-release,full-albums,appears-on-albums,featured-albums,featured-on-albums,singles,compilation-albums,live-albums,latest-release,top-music-videos,similar-artists,top-songs,playlists,more-to-hear,more-to-see",
        extend: "centeredFullscreenBackground,artistBio,bornOrFormed,editorialArtwork,editorialVideo,isGroup,origin,hero",
        "extend[playlists]": "trackCount",
        "include[songs]": "albums",
        "fields[albums]":
          "artistName,artistUrl,artwork,contentRating,editorialArtwork,editorialVideo,name,playParams,releaseDate,url,trackCount",
        "limit[artists:top-songs]": 20,
        "art[url]": "f",
        l: get().app.mklang,
        includeResponseMeta: !0,
      });
      console.debug(artistData.data.data[0]);
      set((state) => {
        state.ui.artistPage.data = artistData.data.data[0];
        state.ui.page = "artist-page";
      });
    },
    newPlaylist(name = this.getLz("term.newPlaylist"), tracks: string[] = []) {
      const request: Record<string, any> = {
        name: name,
      };
      if (tracks.length > 0) {
        request.tracks = tracks;
      }
      get()
        .app.mk.api.music(`/v1/me/library/playlists`, {
          fetchOptions: {
            method: "POST",
            body: JSON.stringify({
              attributes: { name: name },
              relationships: {
                tracks: { data: tracks },
              },
            }),
          },
        })
        .then((res) => {
          res = res.data.data[0];
          console.debug(res);
          get().app.appRoute(`playlist_` + res.id);
          get().ui.showingPlaylist = [];
          get().library.getPlaylistFromID(get().app.page.substring(9), true);
          get().library.playlists.listing.push({
            id: res.id,
            attributes: {
              name: name,
            },
            parent: "p.playlistsroot",
          });
          get().library.sortPlaylists();
          setTimeout(() => {
            get().library.refreshPlaylists(false, false);
          }, 8000);
        });
    },
    deletePlaylist(id: string) {
      get().app.confirm(this.getLz("term.deletePlaylist"), (ok) => {
        if (ok) {
          get()
            .app.mk.api.music(`/v1/me/library/playlists/${id}`, {
              fetchOptions: {
                method: "DELETE",
              },
            })
            .then(() => {
              // remove this playlist from playlists.listing if it exists
              const found = get().library.playlists.listing.find((item) => item.id === id);
              if (found) {
                get().library.playlists.listing.splice(get().library.playlists.listing.indexOf(found), 1);
              }
              setTimeout(() => {
                get().library.refreshPlaylists(false, false);
              }, 8000);
            });
        }
      });
    },

    async getPlaylistContinuous(response: MusicKit.Playlists, transient = false) {
      response = response.data.data[0];
      const playlistId = response.id;
      get().library.playlists.loadingState = !transient ? 0 : 1;
      get().ui.showingPlaylist = response;
      if (!response.relationships?.tracks?.next) {
        get().library.playlists.loadingState = 1;
        return;
      }

      function getPlaylistTracks(next: string) {
        get().app.apiCall(get().app.musicBaseUrl + next, (res) => {
          if (get().ui.showingPlaylist.id !== playlistId) {
            return;
          }
          get().ui.showingPlaylist.relationships.tracks.data = get().ui.showingPlaylist.relationships.tracks.data.concat(res.data);
          if (res.next) {
            getPlaylistTracks(res.next);
          } else {
            get().library.playlists.loadingState = 1;
          }
        });
      }

      getPlaylistTracks(response.relationships.tracks.next);
    },
    async editPlaylistFolder(id: string, name = this.getLz("term.newPlaylist")) {
      get()
        .app.mk.api.music(`/v1/me/library/playlist-folders/${id}`, {
          fetchOptions: {
            method: "PATCH",
            body: JSON.stringify({
              attributes: { name: name },
            }),
          },
        })
        .then(() => {
          get().library.refreshPlaylists(false, false);
        });
    },
    async editPlaylist(id: string, name = this.getLz("term.newPlaylist")) {
      get()
        .app.mk.api.music(`/v1/me/library/playlists/${id}`, {
          fetchOptions: {
            method: "PATCH",
            body: JSON.stringify({
              attributes: { name: name },
            }),
          },
        })
        .then(() => {
          get().library.refreshPlaylists(false, false).then();
        });
    },
    async editPlaylistDescription(id: string, name = this.getLz("term.newPlaylist")) {
      get()
        .app.mk.api.music(`/v1/me/library/playlists/${id}`, {
          fetchOptions: {
            method: "PATCH",
            body: JSON.stringify({
              attributes: { description: name },
            }),
          },
        })
        .then(() => {
          get().library.refreshPlaylists(false, false).then();
        });
    },
    refreshPlaylists: async (localOnly = false, useCachedPlaylists = true) =>
      set(async (state) => {
        const trackMap = state.cfg.advanced.playlistTrackMapping;
        const newListing: MusicKit.Playlists[] = [];
        const trackMapping: Record<string, any> = {};

        if (useCachedPlaylists) {
          const cachedPlaylist = await CiderCache.getCache("library-playlists");
          const cachedTrackMapping = await CiderCache.getCache("library-playlists-tracks");

          if (cachedPlaylist) {
            console.debug("[CiderCache] Using cached playlist");
            state.library.playlists.listing = cachedPlaylist;
            state.library.sortPlaylists();
          } else {
            console.debug("[CiderCache] Playlist has no cache");
          }

          if (cachedTrackMapping) {
            console.debug("[CiderCache] Using cached track mapping");
            state.library.playlists.trackMapping = cachedTrackMapping;
          }
          if (localOnly) {
            return;
          }
        }

        state.library.backgroundNotification.message = this.getLz("notification.buildingPlaylistCache");
        state.library.backgroundNotification.show = true;

        async function deepScan(parent = "p.playlistsroot") {
          console.debug(`scanning ${parent}`);
          // const playlistData = await this.mk.api.music(`/v1/me/library/playlist-folders/${parent}/children/`)
          const playlistData = await MusicKitTools.v3Continuous({
            href: `/v1/me/library/playlist-folders/${parent}/children/`,
          });
          console.log(playlistData);
          await asyncForEach(playlistData, async (playlist: MusicKit.Playlists) => {
            playlist.parent = parent;
            if (playlist.type !== "library-playlist-folders" && typeof playlist.attributes.playParams["versionHash"] !== "undefined") {
              playlist.parent = "p.applemusic";
            }
            playlist.children = [];
            playlist.tracks = [];
            try {
              if (trackMap) {
                const tracks = await get().app.mk.api.music(playlist.href + "/tracks");
                tracks.data.data.forEach((track) => {
                  if (!trackMapping[track.id]) {
                    trackMapping[track.id] = [];
                  }
                  trackMapping[track.id].push(playlist.id);

                  if (typeof track.attributes.playParams.catalogId === "string") {
                    if (!trackMapping[track.attributes.playParams.catalogId]) {
                      trackMapping[track.attributes.playParams.catalogId] = [];
                    }
                    trackMapping[track.attributes.playParams.catalogId].push(playlist.id);
                  }
                });
              }
            } catch (e) {
              console.log(e);
            }
            if (playlist.type === "library-playlist-folders") {
              try {
                await deepScan(playlist.id);
              } catch (e) {
                console.log(e);
              }
            }
            newListing.push(playlist);
          });
        }

        await deepScan();

        state.library.backgroundNotification.show = false;
        state.library.playlists.listing = newListing;
        state.library.sortPlaylists();
        if (trackMap) {
          CiderCache.putCache("library-playlists-tracks", trackMapping);
          state.library.playlists.trackMapping = trackMapping;
        }
        CiderCache.putCache("library-playlists", newListing);
      }),
    sortPlaylists: () =>
      set((state) => {
        state.library.playlists.listing.sort((a, b) => {
          if (a.type === "library-playlist-folders" && b.type !== "library-playlist-folders") {
            return -1;
          } else if (a.type !== "library-playlist-folders" && b.type === "library-playlist-folders") {
            return 1;
          } else {
            return 0;
          }
        });
      }),
    getSocialBadges: (cb = () => {}) =>
      set((state) => {
        try {
          state.app.mk.api.music("/v1/social/badging-map").then((data) => {
            state.library.socialBadges.badgeMap = data.data.results.badgingMap;
            cb(data.data.results.badgingMap);
          });
        } catch {
          state.library.socialBadges.badgeMap = {};
        }
      }),
    showSocialListeningTo: () =>
      set((state) => {
        const contentIds = Object.keys(state.library.socialBadges.badgeMap);
        state.ui.showCollection({ data: state.library.socialBadges.mediaItems }, "Friends Listening To", "albums");
        if (state.library.socialBadges.mediaItemDLState === 1 || state.library.socialBadges.mediaItemDLState === 2) {
          return;
        }
        state.library.socialBadges.mediaItemDLState = 2;
        for (const item of contentIds) {
          try {
            let type = "albums";
            if (item.includes("pl.")) {
              type = "playlists";
            }
            if (item.includes("ra.")) {
              type = "stations";
            }
            const found = await state.app.mk.api.music(`/v1/catalog/${state.app.mk.storefrontId}/${type}/${item}`);
            state.library.socialBadges.mediaItems.push(found.data.data[0]);
          } catch (e) {
            console.log(e);
          }
        }
      }),
    newPlaylistFolder: (name = this.getLz("term.newPlaylistFolder")) =>
      set((state) => {
        state.app.mk.api
          .music("/v1/me/library/playlist-folders/", {
            fetchOptions: {
              method: "POST",
              body: JSON.stringify({
                attributes: { name: name },
              }),
            },
          })
          .then((res) => {
            const playlist = res.data.data[0];
            state.library.playlists.listing.push({
              id: playlist.id,
              attributes: {
                name: playlist.attributes.name,
              },
              type: "library-playlist-folders",
              parent: "p.playlistsroot",
            });
            state.library.sortPlaylists();
            setTimeout(() => {
              state.library.refreshPlaylists(false, false);
            }, 13000);
          });
      }),
    // getArtistInfo(id: string, _isLibrary: boolean) {
    //   this.getArtistFromID(id);
    //   this.getTypeFromID("artist",id,isLibrary,query)
    // },
  },
});
