import { MouseEvent, createRef, useEffect } from "react";
import './video-list.css'
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { setChoosenVideo, setVideoAction, setVideoList } from "../redux/video/video-slice";

export function VideoList (){
    const inputRef = createRef<HTMLInputElement>();
    const videoState = useAppSelector((state) => state.video)
    const dispatch = useAppDispatch()
   
    const getVideos = (videoSearchWord?: string) => {
        const path = process.env.REACT_APP_VIDEO_DATA_URL! + (videoSearchWord ? `/search/${videoSearchWord}` : '');
        fetch(path)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            dispatch(setVideoList(data))
            console.log('test');
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    }

    useEffect(() => getVideos(), []);

    const onSearch = () => {
        console.log(inputRef?.current?.value)
        getVideos(inputRef?.current?.value.trim());
    }

    const onVideoSelect = (e: MouseEvent) => {
        console.log(e.currentTarget.id);
        dispatch(setChoosenVideo(e.currentTarget.id));
    }

    const onEdit = (e: MouseEvent) => {
        console.log('Edit!')
        dispatch(setChoosenVideo(e.currentTarget.id));
        dispatch(setVideoAction('edit'));
    }

    const onUploadWish = () => dispatch(setVideoAction('upload'));

    return (
        <div>
            <div>
                <input type='text' ref={inputRef}/>
                <button onClick={onSearch}>search</button>
                <button onClick={onUploadWish}>Upload Video</button>
            </div>
            <div>
                {videoState.videoList.map((item) => <div
                    onClick={onVideoSelect}
                    id={item.id}
                    key={item.id}>{item.title}
                    <button onClick={onEdit}>edit</button>
                </div>)}
            </div>
        </div>
    )
}