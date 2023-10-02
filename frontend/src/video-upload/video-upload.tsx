import React, { useState, ChangeEvent, createRef } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { setVideoAction, setVideoList } from '../redux/video/video-slice';

const VideoUpload: React.FC = () => {
  const videoState = useAppSelector((state) => state.video)
  const dispatch = useAppDispatch()
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const titleRef = createRef<HTMLInputElement>();
  const descRef = createRef<HTMLInputElement>();

  let uploadErrorRes = false;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log('hey')
    if (event.target.files && event.target.files.length > 0) {
      // Get the selected file from the input
      const file = event.target.files[0];
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      console.log('hey')
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', titleRef.current?.value ?? '');
      formData.append('description', descRef.current?.value ?? '');

      fetch(process.env.REACT_APP_STREAMING_API_URL!, {
        method: 'POST',
        body: formData,
      })
        .then((response) => {
          if (response.status === 201) {
            response.text()
            .then((data) => {
            console.log(data);
            if(data) {
                dispatch(setVideoAction('play'));
                const newList = [...videoState.videoList]
                newList.push({
                  id: data,
                  title: titleRef.current?.value ?? '',
                  description: descRef.current?.value ?? '',
                })
                dispatch(setVideoList(newList)); 
            } 
          })
          } else {
            uploadErrorRes = true;
            response.json()
            .then((res) => {
              setErrorMessage(res.message);
            });
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          uploadErrorRes = error;

        });
    }
  };

  return (
    <div>
      <table>
      <tr><td>Title</td><td><input ref={titleRef} type='text'/></td></tr>
      <tr><td>Description</td><td><input ref={descRef} type='text'/></td></tr>
      <tr><td></td><td><input type='file' onChange={handleFileChange} /></td></tr>
      <tr><td></td><td><button onClick={handleUpload}>Upload</button></td></tr>
      <tr><td>{uploadErrorRes ? 'ERROR: ' + errorMessage: ''}</td></tr>
      </table>
    </div>
  );
};

export default VideoUpload;
