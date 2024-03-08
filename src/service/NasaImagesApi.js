import Constants from "../constants";
import Utils from "../utils/Utils";

class NasaImagesApiCls {
    constructor() {

    }

    searchImages = async (queryString) => {
        try {
            const url = `${Constants.NASA_API}/search?media_type=image&q=${encodeURIComponent(queryString)}`;
            console.log("URL = "+url);
            const resp = await fetch(url, {
                method: "GET",
                mode: "cors"
            });

            if (resp.ok) {
                const data = await resp.json();

                const items = data.collection.items.map(item => {
                    if (item.data.length > 0) {
                        const d = item.data[0];
                        const imgData = {
                            nasaId: d.nasa_id,
                            title: d.title,
                            date: d.date_created,
                            center: d.center,
                            description: d.description,
                        };

                        if (item.links.length > 0) {
                            imgData.thumb = item.links[0].href;
                        }
                        return imgData;
                    }
                    else {
                        return null;
                    }
                });

                const allItems = items.filter(i => i !== null);

                Utils.shuffleArray(allItems);

                return allItems;
            } else {
                console.warn("Error querying NASA image API for search term: "+queryString);
                return [];
            }
        }
        catch(e) {
            console.error("Error querying NASA image API for search term: "+queryString, e);
            return [];
        }
    }

    getImageURLs = async (nasaAssetId) => {
        try {
            const resp = await fetch(`${Constants.NASA_API}/asset/${nasaAssetId}`, {
                method: "GET",
                mode: "cors"
            });

            if (resp.ok) {
                const data = await resp.json();
                return data.collections.items.map(item => item.href);
            }
            else {
                console.warn("Error getting image URLs for NASA asset: "+nasaAssetId);
                return [];
            }
        }
        catch(e) {
            console.error("Error getting image URLs for NASA asset: "+nasaAssetId, e);
            return [];
        }
    }
}

const NasaImagesApi = new NasaImagesApiCls();

export default NasaImagesApi;