import { FC, SyntheticEvent, useState } from "react";
import NasaImagesApi, { NasaSearchResult } from "../service/NasaImagesApi";
import { CommonScreenProps } from "../components/Navigator";

type ImgSelectProps = {
    nasaItem:NasaSearchResult,
    onSelect:(evt:SyntheticEvent)=>any,
    onRemove:(evt:SyntheticEvent)=>any,
}

const ImgSelect:FC<ImgSelectProps> = ({nasaItem, onSelect, onRemove}) => {

    return (
        <div style={{width:300, height:300, position:'relative'}}>
            <img src={nasaItem.thumb} style={{maxWidth:"100%", maxHeight:"100%", objectFit:'contain'}} alt=""/>
            <button style={{position:'absolute', left:0, top:0, backgroundColor:"#800", padding:10, borderRadius:10}} onClick={onRemove}>
                <span>X</span>
            </button>
            <button style={{position:'absolute', right:0, top:0, backgroundColor:"#080", padding:10, borderRadius:10}} onClick={onSelect}>
                <span>OK</span>
            </button>
        </div>
    )
};

interface NasaTestPageProps extends CommonScreenProps {}

const NasaTestPage:FC<NasaTestPageProps> = () => {
    const [s, setS] = useState("");
    const [images, setImages] = useState<NasaSearchResult[]>([]);
    const [selectedImages, setSelectedImages] = useState<NasaSearchResult[]>([]);

    const submit = async (e:SyntheticEvent) => {
        e.preventDefault();

        if (s && s.length > 0) {
            const results = await NasaImagesApi.searchImages(s);

            console.log(JSON.stringify(results));
            
            const imgThumbs = results;

            if (imgThumbs) {
                setImages(imgThumbs);
            }
            setSelectedImages([]);
        }
    }

    const select = (item:NasaSearchResult) => {
        const newImgs = images.filter(i => i !== item);

        const newSelectedImgs = selectedImages;
        newSelectedImgs.push(item);

        setImages(newImgs);
        setSelectedImages(newSelectedImgs);
    }

    const remove = (item:NasaSearchResult) => {
        const newImgs = images.filter(i => i !== item);

        setImages(newImgs);
    }

    const writeData = () => {
        console.log(JSON.stringify(selectedImages));
    }

    return (
        <div className='column' style={{flex:1, width:'100%', height:'100%'}}>
            
            <form className='column' onSubmit={submit}>
                <div className="row">
                    <input type="text" value={s} onChange={e => setS(e.target.value)} />
                    <button type="submit">Submit</button>
                    <div style={{width:50}} />
                    <span>Saved: {selectedImages.length}</span>
                    <button type="button" onClick={writeData}>Export</button>
                </div>
            </form>
            
            <div className='row' style={{flexWrap:"wrap", width:"100%", overflowY:"auto"}}>
                {images.slice(0,10).map(i => 
                    <ImgSelect nasaItem={i} onSelect={() => {select(i)}} onRemove={() => {remove(i)}}/>
                )}
            </div>
            
        </div>
    );
};

export default NasaTestPage;