import Constants from "../constants";
import Utils from "../utils/Utils";


type NasaSearchResultItemData = {
    nasa_id:string,
    title: string,
    date_created: string,
    center: string,
    description: string, 
}

type NasaSearchResultItemLink = {
    href:string
}

type NasaSearchResultItem = {
    data:NasaSearchResultItemData[],
    links:NasaSearchResultItemLink[],
}

type NasaAPISearchResult = {
    collection: {
        items: NasaSearchResultItem[],
    }
}

export type NasaSearchResult = {
    nasaId:string,
    title:string,
    date:string,
    center:string,
    description:string,
    thumb:string,
}

type NasaAPIImageResult = {
    collection: {
        items: {href:string}[]
    }
}

export type NasaApiImageMetadata = {[key:string]:string}

class NasaImagesApiCls {
    searchImages = async (queryString:string):Promise<NasaSearchResult[]|null> => {
        try {
            const url = `${Constants.NASA_API}/search?media_type=image&q=${encodeURIComponent(queryString)}`;
            console.log("URL = "+url);
            const resp = await fetch(url, {
                method: "GET",
                mode: "cors"
            });

            if (resp.ok) {
                const data = (await resp.json()) as NasaAPISearchResult;

                const items = data.collection.items.map(item => {
                    if (item.data.length > 0) {
                        const d = item.data[0];
                        const imgData:NasaSearchResult = {
                            nasaId: d.nasa_id,
                            title: d.title,
                            date: d.date_created,
                            center: d.center,
                            description: d.description,
                            thumb: item.links.length > 0 ? item.links[0].href : '',
                        };

                        return imgData;
                    }
                    else {
                        return null;
                    }
                });

                const allItems = items.filter(i => i !== null) as NasaSearchResult[];

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

    getImageURLs = async (nasaAssetId:string) => {
        try {
            const resp = await fetch(`${Constants.NASA_API}/asset/${nasaAssetId}`, {
                method: "GET",
                mode: "cors"
            });

            if (resp.ok) {
                const data = (await resp.json()) as NasaAPIImageResult;
                const resolutions:{[key: string]:string} = {};

                //Get all hrefs available for this asset
                data.collection.items.forEach(item => {
                    const href = item.href;
                    const lastDotIndex = href.lastIndexOf(".");
                    const lastTildeIndex = href.lastIndexOf("~");
                    
                    if (lastTildeIndex > 0 && lastDotIndex > lastTildeIndex) {
                        const qualityStr = href.substring(lastTildeIndex+1, lastDotIndex);
                        resolutions[qualityStr] = href;
                    }
                });

                //Fill in resolutions so we can always depend on an image being there
                //even if there isn't an image high enough resolution for our selection
                if (!resolutions.small) {
                    resolutions.small = resolutions.thumb;
                }
                if (!resolutions.medium) {
                    resolutions.medium = resolutions.small;
                }
                if (!resolutions.large) {
                    resolutions.large = resolutions.medium;
                }
                if (!resolutions.orig) {
                    resolutions.orig = resolutions.large;
                }

                return resolutions;
            }
            else {
                console.warn("Error getting image URLs for NASA asset: "+nasaAssetId);
                return null;
            }
        }
        catch(e) {
            console.error("Error getting image URLs for NASA asset: "+nasaAssetId, e);
            return null;
        }
    }

    getImageMetadata = async (nasaAssetId:string):Promise<NasaApiImageMetadata|null> => {
        try {
            const metaResp = await fetch(`${Constants.NASA_API}/metadata/${nasaAssetId}`, {
                method: "GET",
                mode: "cors"
            });

            if (metaResp.ok) {
                const metaRespJson = await metaResp.json();
                const jsonDataResp = await fetch(metaRespJson.location, {
                    method: "GET",
                    mode: "cors"
                });

                if (jsonDataResp.ok) {
                    const metadata = await jsonDataResp.json();

                    return metadata;
                }
                else {
                    console.error("Error getting metadata for NASA asset: "+nasaAssetId);
                }
            }
            else {
                console.error("Error getting metadata URL for NASA asset: "+nasaAssetId);
            }

        } catch (e) {
            console.error("Error getting image metadata for NAS asset: "+nasaAssetId, e);
        }
        return null;
    }
}

const NasaImagesApi = new NasaImagesApiCls();

export default NasaImagesApi;