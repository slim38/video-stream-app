import { createRef, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../redux/hooks"
import { VideoListItem, deleteVideo, setVideoAction, setVideoList } from "../redux/video/video-slice";
import './ResponsiveVideo.css';

export function VideoUpdateScreen() {
    const videoState = useAppSelector((state) => state.video)
    const dispatch = useAppDispatch()
    const titleRef = createRef<HTMLInputElement>();
    const descRef = createRef<HTMLInputElement>();

    const saveEdit = (reqOptions: RequestInit, api: string) => {
        const url = `${api}/${videoState.currentVideo?.id}`
        fetch(url, reqOptions)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    }

    const onSave = () => {
        saveEdit({ 
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
              },          
            body: JSON.stringify({
                title: titleRef.current?.value,
                description: descRef.current?.value
            }),
        }, process.env.REACT_APP_VIDEO_DATA_URL!);
        const newList: VideoListItem[] = videoState.videoList.map((video) => {
            if (video.id === videoState.currentVideo?.id) {
                return {
                    title: titleRef.current?.value ?? video.title,
                    description: descRef.current?.value ?? video.description,
                    id: video.id
                };
            }
            return video;
        })
        dispatch(setVideoList(newList));
        dispatch(setVideoAction('play'));
    }

    const onDelete = () => {
        saveEdit({
            method: 'DELETE',
        }, process.env.REACT_APP_STREAMING_API_URL!)
        dispatch(deleteVideo(videoState.currentVideo?.id!))
    }

    if (titleRef.current && descRef.current && videoState.currentVideo) {
        titleRef.current.value = videoState.currentVideo?.title;
        descRef.current.value = videoState.currentVideo?.description;
    }

    return (
        <div>
            
            <nav className="navbar">
          <ul className="nav-list">
            
            <li>My Video Player</li>
          </ul>
        </nav>
            <h3>Edit Video: {videoState.currentVideo?.title}</h3>
            <input ref={titleRef} type='text' defaultValue={videoState.currentVideo?.title}/>
            <input ref={descRef} type='text' defaultValue={videoState.currentVideo?.description}/>
            <button onClick={onDelete}>Delete Video</button>
            <button onClick={onSave} >Save</button>
        </div>
    )
}